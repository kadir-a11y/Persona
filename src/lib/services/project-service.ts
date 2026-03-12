import { db } from "@/lib/db";
import {
  projects,
  projectTeam,
  projectMentions,
  projectTasks,
  projectPlaybooks,
} from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/lib/validators/project";
import * as timelineService from "./project-timeline-service";

export async function getProjects(
  userId: string,
  filters?: { type?: string; status?: string; severity?: string; search?: string }
) {
  const conditions = [eq(projects.userId, userId)];

  if (filters?.type) conditions.push(eq(projects.type, filters.type));
  if (filters?.status) conditions.push(eq(projects.status, filters.status));
  if (filters?.severity) conditions.push(eq(projects.severity, filters.severity));
  if (filters?.search) {
    conditions.push(
      or(
        ilike(projects.name, `%${filters.search}%`),
        ilike(projects.clientName, `%${filters.search}%`)
      )!
    );
  }

  const projectList = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt));

  // Her proje için özet istatistikleri ekle
  const enriched = await Promise.all(
    projectList.map(async (project) => {
      const [mentionCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectMentions)
        .where(eq(projectMentions.projectId, project.id));

      const [taskCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectTasks)
        .where(
          and(
            eq(projectTasks.projectId, project.id),
            eq(projectTasks.status, "pending")
          )
        );

      const [teamCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectTeam)
        .where(eq(projectTeam.projectId, project.id));

      return {
        ...project,
        mentionCount: mentionCount?.count ?? 0,
        activeTaskCount: taskCount?.count ?? 0,
        teamCount: teamCount?.count ?? 0,
      };
    })
  );

  return enriched;
}

export async function getProjectById(projectId: string, userId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  return project ?? null;
}

