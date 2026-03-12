import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { personas } from "./personas";
import { contentItems } from "./content-items";

export const projectMentions = pgTable("project_mentions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  sourceUrl: text("source_url"),
  sourceAuthor: varchar("source_author", { length: 255 }),
  content: text("content").notNull(),
  sentiment: varchar("sentiment", { length: 20 }).notNull().default("neutral"),
  reachEstimate: integer("reach_estimate"),
  engagementCount: integer("engagement_count").default(0),
  requiresResponse: boolean("requires_response").default(false),
  responseStatus: varchar("response_status", { length: 20 }).notNull().default("not_needed"),
  assignedPersonaId: uuid("assigned_persona_id")
    .references(() => personas.id, { onDelete: "set null" }),
  respondedContentId: uuid("responded_content_id")
    .references(() => contentItems.id, { onDelete: "set null" }),
  detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
