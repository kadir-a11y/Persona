import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function logActivity(
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  details?: Record<string, unknown>
) {
  const [log] = await db
    .insert(activityLog)
    .values({
      userId,
      entityType,
      entityId,
      action,
      details: details || {},
    })
    .returning();

  return log;
}

/** Log a workspace action (generate, approve, reject, publish, like, retweet etc.) */
export async function logWorkspaceAction(
  userId: string,
  projectId: string,
  action: string,
  details: {
    personaIds?: string[];
    personaNames?: string[];
    contentType?: string;
    platform?: string;
    sessionId?: string;
    responseId?: string;
    sourceContentId?: string;
    count?: number;
    [key: string]: unknown;
  }
) {
  return logActivity(userId, "workspace", projectId, action, {
    ...details,
    projectId,
  });
}

export async function getActivityLogs(
  userId: string,
  limit = 50,
  offset = 0,
  isAdmin = false
) {
  const query = db
    .select()
    .from(activityLog);

  if (!isAdmin) {
    return query
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);
  }
  return query
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Get activity logs filtered by projectId (stored in details JSONB) */
export async function getProjectActivityLogs(
  projectId: string,
  limit = 100,
  offset = 0,
  actionFilter?: string
) {
  const conditions = [
    sql`${activityLog.details}->>'projectId' = ${projectId}`,
  ];

  if (actionFilter && actionFilter !== "all") {
    conditions.push(eq(activityLog.action, actionFilter));
  }

  return db
    .select()
    .from(activityLog)
    .where(and(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Get activity logs for a specific persona */
export async function getPersonaActivityLogs(
  personaId: string,
  limit = 50,
  offset = 0
) {
  return db
    .select()
    .from(activityLog)
    .where(
      sql`${activityLog.details}->'personaIds' @> ${JSON.stringify([personaId])}::jsonb`
    )
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getActivityStats(userId: string, days = 30, isAdmin = false) {
  const result = await db
    .select({
      date: sql<string>`DATE(${activityLog.createdAt})`,
      action: activityLog.action,
      count: sql<number>`count(*)::int`,
    })
    .from(activityLog)
    .where(
      and(
        isAdmin ? undefined : eq(activityLog.userId, userId),
        sql`${activityLog.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`
      )
    )
    .groupBy(sql`DATE(${activityLog.createdAt})`, activityLog.action)
    .orderBy(sql`DATE(${activityLog.createdAt})`);

  return result;
}
