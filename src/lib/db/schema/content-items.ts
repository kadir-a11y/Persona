import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { personas } from "./personas";
import { campaigns } from "./campaigns";
import { projects } from "./projects";

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  contentType: varchar("content_type", { length: 30 }).default("post"),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").default([]),
  status: varchar("status", { length: 20 }).default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  aiGenerated: boolean("ai_generated").default(false),
  aiPrompt: text("ai_prompt"),
  aiModel: varchar("ai_model", { length: 100 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
