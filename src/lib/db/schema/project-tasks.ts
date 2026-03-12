import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { personas } from "./personas";
import { roles } from "./roles";
import { roleCategories } from "./role-categories";
import { contentItems } from "./content-items";
import { campaigns } from "./campaigns";

export const projectTasks = pgTable("project_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("monitor"),
  phase: varchar("phase", { length: 20 }).notNull().default("detection"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  assignmentType: varchar("assignment_type", { length: 20 }).default("persona"),
  assignedPersonaId: uuid("assigned_persona_id")
    .references(() => personas.id, { onDelete: "set null" }),
  assignedRoleId: uuid("assigned_role_id")
    .references(() => roles.id, { onDelete: "set null" }),
  assignedRoleCategoryId: uuid("assigned_role_category_id")
    .references(() => roleCategories.id, { onDelete: "set null" }),
  contentItemId: uuid("content_item_id")
    .references(() => contentItems.id, { onDelete: "set null" }),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "set null" }),
  platform: varchar("platform", { length: 50 }),
  deadline: timestamp("deadline", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
