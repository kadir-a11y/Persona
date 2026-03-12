import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { monitoredTopics, monitoringSources, discoveredItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAdapter } from "@/lib/monitoring/adapters";
import { relevanceScoringQueue } from "../queues";
import type { MonitoredTopicData, MonitoringSourceData } from "@/lib/monitoring/types";

interface MonitoringJob {
  topicId?: string; // if specified, only check this topic
}

export function createMonitoringWorker() {
  return new Worker<MonitoringJob>(
    "monitoring",
    async (job: Job<MonitoringJob>) => {
      const { topicId } = job.data;

      // Fetch active topics
      const topics = topicId
        ? await db.select().from(monitoredTopics).where(and(eq(monitoredTopics.id, topicId), eq(monitoredTopics.isActive, true)))
        : await db.select().from(monitoredTopics).where(eq(monitoredTopics.isActive, true));

      console.log(`Monitoring: checking ${topics.length} active topics`);

      let totalDiscovered = 0;

      for (const topic of topics) {
        const topicData: MonitoredTopicData = {
          id: topic.id,
          userId: topic.userId,
          name: topic.name,
          keywords: (topic.keywords as string[]) || [],
          language: topic.language || "tr",
        };

        // Get active sources for this topic
        const sources = await db
          .select()
          .from(monitoringSources)
          .where(and(eq(monitoringSources.topicId, topic.id), eq(monitoringSources.isActive, true)));

        for (const source of sources) {
          const adapter = getAdapter(source.sourceType);
          if (!adapter) {
            console.warn(`No adapter found for source type: ${source.sourceType}`);
            continue;
          }

          const sourceData: MonitoringSourceData = {
            id: source.id,
            topicId: source.topicId,
            sourceType: source.sourceType,
            config: (source.config as Record<string, unknown>) || {},
          };

          try {
            const items = await adapter.fetch(topicData, sourceData);
            console.log(`  ${topic.name} / ${source.sourceType}: found ${items.length} items`);

            for (const item of items) {
              // Duplicate check by externalId
              const [existing] = await db
                .select({ id: discoveredItems.id })
                .from(discoveredItems)
                .where(and(
                  eq(discoveredItems.sourceId, source.id),
                  eq(discoveredItems.externalId, item.externalId)
                ))
                .limit(1);

              if (existing) continue;

              // Insert new discovered item
              const [inserted] = await db
                .insert(discoveredItems)
                .values({
                  topicId: topic.id,
                  sourceId: source.id,
                  externalId: item.externalId,
                  title: item.title,
                  summary: item.summary,
                  url: item.url,
                  status: "new",
                })
                .returning();

              totalDiscovered++;

              // Queue for relevance scoring
              await relevanceScoringQueue.add(
                `score-${inserted.id}`,
                {
                  discoveredItemId: inserted.id,
                  topicId: topic.id,
                  topicKeywords: topicData.keywords,
                  title: item.title,
                  summary: item.summary,
                }
              );
            }
          } catch (err) {
            console.error(`Error fetching ${source.sourceType} for topic ${topic.name}:`, err);
          }
        }

        // Update last checked timestamp
        await db
          .update(monitoredTopics)
          .set({ lastCheckedAt: new Date() })
          .where(eq(monitoredTopics.id, topic.id));
      }

      console.log(`Monitoring complete: ${totalDiscovered} new items discovered`);
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );
}