export async function createProject(userId: string, data: ProjectCreateInput) {
  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: data.name,
      description: data.description,
      type: data.type,
      severity: data.severity,
      clientName: data.clientName,
      clientInfo: data.clientInfo,
      languages: data.languages,
      keywords: data.keywords,
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
    })
    .returning();

  // Timeline event
  await timelineService.addSystemEvent(
    project.id,
    "incident",
    "Proje oluşturuldu",
    `"${project.name}" projesi oluşturuldu.`,
    { type: project.type, severity: project.severity }
  );

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: ProjectUpdateInput
) {
  const { startedAt, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (startedAt) updateData.startedAt = new Date(startedAt);

  const [project] = await db
    .update(projects)
    .set(updateData)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();

  return project ?? null;
}

export async function deleteProject(projectId: string, userId: string) {
  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();

  return project ?? null;
}

export async function changeProjectStatus(
  projectId: string,
  userId: string,
  newStatus: string
) {
  const existing = await getProjectById(projectId, userId);
  if (!existing) return null;

  const oldStatus = existing.status;
  const resolvedAt = newStatus === "resolved" ? new Date() : existing.resolvedAt;

  const [project] = await db
    .update(projects)
    .set({ status: newStatus, resolvedAt, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  await timelineService.addSystemEvent(
    projectId,
    "status_change",
    `Durum değişti: ${oldStatus} → ${newStatus}`,
    undefined,
    { oldStatus, newStatus }
  );

  return project;
}

export async function changeProjectSeverity(
  projectId: string,
  userId: string,
  newSeverity: string
) {
  const existing = await getProjectById(projectId, userId);
  if (!existing) return null;

  const oldSeverity = existing.severity;

  const [project] = await db
    .update(projects)
    .set({ severity: newSeverity, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  await timelineService.addSystemEvent(
    projectId,
    "severity_change",
    `Şiddet değişti: ${oldSeverity} → ${newSeverity}`,
    undefined,
    { oldSeverity, newSeverity }
  );

  return project;
}

export async function getProjectStats(projectId: string) {
  // Mention istatistikleri
  const mentionStats = await db
    .select({
      sentiment: projectMentions.sentiment,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(projectMentions.sentiment);

  // Platform dağılımı
  const platformStats = await db
    .select({
      platform: projectMentions.platform,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(projectMentions.platform);

  // Görev durumu dağılımı
  const taskStats = await db
    .select({
      status: projectTasks.status,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .groupBy(projectTasks.status);

  // Görev faz dağılımı
  const phaseStats = await db
    .select({
      phase: projectTasks.phase,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .groupBy(projectTasks.phase);

  // Ekip büyüklüğü
  const [teamSize] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectTeam)
    .where(eq(projectTeam.projectId, projectId));

  // Yanıt bekleyen mention sayısı
  const [pendingResponses] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(
      and(
        eq(projectMentions.projectId, projectId),
        eq(projectMentions.responseStatus, "pending")
      )
    );

  // Günlük mention trendi (son 30 gün)
  const mentionTrend = await db
    .select({
      date: sql<string>`date_trunc('day', ${projectMentions.detectedAt})::date::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(sql`date_trunc('day', ${projectMentions.detectedAt})`)
    .orderBy(sql`date_trunc('day', ${projectMentions.detectedAt})`);

  return {
    mentionStats,
    platformStats,
    taskStats,
    phaseStats,
    teamSize: teamSize?.count ?? 0,
    pendingResponses: pendingResponses?.count ?? 0,
    mentionTrend,
  };
}

export async function calculateSeverityScore(projectId: string) {
  // Son 24 saatteki mention sayısı
  const [recentMentions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(
      and(
        eq(projectMentions.projectId, projectId),
        sql`${projectMentions.detectedAt} >= now() - interval '24 hours'`
      )
    );

  // Negatif sentiment oranı
  const [totalMentions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId));

  const [negativeMentions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(
      and(
        eq(projectMentions.projectId, projectId),
        eq(projectMentions.sentiment, "negative")
      )
    );

  // Toplam erişim
  const [totalReach] = await db
    .select({ total: sql<number>`coalesce(sum(${projectMentions.reachEstimate}), 0)::int` })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId));

  // Hacim skoru (0-25)
  const recentCount = recentMentions?.count ?? 0;
  let volumeScore = 0;
  if (recentCount > 100) volumeScore = 25;
  else if (recentCount > 50) volumeScore = 20;
  else if (recentCount > 20) volumeScore = 15;
  else if (recentCount > 5) volumeScore = 10;
  else if (recentCount > 0) volumeScore = 5;

  // Negatif sentiment skoru (0-25)
  const total = totalMentions?.count ?? 0;
  const negative = negativeMentions?.count ?? 0;
  const negativeRatio = total > 0 ? negative / total : 0;
  let sentimentScore = 0;
  if (negativeRatio > 0.8) sentimentScore = 25;
  else if (negativeRatio > 0.6) sentimentScore = 20;
  else if (negativeRatio > 0.4) sentimentScore = 15;
  else if (negativeRatio > 0.2) sentimentScore = 10;
  else if (negativeRatio > 0) sentimentScore = 5;

  // Yayılma hızı skoru (0-25) — son 24 saat vs önceki 24 saat
  const [previousMentions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(
      and(
        eq(projectMentions.projectId, projectId),
        sql`${projectMentions.detectedAt} >= now() - interval '48 hours'`,
        sql`${projectMentions.detectedAt} < now() - interval '24 hours'`
      )
    );

  const prevCount = previousMentions?.count ?? 0;
  const growthRate = prevCount > 0 ? recentCount / prevCount : recentCount > 0 ? 5 : 0;
  let speedScore = 0;
  if (growthRate >= 5) speedScore = 25;
  else if (growthRate >= 3) speedScore = 20;
  else if (growthRate >= 2) speedScore = 15;
  else if (growthRate >= 1.5) speedScore = 10;
  else if (growthRate > 0) speedScore = 5;

  // Erişim skoru (0-25)
  const reach = totalReach?.total ?? 0;
  let reachScore = 0;
  if (reach > 1000000) reachScore = 25;
  else if (reach > 100000) reachScore = 20;
  else if (reach > 10000) reachScore = 15;
  else if (reach > 1000) reachScore = 10;
  else if (reach > 0) reachScore = 5;

  const score = volumeScore + sentimentScore + speedScore + reachScore;

  // Skoru güncelle
  await db
    .update(projects)
    .set({ severityScore: score, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  return score;
}

export async function applyPlaybook(projectId: string, playbookId: string) {
  const [playbook] = await db
    .select()
    .from(projectPlaybooks)
    .where(eq(projectPlaybooks.id, playbookId))
    .limit(1);

  if (!playbook) return null;

  // Şablon görevleri oluştur
  const templateTasks = (playbook.templateTasks as Array<Record<string, string>>) ?? [];
  if (templateTasks.length > 0) {
    await db.insert(projectTasks).values(
      templateTasks.map((t) => ({
        projectId,
        title: t.title,
        type: t.type ?? "monitor",
        phase: t.phase ?? "detection",
        priority: t.priority ?? "medium",
        assignmentType: t.assignmentType,
        platform: t.platform,
      }))
    );
  }

  // Şablon ekip atamaları oluştur
  const templateTeam = (playbook.templateTeam as Array<Record<string, string>>) ?? [];
  if (templateTeam.length > 0) {
    await db.insert(projectTeam).values(
      templateTeam.map((t) => ({
        projectId,
        assignmentType: t.assignmentType ?? "role",
        roleId: t.roleId ?? null,
        roleCategoryId: t.roleCategoryId ?? null,
        teamRole: t.teamRole ?? "monitor",
      }))
    );
  }

  // Anahtar kelimeleri projeye ekle
  const defaultKeywords = (playbook.defaultKeywords as string[]) ?? [];
  if (defaultKeywords.length > 0) {
    const [project] = await db
      .select({ keywords: projects.keywords })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    const existing = (project?.keywords as string[]) ?? [];
    const merged = [...new Set([...existing, ...defaultKeywords])];
    await db
      .update(projects)
      .set({ keywords: merged, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }

  await timelineService.addSystemEvent(
    projectId,
    "task_created",
    `Playbook uygulandı: ${playbook.name}`,
    `${templateTasks.length} görev ve ${templateTeam.length} ekip ataması oluşturuldu.`,
    { playbookId, playbookName: playbook.name }
  );

  return playbook;
}
