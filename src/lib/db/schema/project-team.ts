import { pgTable, uuid, varchar, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { personas } from "./personas";
import { roles } from "./roles";
import { roleCategories } from "./role-categories";

export const projectTeam = pgTable("project_team", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  assignmentType: varchar("assignment_type", { length: 20 }).notNull().default("persona"),
  personaId: uuid("persona_id")
    .references(() => personas.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .references(() => roles.id, { onDelete: "cascade" }),
  roleCategoryId: uuid("role_category_id")
    .references(() => roleCategories.id, { onDelete: "cascade" }),
  teamRole: varchar("team_role", { length: 20 }).notNull().default("monitor"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
});
