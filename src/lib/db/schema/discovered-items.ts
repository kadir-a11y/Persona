import { pgTable, uuid, varchar, text, integer, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { monitoredTopics } from "./monitored-topics";
import { monitoringSources } from "./monitoring-sources";

export const discoveredItems = pgTable("discovered_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => monitoredTopics.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => monitoringSources.id, { onDelete: "cascade" }),
  externalId: varchar("external_id", { length: 500 }),
  title: text("title"),
  summary: text("summary"),
  url: text("url"),
  relevanceScore: integer("relevance_score").default(0),
  aiMetadata: jsonb("ai_metadata").default({}),
  status: varchar("status", { length: 20 }).default("new"),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_discovered_items_topic_id").on(table.topicId),
  index("idx_discovered_items_status").on(table.status),
  index("idx_discovered_items_discovered_at").on(table.discoveredAt),
  index("idx_discovered_items_external_id").on(table.externalId),
]);
