import { db } from "@/lib/db";
import { personas, personaTags, tags, personaRoles, roles, socialAccounts } from "@/lib/db/schema";
import { eq, and, inArray, sql, gte } from "drizzle-orm";

interface PersonaFilterCriteria {
  country?: string;
  language?: string;
  tagIds?: string[];
  roleIds?: string[];
  interests?: string[];
  gender?: string;
  isActive?: boolean;
  hasAccountOnPlatform?: string;
  personaIds?: string[];
  minInfluenceScore?: number;
  isFavorite?: boolean;
}

export async function filterPersonas(
  userId: string,
  criteria: PersonaFilterCriteria,
  isAdmin = false
) {
  // Base query: get all personas for user
  const conditions = [];
  if (!isAdmin) {
    conditions.push(eq(personas.userId, userId));
  }
  if (criteria.country) conditions.push(eq(personas.country, criteria.country));
  if (criteria.language) conditions.push(eq(personas.language, criteria.language));
  if (criteria.gender) conditions.push(eq(personas.gender, criteria.gender));
  if (criteria.isActive !== undefined) conditions.push(eq(personas.isActive, criteria.isActive));
  if (criteria.minInfluenceScore !== undefined) conditions.push(gte(personas.influenceScore, criteria.minInfluenceScore));
  if (criteria.isFavorite !== undefined) conditions.push(eq(personas.isFavorite, criteria.isFavorite));

  let result = await db
    .select()
    .from(personas)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // If specific personaIds provided, filter
  if (criteria.personaIds && criteria.personaIds.length > 0) {
    const idSet = new Set(criteria.personaIds);
    result = result.filter((p) => idSet.has(p.id));
  }

  if (result.length === 0) return [];

  const personaIds = result.map((p) => p.id);

  // Filter by tags
  if (criteria.tagIds && criteria.tagIds.length > 0) {
    const matchingPersonaTags = await db
      .select({ personaId: personaTags.personaId })
      .from(personaTags)
      .where(
        and(
          inArray(personaTags.personaId, personaIds),
          inArray(personaTags.tagId, criteria.tagIds)
        )
      );
    const matchingIds = new Set(matchingPersonaTags.map((pt) => pt.personaId));
    result = result.filter((p) => matchingIds.has(p.id));
  }

  // Filter by roles
  if (criteria.roleIds && criteria.roleIds.length > 0) {
    const matchingPersonaRoles = await db
      .select({ personaId: personaRoles.personaId })
      .from(personaRoles)
      .where(
        and(
          inArray(personaRoles.personaId, result.map((p) => p.id)),
          inArray(personaRoles.roleId, criteria.roleIds)
        )
      );
    const matchingIds = new Set(matchingPersonaRoles.map((pr) => pr.personaId));
    result = result.filter((p) => matchingIds.has(p.id));
  }

  // Filter by interests (jsonb array contains)
  if (criteria.interests && criteria.interests.length > 0) {
    result = result.filter((p) => {
      const personaInterests = (p.interests as string[]) || [];
      return criteria.interests!.some((interest) =>
        personaInterests.some((pi) => pi.toLowerCase().includes(interest.toLowerCase()))
      );
    });
  }

  // Filter by platform account
  if (criteria.hasAccountOnPlatform && result.length > 0) {
    const accountsOnPlatform = await db
      .select({ personaId: socialAccounts.personaId })
      .from(socialAccounts)
      .where(
        and(
          inArray(socialAccounts.personaId, result.map((p) => p.id)),
          eq(socialAccounts.platform, criteria.hasAccountOnPlatform)
        )
      );
    const matchingIds = new Set(accountsOnPlatform.map((a) => a.personaId));
    result = result.filter((p) => matchingIds.has(p.id));
  }

  // Enrich with tags
  if (result.length === 0) return [];

  const finalIds = result.map((p) => p.id);
  const allTags = await db
    .select({ personaId: personaTags.personaId, tag: tags })
    .from(personaTags)
    .innerJoin(tags, eq(personaTags.tagId, tags.id))
    .where(inArray(personaTags.personaId, finalIds));

  const tagsByPersona = new Map<string, typeof tags.$inferSelect[]>();
  for (const pt of allTags) {
    const existing = tagsByPersona.get(pt.personaId) || [];
    existing.push(pt.tag);
    tagsByPersona.set(pt.personaId, existing);
  }

  const allRoles = await db
    .select({ personaId: personaRoles.personaId, role: roles })
    .from(personaRoles)
    .innerJoin(roles, eq(personaRoles.roleId, roles.id))
    .where(inArray(personaRoles.personaId, finalIds));

  const rolesByPersona = new Map<string, typeof roles.$inferSelect[]>();
  for (const pr of allRoles) {
    const existing = rolesByPersona.get(pr.personaId) || [];
    existing.push(pr.role);
    rolesByPersona.set(pr.personaId, existing);
  }

  return result.map((p) => ({
    ...p,
    tags: tagsByPersona.get(p.id) || [],
    roles: rolesByPersona.get(p.id) || [],
  }));
}

export async function getFilterOptions(userId: string, isAdmin = false) {
  const condition = isAdmin ? undefined : eq(personas.userId, userId);

  const countries = await db
    .selectDistinct({ country: personas.country })
    .from(personas)
    .where(condition);

  const languages = await db
    .selectDistinct({ language: personas.language })
    .from(personas)
    .where(condition);

  const allTags = await db
    .select()
    .from(tags)
    .where(isAdmin ? undefined : eq(tags.userId, userId));

  const allRoles = await db
    .select()
    .from(roles)
    .where(isAdmin ? undefined : eq(roles.userId, userId));

  return {
    countries: countries.map((c) => c.country).filter(Boolean) as string[],
    languages: languages.map((l) => l.language).filter(Boolean) as string[],
    tags: allTags,
    roles: allRoles,
  };
}
