import { db } from "@/lib/db";
import { personas, socialAccounts, contentItems, workspaceResponses, projectTeam } from "@/lib/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";

interface ScoreBreakdown {
  socialAccountScore: number;
  contentScore: number;
  approvalScore: number;
  projectScore: number;
  total: number;
}

/**
 * Calculate influence score for a single persona (0-100)
 *
 * Scoring weights:
 * - Social accounts: max 20 pts (5 per account, up to 4)
 * - Content published: max 30 pts (scaled by count)
 * - Approval rate: max 30 pts (approved / total responses)
 * - Project involvement: max 20 pts (5 per project, up to 4)
 */
export async function calculateInfluenceScore(personaId: string): Promise<ScoreBreakdown> {
  // 1. Social account count (max 20 pts)
  const [accountCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(socialAccounts)
    .where(eq(socialAccounts.personaId, personaId));
  const socialAccountScore = Math.min((accountCount?.count || 0) * 5, 20);

  // 2. Published content count (max 30 pts)
  const [publishedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(and(eq(contentItems.personaId, personaId), eq(contentItems.status, "published")));
  const published = publishedCount?.count || 0;
  // Logarithmic scaling: 1->6, 5->21, 10->30, 20->30
  const contentScore = published === 0 ? 0 : Math.min(Math.round(Math.log2(published + 1) * 9), 30);

  // 3. Approval rate (max 30 pts)
  const [responseStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) filter (where status in ('approved', 'published'))::int`,
    })
    .from(workspaceResponses)
    .where(eq(workspaceResponses.personaId, personaId));
  const total = responseStats?.total || 0;
  const approved = responseStats?.approved || 0;
  const approvalScore = total === 0 ? 0 : Math.round((approved / total) * 30);

  // 4. Project involvement (max 20 pts)
  const [projectCount] = await db
    .select({ count: sql<number>`count(distinct project_id)::int` })
    .from(projectTeam)
    .where(eq(projectTeam.personaId, personaId));
  const projectScore = Math.min((projectCount?.count || 0) * 5, 20);

  const totalScore = socialAccountScore + contentScore + approvalScore + projectScore;

  return {
    socialAccountScore,
    contentScore,
    approvalScore,
    projectScore,
    total: Math.min(totalScore, 100),
  };
}

/**
 * Recalculate influence scores for all personas (or specific ones)
 */
export async function recalculateAllInfluenceScores(personaIds?: string[]): Promise<number> {
  let targetPersonas: { id: string }[];

  if (personaIds && personaIds.length > 0) {
    targetPersonas = await db
      .select({ id: personas.id })
      .from(personas)
      .where(inArray(personas.id, personaIds));
  } else {
    targetPersonas = await db.select({ id: personas.id }).from(personas);
  }

  let updated = 0;
  for (const p of targetPersonas) {
    const score = await calculateInfluenceScore(p.id);
    await db
      .update(personas)
      .set({ influenceScore: score.total, updatedAt: new Date() })
      .where(eq(personas.id, p.id));
    updated++;
  }

  return updated;
}
