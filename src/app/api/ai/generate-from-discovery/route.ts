import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaById } from "@/lib/services/persona-service";
import { generateContent } from "@/lib/ai/gemini";
import { buildAdvancedContentPrompt } from "@/lib/ai/prompts";
import { discoveredItems } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const generateFromDiscoverySchema = z.object({
  discoveredItemId: z.string().uuid(),
  personaId: z.string().uuid(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"]),
  language: z.string().optional(),
  additionalInstructions: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = generateFromDiscoverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  // Fetch discovered item
  const [item] = await db
    .select()
    .from(discoveredItems)
    .where(eq(discoveredItems.id, parsed.data.discoveredItemId))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Discovered item not found" }, { status: 404 });
  }

  // Fetch persona
  const persona = await getPersonaById(parsed.data.personaId, session.user.id, isAdmin);
  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  const prompt = buildAdvancedContentPrompt(
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
    "post",
    {
      language: parsed.data.language || persona.language || "tr",
      additionalInstructions: parsed.data.additionalInstructions,
      discoveredItem: {
        title: item.title || undefined,
        summary: item.summary || undefined,
        url: item.url || undefined,
        aiMetadata: (item.aiMetadata as Record<string, unknown>) || undefined,
      },
    }
  );

  try {
    const content = await generateContent(prompt);

    return NextResponse.json({
      result: content,
      discoveredItem: {
        id: item.id,
        title: item.title,
        url: item.url,
      },
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
