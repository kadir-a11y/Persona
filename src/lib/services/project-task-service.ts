import { db } from "@/lib/db";
import { projectTasks } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { ProjectTaskCreateInput, ProjectTaskUpdateInput } from "@/lib/validators/project";
import * as timelineService from "./project-timeline-service";

export async function getTasks(
  projectId: string,
  filters?: {
    phase?: string;
    status?: string;
    priority?: string;
    assignmentType?: string;
    platform?: string;
  }
) {
  const conditions = [eq(projectTasks.projectId, projectId)];

  if (filters?.phase) conditions.push(eq(projectTasks.phase, filters.phase));
  if (filters?.status) conditions.push(eq(projectTasks.status, filters.status));
  if (filters?.priority) conditions.push(eq(projectTasks.priority, filters.priority));
  if (filters?.assignmentType) conditions.push(eq(projectTasks.assignmentType, filters.assignmentType));
  if (filters?.platform) conditions.push(eq(projectTasks.platform, filters.platform));

  return db
    .select()
    .from(projectTasks)
    .where(and(...conditions))
    .orderBy(desc(projectTasks.createdAt));
}

export async function getTaskById(taskId: string) {
  const [task] = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.id, taskId))
    .limit(1);

  return task ?? null;
}

export async function createTask(projectId: string, data: ProjectTaskCreateInput) {
  const [task] = await db
    .insert(projectTasks)
    .values({
      projectId,
      title: data.title,
      description: data.description,
      type: data.type,
      phase: data.phase,
      priority: data.priority,
      assignmentType: data.assignmentType,
      assignedPersonaId: data.assignedPersonaId,
      assignedRoleId: data.assignedRoleId,
      assignedRoleCategoryId: data.assignedRoleCategoryId,
      platform: data.platform,
      deadline: data.deadline ? new Date(data.deadline) : null,
    })
    .returning();

  await timelineService.addSystemEvent(
    projectId,
    "task_created",
    `Yeni görev: ${data.title}`,
    undefined,
    { taskId: task.id, type: data.type, phase: data.phase, priority: data.priority }
  );

  return task;
}

export async function updateTask(taskId: string, data: ProjectTaskUpdateInput) {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.deadline) updateData.deadline = new Date(data.deadline);

  const [task] = await db
    .update(projectTasks)
    .set(updateData)
    .where(eq(projectTasks.id, taskId))
    .returning();

  return task ?? null;
}

export async function deleteTask(taskId: string) {
  const [task] = await db
    .delete(projectTasks)
    .where(eq(projectTasks.id, taskId))
    .returning();

  return task ?? null;
}

export async function changeTaskStatus(taskId: string, newStatus: string, projectId: string) {
  const existing = await getTaskById(taskId);
  if (!existing) return null;

  const completedAt = newStatus === "completed" ? new Date() : existing.completedAt;

  const [task] = await db
    .update(projectTasks)
    .set({ status: newStatus, completedAt, updatedAt: new Date() })
    .where(eq(projectTasks.id, taskId))
    .returning();

  if (newStatus === "completed") {
    await timelineService.addSystemEvent(
      projectId,
      "resolution",
      `Görev tamamlandı: ${existing.title}`,
      undefined,
      { taskId, phase: existing.phase }
    );
  }

  return task;
}

export async function getTasksByPhase(projectId: string) {
  const tasks = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .orderBy(projectTasks.priority, desc(projectTasks.createdAt));

  const phases: Record<string, typeof tasks> = {
    detection: [],
    analysis: [],
    response: [],
    monitoring: [],
    resolution: [],
  };

  for (const task of tasks) {
    if (phases[task.phase]) {
      phases[task.phase].push(task);
    }
  }

  return phases;
}

export async function getTaskStats(projectId: string) {
  const statusStats = await db
    .select({
      status: projectTasks.status,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .groupBy(projectTasks.status);

  const phaseStats = await db
    .select({
      phase: projectTasks.phase,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .groupBy(projectTasks.phase);

  const priorityStats = await db
    .select({
      priority: projectTasks.priority,
      count: sql<number>`count(*)::int`,
    })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .groupBy(projectTasks.priority);

  return { statusStats, phaseStats, priorityStats };
}

export async function bulkCreateTasks(projectId: string, tasks: ProjectTaskCreateInput[]) {
  const values = tasks.map((t) => ({
    projectId,
    title: t.title,
    description: t.description,
    type: t.type ?? "monitor",
    phase: t.phase ?? "detection",
    priority: t.priority ?? "medium",
    assignmentType: t.assignmentType,
    assignedPersonaId: t.assignedPersonaId,
    assignedRoleId: t.assignedRoleId,
    assignedRoleCategoryId: t.assignedRoleCategoryId,
    platform: t.platform,
    deadline: t.deadline ? new Date(t.deadline) : null,
  }));

  const inserted = await db.insert(projectTasks).values(values).returning();

  await timelineService.addSystemEvent(
    projectId,
    "task_created",
    `${inserted.length} yeni görev oluşturuldu`,
    undefined,
    { count: inserted.length }
  );

  return inserted;
}

export async function linkContentToTask(taskId: string, contentItemId: string) {
  const [task] = await db
    .update(projectTasks)
    .set({ contentItemId, updatedAt: new Date() })
    .where(eq(projectTasks.id, taskId))
    .returning();

  return task ?? null;
}

export async function linkCampaignToTask(taskId: string, campaignId: string) {
  const [task] = await db
    .update(projectTasks)
    .set({ campaignId, updatedAt: new Date() })
    .where(eq(projectTasks.id, taskId))
    .returning();

  return task ?? null;
}
