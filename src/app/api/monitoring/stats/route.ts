import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { discoveredItems, monitoredTopics, monitoringSources } from "@/lib/db/schema";
import { eq, and, gte, inArray, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  // Get user's topic IDs for authorization (skip for admins)
  let userTopicIds: string[] | null = null;
  if (!isAdmin) {
    const userTopics = await db
      .select({ id: monitoredTopics.id })
      .from(monitoredTopics)
      .where(eq(monitoredTopics.userId, session.user.id));

    userTopicIds = userTopics.map((t) => t.id);
    if (userTopicIds.length === 0) {
      return NextResponse.json({
        activeTopics: 0,
        todayDiscovered: 0,
        todayAutoPosted: 0,
        pendingApproval: 0,
        last7DaysData: [],
        sourceDistribution: [],
        scoreDistribution: [],
      });
    }
  }

  const topicCondition = userTopicIds
    ? [inArray(discoveredItems.topicId, userTopicIds)]
    : [];

  const topicTableCondition = userTopicIds
    ? eq(monitoredTopics.userId, session.user.id)
    : undefined;

  // Active topics count
  const [activeTopicsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(monitoredTopics)
    .where(
      topicTableCondition
        ? and(eq(monitoredTopics.isActive, true), topicTableCondition)
        : eq(monitoredTopics.isActive, true)
    );

  // Today start (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Today discovered count
  const [todayDiscoveredResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discoveredItems)
    .where(and(gte(discoveredItems.discoveredAt, todayStart), ...topicCondition));

  // Today auto posted count
  const [todayAutoPostedResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discoveredItems)
    .where(
      and(
        eq(discoveredItems.status, "auto_posted"),
        gte(discoveredItems.discoveredAt, todayStart),
        ...topicCondition
      )
    );

  // Pending approval count
  const [pendingApprovalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discoveredItems)
    .where(and(eq(discoveredItems.status, "pending_approval"), ...topicCondition));

  // Last 7 days data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const last7DaysRaw = await db
    .select({
      date: sql<string>`to_char(${discoveredItems.discoveredAt}::date, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(discoveredItems)
    .where(and(gte(discoveredItems.discoveredAt, sevenDaysAgo), ...topicCondition))
    .groupBy(sql`${discoveredItems.discoveredAt}::date`)
    .orderBy(sql`${discoveredItems.discoveredAt}::date`);

  // Fill in missing days
  const last7DaysData: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const found = last7DaysRaw.find((r) => r.date === dateStr);
    last7DaysData.push({ date: dateStr, count: found?.count ?? 0 });
  }

  // Source distribution
  const sourceDistribution = await db
    .select({
      sourceType: monitoringSources.sourceType,
      count: sql<number>`count(*)::int`,
    })
    .from(discoveredItems)
    .innerJoin(monitoringSources, eq(discoveredItems.sourceId, monitoringSources.id))
    .where(topicCondition.length > 0 ? and(...topicCondition) : undefined)
    .groupBy(monitoringSources.sourceType);

  // Score distribution
  const scoreDistribution = await db
    .select({
      range: sql<string>`
        CASE
          WHEN ${discoveredItems.relevanceScore} BETWEEN 0 AND 19 THEN '0-19'
          WHEN ${discoveredItems.relevanceScore} BETWEEN 20 AND 49 THEN '20-49'
          WHEN ${discoveredItems.relevanceScore} BETWEEN 50 AND 79 THEN '50-79'
          WHEN ${discoveredItems.relevanceScore} BETWEEN 80 AND 100 THEN '80-100'
          ELSE 'unknown'
        END`,
      count: sql<number>`count(*)::int`,
    })
    .from(discoveredItems)
    .where(topicCondition.length > 0 ? and(...topicCondition) : undefined)
    .groupBy(sql`
      CASE
        WHEN ${discoveredItems.relevanceScore} BETWEEN 0 AND 19 THEN '0-19'
        WHEN ${discoveredItems.relevanceScore} BETWEEN 20 AND 49 THEN '20-49'
        WHEN ${discoveredItems.relevanceScore} BETWEEN 50 AND 79 THEN '50-79'
        WHEN ${discoveredItems.relevanceScore} BETWEEN 80 AND 100 THEN '80-100'
        ELSE 'unknown'
      END
    `);

  // Ensure all score buckets exist
  const scoreBuckets = ["0-19", "20-49", "50-79", "80-100"];
  const normalizedScoreDistribution = scoreBuckets.map((range) => {
    const found = scoreDistribution.find((s) => s.range === range);
    return { range, count: found?.count ?? 0 };
  });

  return NextResponse.json({
    activeTopics: activeTopicsResult.count,
    todayDiscovered: todayDiscoveredResult.count,
    todayAutoPosted: todayAutoPostedResult.count,
    pendingApproval: pendingApprovalResult.count,
    last7DaysData,
    sourceDistribution,
    scoreDistribution: normalizedScoreDistribution,
  });
}
