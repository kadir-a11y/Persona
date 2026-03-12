import { db } from "@/lib/db";
import {
  projectTeam,
  projects,
  personas,
  roles,
  roleCategories,
  personaRoles,
} from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import * as timelineService from "./project-timeline-service";

// Projenin dillerini al
async function getProjectLanguages(projectId: string): Promise<string[]> {
  const [project] = await db
    .select({ languages: projects.languages })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return (project?.languages as string[]) ?? ["tr"];
}

export async function getProjectTeam(projectId: string) {
  const languages = await getProjectLanguages(projectId);

  const assignments = await db
    .select()
    .from(projectTeam)
    .where(eq(projectTeam.projectId, projectId));

  // Her atama için detay bilgileri ekle — proje dillerine göre filtrelenmiş
  const enriched = await Promise.all(
    assignments.map(async (a) => {
      if (a.assignmentType === "persona" && a.personaId) {
        const [persona] = await db
          .select({ id: personas.id, name: personas.name, displayName: personas.displayName, avatarUrl: personas.avatarUrl, language: personas.language })
          .from(personas)
          .where(eq(personas.id, a.personaId))
          .limit(1);
        return { ...a, persona, resolvedCount: persona ? 1 : 0 };
      }

      if (a.assignmentType === "role" && a.roleId) {
        const [role] = await db
          .select({ id: roles.id, name: roles.name, color: roles.color })
          .from(roles)
          .where(eq(roles.id, a.roleId))
          .limit(1);

        const resolvedPersonas = await resolvePersonasByRole(a.roleId, languages);
        return { ...a, role, resolvedPersonas, resolvedCount: resolvedPersonas.length };
      }

      if (a.assignmentType === "role_category" && a.roleCategoryId) {
        const [category] = await db
          .select({ id: roleCategories.id, name: roleCategories.name, color: roleCategories.color })
          .from(roleCategories)
          .where(eq(roleCategories.id, a.roleCategoryId))
          .limit(1);

        const resolvedPersonas = await resolvePersonasByCategory(a.roleCategoryId, languages);
        return { ...a, roleCategory: category, resolvedPersonas, resolvedCount: resolvedPersonas.length };
      }

      return { ...a, resolvedCount: 0 };
    })
  );

  return enriched;
}

export async function addTeamMember(
  projectId: string,
  data: {
    assignmentType: string;
    personaId?: string;
    roleId?: string;
    roleCategoryId?: string;
    teamRole: string;
    notes?: string;
  }
) {
  const [assignment] = await db
    .insert(projectTeam)
    .values({
      projectId,
      assignmentType: data.assignmentType,
      personaId: data.personaId,
      roleId: data.roleId,
      roleCategoryId: data.roleCategoryId,
      teamRole: data.teamRole,
      notes: data.notes,
    })
    .returning();

  // Atama detayını belirle
  let label = "";
  if (data.assignmentType === "persona" && data.personaId) {
    const [p] = await db.select({ name: personas.name }).from(personas).where(eq(personas.id, data.personaId)).limit(1);
    label = p?.name ?? "Persona";
  } else if (data.assignmentType === "role" && data.roleId) {
    const [r] = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, data.roleId)).limit(1);
    label = `Rol: ${r?.name ?? "Rol"}`;
  } else if (data.assignmentType === "role_category" && data.roleCategoryId) {
    const [c] = await db.select({ name: roleCategories.name }).from(roleCategories).where(eq(roleCategories.id, data.roleCategoryId)).limit(1);
    label = `Kategori: ${c?.name ?? "Kategori"}`;
  }

  await timelineService.addSystemEvent(
    projectId,
    "team_assigned",
    `Ekip ataması: ${label}`,
    `Görev: ${data.teamRole}`,
    { assignmentType: data.assignmentType, teamRole: data.teamRole }
  );

  return assignment;
}

export async function removeTeamMember(teamId: string) {
  const [removed] = await db
    .delete(projectTeam)
    .where(eq(projectTeam.id, teamId))
    .returning();

  return removed ?? null;
}

export async function updateTeamRole(teamId: string, newTeamRole: string) {
  const [updated] = await db
    .update(projectTeam)
    .set({ teamRole: newTeamRole })
    .where(eq(projectTeam.id, teamId))
    .returning();

  return updated ?? null;
}

