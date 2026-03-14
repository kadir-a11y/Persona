import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaById } from "@/lib/services/persona-service";
import { generateContent } from "@/lib/ai/gemini";
import { buildContentPrompt, buildAdvancedContentPrompt } from "@/lib/ai/prompts";
import { discoveredItems } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const generateSchema = z.object({
  personaId: z.string().uuid(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"]),
  contentType: z.enum(["post", "reply", "comment", "story", "reel"]).default("post"),
  topic: z.string().max(500).optional(),
  additionalInstructions: z.string().max(1000).optional(),
  count: z.number().min(1).max(10).default(1),
  language: z.string().optional(),
  discoveredItemId: z.string().uuid().optional(),
  tone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const persona = await getPersonaById(parsed.data.personaId, session.user.id, isAdmin);
  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  // Fetch discovered item if provided
  let discoveredItem: { title: string | null; summary: string | null; url: string | null; aiMetadata: unknown } | undefined;
  if (parsed.data.discoveredItemId) {
    const [item] = await db
      .select()
      .from(discoveredItems)
      .where(eq(discoveredItems.id, parsed.data.discoveredItemId))
      .limit(1);
    if (item) {
      discoveredItem = item;
    }
  }

  const useAdvanced = parsed.data.language || parsed.data.discoveredItemId || parsed.data.tone;

  let prompt: string;

  if (useAdvanced) {
    prompt = buildAdvancedContentPrompt(
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
      parsed.data.platform,
      parsed.data.contentType,
      {
        language: parsed.data.language || persona.language || "tr",
        topic: parsed.data.topic,
        additionalInstructions: parsed.data.additionalInstructions,
        toneOverride: parsed.data.tone,
        discoveredItem: discoveredItem
          ? {
              title: discoveredItem.title || undefined,
              summary: discoveredItem.summary || undefined,
              url: discoveredItem.url || undefined,
              aiMetadata: (discoveredItem.aiMetadata as Record<string, unknown>) || undefined,
            }
          : undefined,
      }
    );
  } else {
    // Backward compatible path
    prompt = buildContentPrompt(
      {
        name: persona.name,
        bio: persona.bio || undefined,
        personalityTraits: (persona.personalityTraits as string[]) || [],
        interests: (persona.interests as string[]) || [],
        behavioralPatterns: (persona.behavioralPatterns as Record<string, string>) || {},
        language: persona.language || "tr",
      },
      parsed.data.platform,
      parsed.data.contentType,
      parsed.data.topic,
      parsed.data.additionalInstructions
    );
  }

  try {
    const results: string[] = [];
    for (let i = 0; i < parsed.data.count; i++) {
      const content = await generateContent(prompt);
      results.push(content);
    }

    return NextResponse.json({
      results,
      model: "gemini-2.5-flash-lite",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "AI generation failed", details: message },
      { status: 500 }
    );
  }
}
