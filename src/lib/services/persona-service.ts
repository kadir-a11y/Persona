import { db } from "@/lib/db";
import { personas, personaTags, tags, personaRoles, roles, socialAccounts, forumAccounts, emailAccounts } from "@/lib/db/schema";
import { eq, and, desc, ilike, sql, inArray } from "drizzle-orm";
import type { PersonaCreateInput, PersonaUpdateInput } from "@/lib/validators/persona";

export async function getPersonas(userId: string, search?: string, isAdmin = false) {
  const conditions = [];
  if (!isAdmin) {
    conditions.push(eq(personas.userId, userId));
  }
  if (search) {
    conditions.push(ilike(personas.name, `%${search}%`));
  }

  const result = await db
    .select()
    .from(personas)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(personas.createdAt));

  return result;
}

export async function getPersonaById(id: string, userId: string, isAdmin = false) {
  const condition = isAdmin
    ? eq(personas.id, id)
    : and(eq(personas.id, id), eq(personas.userId, userId));
  const [persona] = await db
    .select()
    .from(personas)
    .where(condition)
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
      isVerified: data.isVerified,
    })
    .returning();

  return persona;
}

export async function updatePersona(
  id: string,
  userId: string,
  data: PersonaUpdateInput,
  isAdmin = false
) {
  const condition = isAdmin
    ? eq(personas.id, id)
    : and(eq(personas.id, id), eq(personas.userId, userId));
  const [persona] = await db
    .update(personas)
    .set({
      ...data,
      avatarUrl: data.avatarUrl || null,
      updatedAt: new Date(),
    })
    .where(condition)
    .returning();

  return persona;
}

export async function deletePersona(id: string, userId: string, isAdmin = false) {
  const condition = isAdmin
    ? eq(personas.id, id)
    : and(eq(personas.id, id), eq(personas.userId, userId));
  const [persona] = await db
    .delete(personas)
    .where(condition)
    .returning();

  return persona;
}

export async function checkDuplicatePersonaName(name: string, excludeId?: string) {
  const conditions = [ilike(personas.name, name.trim())];
  if (excludeId) {
    conditions.push(sql`${personas.id} != ${excludeId}`);
  }
  const result = await db
    .select({ id: personas.id, name: personas.name })
    .from(personas)
    .where(and(...conditions))
    .limit(5);

  return result;
}

export async function getPersonaCount(userId: string, isAdmin = false) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(personas)
    .where(isAdmin ? undefined : eq(personas.userId, userId));

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

export async function getPersonasWithTags(userId: string, isAdmin = false) {
  const allPersonas = await getPersonas(userId, undefined, isAdmin);

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

  // Fetch roles for all personas
  const allPersonaRoles = await db
    .select({
      personaId: personaRoles.personaId,
      role: roles,
    })
    .from(personaRoles)
    .innerJoin(roles, eq(personaRoles.roleId, roles.id))
    .where(inArray(personaRoles.personaId, personaIds));

  const rolesByPersona = new Map<string, typeof roles.$inferSelect[]>();
  for (const pr of allPersonaRoles) {
    const existing = rolesByPersona.get(pr.personaId) || [];
    existing.push(pr.role);
    rolesByPersona.set(pr.personaId, existing);
  }

  // Fetch account counts for all personas
  const socialCounts = await db
    .select({
      personaId: socialAccounts.personaId,
      count: sql<number>`count(*)::int`,
    })
    .from(socialAccounts)
    .where(inArray(socialAccounts.personaId, personaIds))
    .groupBy(socialAccounts.personaId);

  const forumCounts = await db
    .select({
      personaId: forumAccounts.personaId,
      count: sql<number>`count(*)::int`,
    })
    .from(forumAccounts)
    .where(inArray(forumAccounts.personaId, personaIds))
    .groupBy(forumAccounts.personaId);

  const emailCounts = await db
    .select({
      personaId: emailAccounts.personaId,
      count: sql<number>`count(*)::int`,
    })
    .from(emailAccounts)
    .where(inArray(emailAccounts.personaId, personaIds))
    .groupBy(emailAccounts.personaId);

  const socialCountMap = new Map(socialCounts.map((s) => [s.personaId, s.count]));
  const forumCountMap = new Map(forumCounts.map((f) => [f.personaId, f.count]));
  const emailCountMap = new Map(emailCounts.map((e) => [e.personaId, e.count]));

  return allPersonas.map((p) => ({
    ...p,
    tags: tagsByPersona.get(p.id) || [],
    roles: rolesByPersona.get(p.id) || [],
    socialAccountCount: socialCountMap.get(p.id) || 0,
    forumAccountCount: forumCountMap.get(p.id) || 0,
    emailAccountCount: emailCountMap.get(p.id) || 0,
  }));
}
