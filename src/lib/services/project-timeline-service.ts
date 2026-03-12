import { db } from "@/lib/db";
import { projectTimeline, projects } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export async function getTimeline(
  projectId: string,
  filters?: { eventType?: string[]; limit?: number; offset?: number }
) {
  const conditions = [eq(projectTimeline.projectId, projectId)];

  if (filters?.eventType?.length) {
    conditions.push(inArray(projectTimeline.eventType, filters.eventType));
  }

  return db
    .select()
    .from(projectTimeline)
    .where(and(...conditions))
    .orderBy(desc(projectTimeline.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);
}

export async function addEvent(
  projectId: string,
  data: {
    eventType: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    actorType?: string;
    actorId?: string;
  }
) {
  // Projenin mevcut severity'sini al
  const [project] = await db
    .select({ severity: projects.severity })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const [event] = await db
    .insert(projectTimeline)
    .values({
      projectId,
      eventType: data.eventType,
      title: data.title,
      description: data.description,
      metadata: data.metadata ?? {},
      severityAtTime: project?.severity,
      actorType: data.actorType ?? "system",
      actorId: data.actorId,
    })
    .returning();

  return event;
}

export async function addSystemEvent(
  projectId: string,
  eventType: string,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>
) {
  return addEvent(projectId, {
    eventType,
    title,
    description,
    metadata,
    actorType: "system",
  });
}

export async function addUserEvent(
  projectId: string,
  userId: string,
  eventType: string,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>
) {
  return addEvent(projectId, {
    eventType,
    title,
    description,
    metadata,
    actorType: "user",
    actorId: userId,
  });
}

export async function addNote(
  projectId: string,
  userId: string,
  title: string,
  description?: string
) {
  return addUserEvent(projectId, userId, "note", title, description);
}

export async function getRecentEvents(projectId: string, limit = 10) {
  return db
    .select()
    .from(projectTimeline)
    .where(eq(projectTimeline.projectId, projectId))
    .orderBy(desc(projectTimeline.createdAt))
    .limit(limit);
}
