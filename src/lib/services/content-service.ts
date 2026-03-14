import { db } from "@/lib/db";
import { contentItems, personas } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import type { ContentItemCreateInput, ContentItemUpdateInput } from "@/lib/validators/content";

export async function getContentItems(
  userId: string,
  filters?: { status?: string; personaId?: string; platform?: string },
  isAdmin = false
) {
  const result = await db
    .select({
      contentItem: contentItems,
      personaName: personas.name,
      personaAvatar: personas.avatarUrl,
    })
    .from(contentItems)
    .innerJoin(personas, eq(contentItems.personaId, personas.id))
    .where(
      and(
        isAdmin ? undefined : eq(personas.userId, userId),
        filters?.status ? eq(contentItems.status, filters.status) : undefined,
        filters?.personaId ? eq(contentItems.personaId, filters.personaId) : undefined,
        filters?.platform ? eq(contentItems.platform, filters.platform) : undefined
      )
    )
    .orderBy(desc(contentItems.createdAt));

  return result;
}

export async function getContentItemById(id: string, userId: string, isAdmin = false) {
  const [item] = await db
    .select({
      contentItem: contentItems,
      personaName: personas.name,
    })
    .from(contentItems)
    .innerJoin(personas, eq(contentItems.personaId, personas.id))
    .where(isAdmin ? eq(contentItems.id, id) : and(eq(contentItems.id, id), eq(personas.userId, userId)))
    .limit(1);

  return item || null;
}

export async function createContentItem(data: ContentItemCreateInput) {
  const [item] = await db
    .insert(contentItems)
    .values({
      personaId: data.personaId,
      campaignId: data.campaignId,
      platform: data.platform,
      contentType: data.contentType,
      content: data.content,
      mediaUrls: data.mediaUrls,
      status: data.status,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      aiGenerated: data.aiGenerated,
      aiPrompt: data.aiPrompt,
      aiModel: data.aiModel,
    })
    .returning();

  return item;
}

export async function createBulkContentItems(
  personaIds: string[],
  data: {
    platform: string;
    contentType?: string;
    content: string;
    scheduledAt?: string;
  }
) {
  const items = await db
    .insert(contentItems)
    .values(
      personaIds.map((personaId) => ({
        personaId,
        platform: data.platform,
        contentType: data.contentType || "post",
        content: data.content,
        status: "draft" as const,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      }))
    )
    .returning();

  return items;
}

export async function updateContentItem(
  id: string,
  data: ContentItemUpdateInput
) {
  const [item] = await db
    .update(contentItems)
    .set({
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(contentItems.id, id))
    .returning();

  return item;
}

export async function deleteContentItem(id: string) {
  const [item] = await db
    .delete(contentItems)
    .where(eq(contentItems.id, id))
    .returning();

  return item;
}

export async function getContentStats(userId: string, isAdmin = false) {
  const stats = await db
    .select({
      status: contentItems.status,
      count: sql<number>`count(*)::int`,
    })
    .from(contentItems)
    .innerJoin(personas, eq(contentItems.personaId, personas.id))
    .where(isAdmin ? undefined : eq(personas.userId, userId))
    .groupBy(contentItems.status);

  return stats;
}