// Bir role sahip tüm aktif personaları döndür (dil filtresiz - getProjectTeam'de kullanılır)
async function resolvePersonasByRole(roleId: string, languages?: string[]) {
  const personaIds = await db
    .selectDistinct({ personaId: personaRoles.personaId })
    .from(personaRoles)
    .where(eq(personaRoles.roleId, roleId));

  if (personaIds.length === 0) return [];

  const conditions = [
    inArray(personas.id, personaIds.map((p) => p.personaId)),
    eq(personas.isActive, true),
  ];
  if (languages?.length) {
    conditions.push(inArray(personas.language, languages));
  }

  return db
    .select({ id: personas.id, name: personas.name, displayName: personas.displayName, avatarUrl: personas.avatarUrl, language: personas.language })
    .from(personas)
    .where(and(...conditions));
}

// Bir kategorideki tüm rollere sahip tüm aktif personaları döndür
async function resolvePersonasByCategory(categoryId: string, languages?: string[]) {
  const categoryRoles = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.categoryId, categoryId));

  if (categoryRoles.length === 0) return [];

  const personaIds = await db
    .selectDistinct({ personaId: personaRoles.personaId })
    .from(personaRoles)
    .where(inArray(personaRoles.roleId, categoryRoles.map((r) => r.id)));

  if (personaIds.length === 0) return [];

  const conditions = [
    inArray(personas.id, personaIds.map((p) => p.personaId)),
    eq(personas.isActive, true),
  ];
  if (languages?.length) {
    conditions.push(inArray(personas.language, languages));
  }

  return db
    .select({ id: personas.id, name: personas.name, displayName: personas.displayName, avatarUrl: personas.avatarUrl, language: personas.language })
    .from(personas)
    .where(and(...conditions));
}

// Projedeki tüm atamaları çözümleyerek benzersiz persona listesi döndür
// Proje dillerine uygun personalar filtrelenir
export async function resolveAllPersonas(projectId: string) {
  const languages = await getProjectLanguages(projectId);

  const assignments = await db
    .select()
    .from(projectTeam)
    .where(and(eq(projectTeam.projectId, projectId), eq(projectTeam.isActive, true)));

  const allPersonaIds = new Set<string>();
  const personaMap: Record<string, { teamRole: string; source: string }> = {};

  for (const a of assignments) {
    if (a.assignmentType === "persona" && a.personaId) {
      allPersonaIds.add(a.personaId);
      personaMap[a.personaId] = { teamRole: a.teamRole, source: "persona" };
    } else if (a.assignmentType === "role" && a.roleId) {
      const resolved = await resolvePersonasByRole(a.roleId, languages);
      for (const p of resolved) {
        allPersonaIds.add(p.id);
        if (!personaMap[p.id]) personaMap[p.id] = { teamRole: a.teamRole, source: "role" };
      }
    } else if (a.assignmentType === "role_category" && a.roleCategoryId) {
      const resolved = await resolvePersonasByCategory(a.roleCategoryId, languages);
      for (const p of resolved) {
        allPersonaIds.add(p.id);
        if (!personaMap[p.id]) personaMap[p.id] = { teamRole: a.teamRole, source: "role_category" };
      }
    }
  }

  if (allPersonaIds.size === 0) return [];

  const allPersonas = await db
    .select({ id: personas.id, name: personas.name, displayName: personas.displayName, avatarUrl: personas.avatarUrl, language: personas.language })
    .from(personas)
    .where(inArray(personas.id, [...allPersonaIds]));

  return allPersonas.map((p) => ({
    ...p,
    teamRole: personaMap[p.id]?.teamRole ?? "monitor",
    assignmentSource: personaMap[p.id]?.source ?? "unknown",
  }));
}

export async function getResolvedPersonaCount(projectId: string) {
  const resolved = await resolveAllPersonas(projectId);
  return resolved.length;
}

export async function getTeamByRole(projectId: string, teamRole: string) {
  return db
    .select()
    .from(projectTeam)
    .where(and(eq(projectTeam.projectId, projectId), eq(projectTeam.teamRole, teamRole)));
}
