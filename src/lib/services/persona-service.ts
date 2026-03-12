import { db } from "@/lib/db";
import { personas, personaTags, tags, socialAccounts, forumAccounts, emailAccounts } from "@/lib/db/schema";
import { eq, and, desc, ilike, sql, inArray } from "drizzle-orm";
import type { PersonaCreateInput, PersonaUpdateInput } from "@/lib/validators/persona";

export async function getPersonas(userId: string, search?: string) {
  const conditions = [eq(personas.userId, userId)];
  if (search) {
    conditions.push(ilike(personas.name, `%${search}%`));
  }

  const result = await db
    .select()
    .from(personas)
    .where(and(...conditions))
    .orderBy(desc(personas.createdAt));

  return result;
}

export async function getPersonaById(id: string, userId: string) {
  const [persona] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.id, id), eq(personas.userId, userId)))
    .limit(1);

  if (!persona) return null;

  const personaTagsList = await db
    .select({ tag: tags })
    .from(personaTags)
    .innerJoin(tags, eq(personaTags.tagId, tags.id))
    .where(eq(personaTags.personaId, id));

  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.personaId, id));

  const forums = await db
    .select()
    .from(forumAccounts)
    .where(eq(forumAccounts.personaId, id));

  const emails = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.personaId, id));

  return {
    ...persona,
    tags: personaTagsList.map((pt) => pt.tag),
    socialAccounts: accounts,
    forumAccounts: forums,
    emailAccounts: emails,
  };
}

export async function createPersona(userId: string, data: PersonaCreateInput) {
  const [persona] = await db
    .insert(personas)
    .values({
      userId,
      name: data.name,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl || null,
      personalityTraits: data.personalityTraits,
      interests: data.interests,
      behavioralPatterns: data.behavioralPatterns,
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language,
      timezone: data.timezone,
      activeHoursStart: data.activeHoursStart,
      activeHoursEnd: data.activeHoursEnd,
      maxPostsPerDay: data.maxPostsPerDay,
      isActive: data.isActive,
    })
    .returning();

  return persona;
}

export async function updatePersona(
  id: string,
  userId: string,
  data: PersonaUpdateInput
) {
  const [persona] = await db
    .update(personas)
    .set({
      ...data,
      avatarUrl: data.avatarUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(personas.id, id), eq(personas.userId, userId)))
    .returning();

  return persona;
}

export async function deletePersona(id: string, userId: string) {
  const [persona] = await db
    .delete(personas)
    .where(and(eq(personas.id, id), eq(personas.userId, userId)))
    .returning();

  return persona;
}

export async function getPersonaCount(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(personas)
    .where(eq(personas.userId, userId));

  return result.count;
}

export async function setPersonaTags(personaId: string, tagIds: string[]) {
  await db.delete(personaTags).where(eq(personaTags.personaId, personaId));

  if (tagIds.length > 0) {
    await db.insert(personaTags).values(
      tagIds.map((tagId) => ({
        personaId,
        tagId,
      }))
    );
  }
}

export async function getPersonasWithTags(userId: string) {
  const allPersonas = await getPersonas(userId);

  const personaIds = allPersonas.map((p) => p.id);
  if (personaIds.length === 0) return [];

  const allPersonaTags = await db
    .select({
      personaId: personaTags.personaId,
      tag: tags,
    })
    .from(personaTags)
    .innerJoin(tags, eq(personaTags.tagId, tags.id))
    .where(inArray(personaTags.personaId, personaIds));

  const tagsByPersona = new Map<string, typeof tags.$inferSelect[]>();
  for (const pt of allPersonaTags) {
    const existing = tagsByPersona.get(pt.personaId) || [];
    existing.push(pt.tag);
    tagsByPersona.set(pt.personaId, existing);
  }

  return allPersonas.map((p) => ({
    ...p,
    tags: tagsByPersona.get(p.id) || [],
  }));
}
