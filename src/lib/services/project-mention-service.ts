import { db } from "@/lib/db";
import { projectMentions } from "@/lib/db/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import type { MentionCreateInput, MentionUpdateInput } from "@/lib/validators/project";
import * as timelineService from "./project-timeline-service";
import { calculateSeverityScore } from "./project-service";

export async function getMentions(
  projectId: string,
  filters?: {
    platform?: string;
    sentiment?: string;
    responseStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(projectMentions.projectId, projectId)];

  if (filters?.platform) conditions.push(eq(projectMentions.platform, filters.platform));
  if (filters?.sentiment) conditions.push(eq(projectMentions.sentiment, filters.sentiment));
  if (filters?.responseStatus) conditions.push(eq(projectMentions.responseStatus, filters.responseStatus));
  if (filters?.search) conditions.push(ilike(projectMentions.content, `%${filters.search}%`));

  return db
    .select()
    .from(projectMentions)
    .where(and(...conditions))
    .orderBy(desc(projectMentions.detectedAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);
}

export async function getMentionById(mentionId: string) {
  const [mention] = await db
    .select()
    .from(projectMentions)
    .where(eq(projectMentions.id, mentionId))
    .limit(1);

  return mention ?? null;
}

export async function addMention(projectId: string, data: MentionCreateInput) {
  const [mention] = await db
    .insert(projectMentions)
    .values({
      projectId,
      platform: data.platform,
      sourceUrl: data.sourceUrl || null,
      sourceAuthor: data.sourceAuthor,
      content: data.content,
      sentiment: data.sentiment,
      reachEstimate: data.reachEstimate,
      engagementCount: data.engagementCount,
      requiresResponse: data.requiresResponse,
      responseStatus: data.requiresResponse ? "pending" : "not_needed",
      detectedAt: data.detectedAt ? new Date(data.detectedAt) : new Date(),
    })
    .returning();

  await timelineService.addSystemEvent(
    projectId,
    "mention_detected",
    `Yeni bahsetme: ${data.platform}`,
    data.content.substring(0, 200),
    { platform: data.platform, sentiment: data.sentiment, mentionId: mention.id }
  );

  // Severity score yeniden hesapla
  await calculateSeverityScore(projectId);

  return mention;
}

export async function updateMention(mentionId: string, data: MentionUpdateInput) {
  const { detectedAt, sourceUrl, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (detectedAt) updateData.detectedAt = new Date(detectedAt);
  if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl || null;

  const [mention] = await db
    .update(projectMentions)
    .set(updateData)
    .where(eq(projectMentions.id, mentionId))
    .returning();

  return mention ?? null;
}

export async function deleteMention(mentionId: string) {
  const [mention] = await db
    .delete(projectMentions)
    .where(eq(projectMentions.id, mentionId))
    .returning();

  return mention ?? null;
}

export async function assignMentionResponse(mentionId: string, personaId: string) {
  const [mention] = await db
    .update(projectMentions)
    .set({
      assignedPersonaId: personaId,
      responseStatus: "assigned",
      updatedAt: new Date(),
    })
    .where(eq(projectMentions.id, mentionId))
    .returning();

  return mention ?? null;
}

export async function markAsResponded(mentionId: string, contentItemId: string) {
  const [mention] = await db
    .update(projectMentions)
    .set({
      respondedContentId: contentItemId,
      responseStatus: "responded",
      updatedAt: new Date(),
    })
    .where(eq(projectMentions.id, mentionId))
    .returning();

  return mention ?? null;
}

export async function getMentionStats(projectId: string) {
  // Günlük trend
  const dailyTrend = await db
    .select({
      date: sql<string>`date_trunc('day', ${projectMentions.detectedAt})::date::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(sql`date_trunc('day', ${projectMentions.detectedAt})`)
    .orderBy(sql`date_trunc('day', ${projectMentions.detectedAt})`);

  // Platform dağılımı
  const platformDistribution = await db
    .select({
      platform: projectMentions.platform,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(projectMentions.platform);

  // Sentiment dağılımı
  const sentimentDistribution = await db
    .select({
      sentiment: projectMentions.sentiment,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(projectMentions.sentiment);

  // Yanıt bekleyen
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(
      and(
        eq(projectMentions.projectId, projectId),
        eq(projectMentions.responseStatus, "pending")
      )
    );

  // Sentiment trend (günlük sentiment dağılımı)
  const sentimentTrend = await db
    .select({
      date: sql<string>`date_trunc('day', ${projectMentions.detectedAt})::date::text`,
      sentiment: projectMentions.sentiment,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(sql`date_trunc('day', ${projectMentions.detectedAt})`, projectMentions.sentiment)
    .orderBy(sql`date_trunc('day', ${projectMentions.detectedAt})`);

  return {
    dailyTrend,
    platformDistribution,
    sentimentDistribution,
    pendingResponseCount: pendingCount?.count ?? 0,
    sentimentTrend,
  };
}

export async function bulkAddMentions(projectId: string, mentions: MentionCreateInput[]) {
  const values = mentions.map((m) => ({
    projectId,
    platform: m.platform,
    sourceUrl: m.sourceUrl || null,
    sourceAuthor: m.sourceAuthor,
    content: m.content,
    sentiment: m.sentiment,
    reachEstimate: m.reachEstimate,
    engagementCount: m.engagementCount,
    requiresResponse: m.requiresResponse,
    responseStatus: m.requiresResponse ? "pending" as const : "not_needed" as const,
    detectedAt: m.detectedAt ? new Date(m.detectedAt) : new Date(),
  }));

  const inserted = await db.insert(projectMentions).values(values).returning();

  await timelineService.addSystemEvent(
    projectId,
    "mention_detected",
    `${inserted.length} yeni bahsetme eklendi`,
    undefined,
    { count: inserted.length }
  );

  await calculateSeverityScore(projectId);

  return inserted;
}
