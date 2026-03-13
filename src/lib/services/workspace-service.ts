import { db } from "@/lib/db";
import {
  workspaceSessions,
  workspaceResponses,
  personas,
  projectMentions,
  contentItems,
} from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";
import { buildWorkspaceResponsePrompt } from "@/lib/ai/prompts";
import type {
  WorkspaceSessionCreateInput,
  WorkspaceSessionUpdateInput,
  WorkspaceGenerateInput,
} from "@/lib/validators/workspace";
import { contentDeliveryQueue } from "@/lib/queue/queues";

// ── Session CRUD ─────────────────────────────────────────────────────

export async function getSessions(projectId: string) {
  return db
    .select()
    .from(workspaceSessions)
    .where(eq(workspaceSessions.projectId, projectId))
    .orderBy(desc(workspaceSessions.createdAt));
}

export async function getSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(workspaceSessions)
    .where(eq(workspaceSessions.id, sessionId))
    .limit(1);
  return session ?? null;
}

export async function createSession(
  projectId: string,
  userId: string,
  data: WorkspaceSessionCreateInput
) {
  const [session] = await db
    .insert(workspaceSessions)
    .values({
      projectId,
      userId,
      sourceContentId: data.sourceContentId || null,
      aiCommand: data.aiCommand,
      selectedPersonaIds: data.selectedPersonaIds,
      personaFilterCriteria: data.personaFilterCriteria,
      platform: data.platform,
      status: "active",
    })
    .returning();

  return session;
}

export async function updateSession(
  sessionId: string,
  data: WorkspaceSessionUpdateInput
) {
  const [session] = await db
    .update(workspaceSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspaceSessions.id, sessionId))
    .returning();

  return session ?? null;
}

export async function deleteSession(sessionId: string) {
  const [session] = await db
    .delete(workspaceSessions)
    .where(eq(workspaceSessions.id, sessionId))
    .returning();

  return session ?? null;
}

// ── Response CRUD ────────────────────────────────────────────────────

export async function getSessionResponses(sessionId: string) {
  const responses = await db
    .select({
      response: workspaceResponses,
      personaName: personas.name,
      personaAvatar: personas.avatarUrl,
      personaLanguage: personas.language,
      personaCountry: personas.country,
    })
    .from(workspaceResponses)
    .innerJoin(personas, eq(workspaceResponses.personaId, personas.id))
    .where(eq(workspaceResponses.sessionId, sessionId))
    .orderBy(workspaceResponses.createdAt);

  return responses.map((r) => ({
    ...r.response,
    personaName: r.personaName,
    personaAvatar: r.personaAvatar,
    personaLanguage: r.personaLanguage,
    personaCountry: r.personaCountry,
  }));
}

export async function updateResponse(responseId: string, editedContent: string) {
  const [response] = await db
    .update(workspaceResponses)
    .set({ editedContent, updatedAt: new Date() })
    .where(eq(workspaceResponses.id, responseId))
    .returning();

  return response ?? null;
}

export async function approveResponse(responseId: string) {
  const [response] = await db
    .update(workspaceResponses)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(workspaceResponses.id, responseId))
    .returning();

  return response ?? null;
}

export async function rejectResponse(responseId: string) {
  const [response] = await db
    .update(workspaceResponses)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(workspaceResponses.id, responseId))
    .returning();

  return response ?? null;
}

export async function bulkApproveResponses(responseIds: string[]) {
  const responses = await db
    .update(workspaceResponses)
    .set({ status: "approved", updatedAt: new Date() })
    .where(inArray(workspaceResponses.id, responseIds))
    .returning();

  return responses;
}

// ── AI Generation ────────────────────────────────────────────────────

