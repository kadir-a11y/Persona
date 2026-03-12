import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { engagementMetrics, contentItems, personas } from "@/lib/db/schema";
import { eq, sql, and, gte, desc, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    (session.user as unknown as Record<string, unknown>).isAdmin === true;

  const { searchParams } = new URL(req.url);
  const platformFilter = searchParams.get("platform") || "all";
  const days = parseInt(searchParams.get("days") || "30", 10);

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  // Build base conditions
  const conditions = [gte(engagementMetrics.collectedAt, sinceDate)];

  if (platformFilter !== "all") {
    conditions.push(eq(engagementMetrics.platform, platformFilter));
  }

  // If not admin, restrict to user's own content via personas
  let userPersonaIds: string[] | null = null;
  if (!isAdmin) {
    const userPersonas = await db
      .select({ id: personas.id })
      .from(personas)
      .where(eq(personas.userId, session.user.id));
    userPersonaIds = userPersonas.map((p) => p.id);

    if (userPersonaIds.length === 0) {
      return NextResponse.json({
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        totalReach: 0,
        avgEngagementRate: "0.00",
        platformBreakdown: [],
        topContent: [],
        dailyTrend: [],
      });
    }

    // Get content item IDs for user's personas
    const userContentItems = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(inArray(contentItems.personaId, userPersonaIds));

    const userContentIds = userContentItems.map((c) => c.id);
    if (userContentIds.length === 0) {
      return NextResponse.json({
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        totalReach: 0,
        avgEngagementRate: "0.00",
        platformBreakdown: [],
        topContent: [],
        dailyTrend: [],
      });
    }

    conditions.push(inArray(engagementMetrics.contentItemId, userContentIds));
  }

  const whereClause = and(...conditions);

  // Run all queries in parallel
  const [totals, platformBreakdown, topContent, dailyTrend] =
    await Promise.all([
      // Totals
      db
        .select({
          totalLikes: sql<number>`COALESCE(SUM(${engagementMetrics.likes}), 0)::int`,
          totalComments: sql<number>`COALESCE(SUM(${engagementMetrics.comments}), 0)::int`,
          totalShares: sql<number>`COALESCE(SUM(${engagementMetrics.shares}), 0)::int`,
          totalViews: sql<number>`COALESCE(SUM(${engagementMetrics.views}), 0)::int`,
          totalReach: sql<number>`COALESCE(SUM(${engagementMetrics.reach}), 0)::int`,
          avgEngagementRate: sql<string>`COALESCE(ROUND(AVG(${engagementMetrics.engagementRate}::numeric), 2), 0)::text`,
        })
        .from(engagementMetrics)
        .where(whereClause),

      // Platform breakdown
      db
        .select({
          platform: engagementMetrics.platform,
          likes: sql<number>`COALESCE(SUM(${engagementMetrics.likes}), 0)::int`,
          comments: sql<number>`COALESCE(SUM(${engagementMetrics.comments}), 0)::int`,
          shares: sql<number>`COALESCE(SUM(${engagementMetrics.shares}), 0)::int`,
          views: sql<number>`COALESCE(SUM(${engagementMetrics.views}), 0)::int`,
          reach: sql<number>`COALESCE(SUM(${engagementMetrics.reach}), 0)::int`,
        })
        .from(engagementMetrics)
        .where(whereClause)
        .groupBy(engagementMetrics.platform)
        .orderBy(desc(sql`SUM(${engagementMetrics.likes}) + SUM(${engagementMetrics.comments}) + SUM(${engagementMetrics.shares})`)),

      // Top 10 content by total engagement
      db
        .select({
          contentItemId: engagementMetrics.contentItemId,
          platform: engagementMetrics.platform,
          contentText: contentItems.content,
          personaName: personas.name,
          totalEngagement: sql<number>`(COALESCE(SUM(${engagementMetrics.likes}), 0) + COALESCE(SUM(${engagementMetrics.comments}), 0) + COALESCE(SUM(${engagementMetrics.shares}), 0))::int`,
          likes: sql<number>`COALESCE(SUM(${engagementMetrics.likes}), 0)::int`,
          comments: sql<number>`COALESCE(SUM(${engagementMetrics.comments}), 0)::int`,
          shares: sql<number>`COALESCE(SUM(${engagementMetrics.shares}), 0)::int`,
          views: sql<number>`COALESCE(SUM(${engagementMetrics.views}), 0)::int`,
          avgRate: sql<string>`COALESCE(ROUND(AVG(${engagementMetrics.engagementRate}::numeric), 2), 0)::text`,
        })
        .from(engagementMetrics)
        .leftJoin(contentItems, eq(engagementMetrics.contentItemId, contentItems.id))
        .leftJoin(personas, eq(contentItems.personaId, personas.id))
        .where(whereClause)
        .groupBy(
          engagementMetrics.contentItemId,
          engagementMetrics.platform,
          contentItems.content,
          personas.name,
        )
        .orderBy(
          desc(
            sql`SUM(${engagementMetrics.likes}) + SUM(${engagementMetrics.comments}) + SUM(${engagementMetrics.shares})`,
          ),
        )
        .limit(10),

      // Daily trend
      db
        .select({
          date: sql<string>`DATE(${engagementMetrics.collectedAt})::text`,
          likes: sql<number>`COALESCE(SUM(${engagementMetrics.likes}), 0)::int`,
          comments: sql<number>`COALESCE(SUM(${engagementMetrics.comments}), 0)::int`,
          shares: sql<number>`COALESCE(SUM(${engagementMetrics.shares}), 0)::int`,
          views: sql<number>`COALESCE(SUM(${engagementMetrics.views}), 0)::int`,
          reach: sql<number>`COALESCE(SUM(${engagementMetrics.reach}), 0)::int`,
        })
        .from(engagementMetrics)
        .where(whereClause)
        .groupBy(sql`DATE(${engagementMetrics.collectedAt})`)
        .orderBy(sql`DATE(${engagementMetrics.collectedAt})`),
    ]);

  const summary = totals[0] ?? {
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalViews: 0,
    totalReach: 0,
    avgEngagementRate: "0.00",
  };

  return NextResponse.json({
    ...summary,
    platformBreakdown,
    topContent,
    dailyTrend,
  });
}
