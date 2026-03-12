import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull().default("monitoring"),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"),
  status: varchar("status", { length: 20 }).notNull().default("detected"),
  clientName: varchar("client_name", { length: 255 }),
  clientInfo: jsonb("client_info").default({}),
  languages: jsonb("languages").default(["tr"]),
  keywords: jsonb("keywords").default([]),
  severityScore: integer("severity_score").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
