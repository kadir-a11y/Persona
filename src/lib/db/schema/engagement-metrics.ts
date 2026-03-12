/*
-- Run on production:
-- CREATE TABLE IF NOT EXISTS engagement_metrics (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
--   platform VARCHAR(50) NOT NULL,
--   likes INTEGER DEFAULT 0,
--   comments INTEGER DEFAULT 0,
--   shares INTEGER DEFAULT 0,
--   views INTEGER DEFAULT 0,
--   reach INTEGER DEFAULT 0,
--   engagement_rate NUMERIC(5, 2) DEFAULT 0,
--   collected_at TIMESTAMPTZ DEFAULT NOW(),
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE INDEX idx_engagement_metrics_content_item_id ON engagement_metrics(content_item_id);
-- CREATE INDEX idx_engagement_metrics_platform ON engagement_metrics(platform);
-- CREATE INDEX idx_engagement_metrics_collected_at ON engagement_metrics(collected_at);
*/

import { pgTable, uuid, varchar, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { contentItems } from "./content-items";

export const engagementMetrics = pgTable("engagement_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id").references(() => contentItems.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  reach: integer("reach").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).default("0"),
  collectedAt: timestamp("collected_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_engagement_metrics_content_item_id").on(table.contentItemId),
  index("idx_engagement_metrics_platform").on(table.platform),
  index("idx_engagement_metrics_collected_at").on(table.collectedAt),
]);
