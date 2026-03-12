import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { discoveredItems, autoPostRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";
import { processAutoPost } from "@/lib/services/auto-post-service";

interface RelevanceScoringJob {
  discoveredItemId: string;
  topicId: string;
  topicKeywords: string[];
  title: string;
  summary: string;
}

interface AIRelevanceResponse {
  score: number;
  reason: string;
  suggested_angle: string;
  urgency: "high" | "medium" | "low";
}

function parseAIResponse(text: string): AIRelevanceResponse | null {
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 0)),
      reason: String(parsed.reason || ""),
      suggested_angle: String(parsed.suggested_angle || ""),
      urgency: ["high", "medium", "low"].includes(parsed.urgency) ? parsed.urgency : "medium",
    };
  } catch {
    return null;
  }
}

export function createRelevanceScoringWorker() {
  return new Worker<RelevanceScoringJob>(
    "relevance-scoring",
    async (job: Job<RelevanceScoringJob>) => {
      const { discoveredItemId, topicId, topicKeywords, title, summary } = job.data;

      let score = 0;
      let aiMetadata: Record<string, unknown> = {};

      try {
        const prompt = `You are a content relevance analyst. Analyze the following content and rate its relevance to the given keywords.

Keywords: ${topicKeywords.join(", ")}

Content title: ${title}
Content summary: ${summary}

Respond with ONLY a JSON object (no markdown, no explanation) with these fields:
- "score": number 0-100 indicating relevance (0 = completely irrelevant, 100 = perfect match)
- "reason": brief explanation of why this score was given (1-2 sentences)
- "suggested_angle": a suggested angle or talking point for engaging with this content (1-2 sentences)
- "urgency": "high" if this is time-sensitive or trending, "medium" if moderately important, "low" if it can wait

Example response:
{"score": 85, "reason": "The article directly discusses the target keywords in a relevant industry context.", "suggested_angle": "Highlight how this validates the product's approach to solving this problem.", "urgency": "medium"}`;

        const result = await generateContent(prompt);
        const parsed = parseAIResponse(result);

        if (parsed) {
          score = parsed.score;
          aiMetadata = {
            reason: parsed.reason,
            suggested_angle: parsed.suggested_angle,
            urgency: parsed.urgency,
            scored_at: new Date().toISOString(),
          };
        } else {
          // Fallback: try to parse as a plain number
          const numericParsed = parseInt(result.trim(), 10);
          score = isNaN(numericParsed) ? 0 : Math.min(100, Math.max(0, numericParsed));
          aiMetadata = {
            reason: "AI response could not be parsed as structured JSON",
            suggested_angle: "",
            urgency: "medium",
            scored_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error(`AI scoring failed for item ${discoveredItemId}, using keyword matching:`, err);
        // Fallback: simple keyword matching
        const text = `${title} ${summary}`.toLowerCase();
        const matches = topicKeywords.filter((kw) => text.includes(kw.toLowerCase()));
        score = Math.min(100, Math.round((matches.length / Math.max(topicKeywords.length, 1)) * 100));
        aiMetadata = {
          reason: "Scored via keyword matching fallback",
          suggested_angle: "",
          urgency: "medium",
          scored_at: new Date().toISOString(),
          fallback: true,
        };
      }

      // Save score and AI metadata to DB
      await db
        .update(discoveredItems)
        .set({
          relevanceScore: score,
          aiMetadata,
        })
        .where(eq(discoveredItems.id, discoveredItemId));

      console.log(`Scored item ${discoveredItemId}: ${score}/100 (urgency: ${aiMetadata.urgency})`);

      // Check auto_post_rules for this topic
      const rules = await db
        .select()
        .from(autoPostRules)
        .where(
          and(
            eq(autoPostRules.topicId, topicId),
            eq(autoPostRules.isActive, true)
          )
        );

      for (const rule of rules) {
        if (score >= (rule.minRelevanceScore ?? 70)) {
          console.log(`Item ${discoveredItemId} meets auto-post rule ${rule.id} (score ${score} >= ${rule.minRelevanceScore})`);
          try {
            await processAutoPost(discoveredItemId, rule);
          } catch (err) {
            console.error(`Auto-post processing failed for item ${discoveredItemId}, rule ${rule.id}:`, err);
          }
        }
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );
}
