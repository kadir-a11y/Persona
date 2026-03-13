import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { contentItems, personas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";
import { buildContentPrompt } from "@/lib/ai/prompts";

interface AIGenerationJob {
  personaId: string;
  platform: string;
  contentType: string;
  topic?: string;
  additionalInstructions?: string;
  campaignId?: string;
  autoSchedule?: boolean;
  scheduledAt?: string;
}

export function createAIGenerationWorker() {
  return new Worker<AIGenerationJob>(
    "ai-generation",
    async (job: Job<AIGenerationJob>) => {
      const { personaId, platform, contentType, topic, additionalInstructions, campaignId } = job.data;

      const [persona] = await db
        .select()
        .from(personas)
        .where(eq(personas.id, personaId))
        .limit(1);

      if (!persona) throw new Error(`Persona not found: ${personaId}`);

      const prompt = buildContentPrompt(
        {
          name: persona.name,
          bio: persona.bio || undefined,
          personalityTraits: (persona.personalityTraits as string[]) || [],
          interests: (persona.interests as string[]) || [],
          behavioralPatterns: (persona.behavioralPatterns as any) || {},
          language: persona.language || "tr",
        },
        platform,
        contentType,
        topic,
        additionalInstructions
      );

      const content = await generateContent(prompt);

      const [item] = await db
        .insert(contentItems)
        .values({
          personaId,
          campaignId: campaignId || null,
          platform,
          contentType,
          content,
          status: job.data.autoSchedule ? "scheduled" : "draft",
          scheduledAt: job.data.scheduledAt ? new Date(job.data.scheduledAt) : null,
          aiGenerated: true,
          aiPrompt: prompt,
          aiModel: "gemini-2.5-flash-lite",
        })
        .returning();

      console.log(`AI content generated for persona ${personaId}: ${content.substring(0, 50)}...`);
      return item;
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );
}