export async function generateResponses(
  sessionId: string,
  options: WorkspaceGenerateInput
) {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const personaIds = session.selectedPersonaIds as string[];
  if (!personaIds || personaIds.length === 0) {
    throw new Error("No personas selected");
  }

  // Fetch personas
  const selectedPersonas = await db
    .select()
    .from(personas)
    .where(inArray(personas.id, personaIds));

  // Fetch source content if exists
  let sourceContent = null;
  if (session.sourceContentId) {
    const [mention] = await db
      .select()
      .from(projectMentions)
      .where(eq(projectMentions.id, session.sourceContentId))
      .limit(1);
    sourceContent = mention ?? null;
  }

  // Check for duplicates (same session + persona)
  const existingResponses = await db
    .select({ personaId: workspaceResponses.personaId })
    .from(workspaceResponses)
    .where(eq(workspaceResponses.sessionId, sessionId));
  const existingPersonaIds = new Set(existingResponses.map((r) => r.personaId));

  const newPersonas = selectedPersonas.filter((p) => !existingPersonaIds.has(p.id));
  if (newPersonas.length === 0) {
    throw new Error("All selected personas already have responses for this session");
  }

  // Generate content for each persona
  const results = [];
  for (const persona of newPersonas) {
    const prompt = buildWorkspaceResponsePrompt(
      {
        name: persona.name,
        bio: persona.bio || undefined,
        personalityTraits: (persona.personalityTraits as string[]) || [],
        interests: (persona.interests as string[]) || [],
        behavioralPatterns: (persona.behavioralPatterns as Record<string, string>) || {},
        language: persona.language || "tr",
        gender: persona.gender || undefined,
        country: persona.country || undefined,
        city: persona.city || undefined,
      },
      session.platform || "twitter",
      options.contentType || "reply",
      {
        sourceContent: sourceContent
          ? {
              content: sourceContent.content,
              author: sourceContent.sourceAuthor || undefined,
              platform: sourceContent.platform,
              url: sourceContent.sourceUrl || undefined,
            }
          : undefined,
        aiCommand: session.aiCommand || "",
        sentimentDirection: options.sentimentDirection,
      }
    );

    try {
      const generatedContent = await generateContent(prompt);

      // Determine sentiment based on content analysis (simple heuristic)
      const sentiment = options.sentimentDirection || "neutral";

      const [response] = await db
        .insert(workspaceResponses)
        .values({
          sessionId,
          projectId: session.projectId,
          personaId: persona.id,
          sourceContentId: session.sourceContentId,
          generatedContent,
          sentiment,
          platform: session.platform || "twitter",
          contentType: options.contentType || "reply",
          aiPrompt: prompt,
          aiModel: "gemini-2.5-flash-lite",
          status: "pending_review",
        })
        .returning();

      results.push({
        ...response,
        personaName: persona.name,
        personaAvatar: persona.avatarUrl,
        personaLanguage: persona.language,
        personaCountry: persona.country,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to generate for persona ${persona.name}:`, message);

      const [response] = await db
        .insert(workspaceResponses)
        .values({
          sessionId,
          projectId: session.projectId,
          personaId: persona.id,
          sourceContentId: session.sourceContentId,
          generatedContent: "",
          platform: session.platform || "twitter",
          contentType: options.contentType || "reply",
          aiPrompt: prompt,
          aiModel: "gemini-2.5-flash-lite",
          status: "failed",
          errorMessage: message,
        })
        .returning();

      results.push({
        ...response,
        personaName: persona.name,
        personaAvatar: persona.avatarUrl,
        personaLanguage: persona.language,
        personaCountry: persona.country,
      });
    }
  }

  return results;
}

// ── Publishing ───────────────────────────────────────────────────────

export async function publishApprovedResponses(
  sessionId: string,
  staggerMinutes = 5
) {
  // Get approved responses
  const approved = await db
    .select({
      response: workspaceResponses,
      persona: personas,
    })
    .from(workspaceResponses)
    .innerJoin(personas, eq(workspaceResponses.personaId, personas.id))
    .where(
      and(
        eq(workspaceResponses.sessionId, sessionId),
        eq(workspaceResponses.status, "approved")
      )
    )
    .orderBy(workspaceResponses.createdAt);

  if (approved.length === 0) return [];

  const results = [];
  let scheduleIndex = 0;

  for (const { response, persona } of approved) {
    // Calculate scheduled time based on persona's active hours and timezone
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + scheduleIndex * staggerMinutes * 60000);

    // Check if persona is within active hours (simplified UTC check)
    const personaHour = getPersonaLocalHour(scheduledAt, persona.timezone || "Europe/Istanbul");
    const activeStart = persona.activeHoursStart ?? 9;
    const activeEnd = persona.activeHoursEnd ?? 23;

    let finalScheduledAt = scheduledAt;
    if (personaHour < activeStart || personaHour >= activeEnd) {
      // Schedule for next active period
      const tomorrow = new Date(scheduledAt);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(activeStart, Math.floor(Math.random() * 60), 0, 0);
      finalScheduledAt = tomorrow;
    }

    // Create content item
    const finalContent = response.editedContent || response.generatedContent;
    const [contentItem] = await db
      .insert(contentItems)
      .values({
        personaId: persona.id,
        projectId: response.projectId,
        platform: response.platform,
        contentType: response.contentType || "reply",
        content: finalContent,
        status: "scheduled",
        scheduledAt: finalScheduledAt,
        aiGenerated: true,
        aiPrompt: response.aiPrompt,
        aiModel: response.aiModel,
        workspaceResponseId: response.id,
        sourceContentUrl: null,
      })
      .returning();

    // Update workspace response
    await db
      .update(workspaceResponses)
      .set({
        status: "published",
        contentItemId: contentItem.id,
        scheduledAt: finalScheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(workspaceResponses.id, response.id));

    // Add to publishing queue
    await contentDeliveryQueue.add(
      `workspace-${contentItem.id}`,
      {
        contentItemId: contentItem.id,
        platform: response.platform,
        content: finalContent,
        personaId: persona.id,
      },
      {
        delay: finalScheduledAt.getTime() - Date.now(),
      }
    );

    results.push({
      responseId: response.id,
      contentItemId: contentItem.id,
      scheduledAt: finalScheduledAt,
      personaName: persona.name,
    });

    scheduleIndex++;
  }

  // Mark session as completed
  await db
    .update(workspaceSessions)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(workspaceSessions.id, sessionId));

  return results;
}

function getPersonaLocalHour(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    return parseInt(formatter.format(date), 10);
  } catch {
    return date.getUTCHours();
  }
}
