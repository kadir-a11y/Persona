import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const projectTimeline = pgTable("project_timeline", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 30 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  severityAtTime: varchar("severity_at_time", { length: 20 }),
  actorType: varchar("actor_type", { length: 20 }).notNull().default("system"),
  actorId: varchar("actor_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
