import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projectPlaybooks = pgTable("project_playbooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull().default("monitoring"),
  templateTasks: jsonb("template_tasks").default([]),
  templateTeam: jsonb("template_team").default([]),
  defaultKeywords: jsonb("default_keywords").default([]),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
