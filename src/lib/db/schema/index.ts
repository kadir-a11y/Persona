import { relations } from "drizzle-orm";

export { users } from "./users";
export { personas } from "./personas";
export { socialAccounts } from "./social-accounts";
export { forumAccounts } from "./forum-accounts";
export { emailAccounts } from "./email-accounts";
export { roleCategories } from "./role-categories";
export { roles } from "./roles";
export { personaRoles } from "./persona-roles";
export { tags } from "./tags";
export { personaTags } from "./persona-tags";
export { campaigns } from "./campaigns";
export { contentItems } from "./content-items";
export { mediaLibrary } from "./media";
export { activityLog } from "./activity-log";
export { projects } from "./projects";
export { projectTeam } from "./project-team";
export { projectMentions } from "./project-mentions";
export { projectTasks } from "./project-tasks";
export { projectTimeline } from "./project-timeline";
export { projectPlaybooks } from "./project-playbooks";
export { bugReports } from "./bug-reports";
export { monitoredTopics } from "./monitored-topics";
export { monitoringSources } from "./monitoring-sources";
export { discoveredItems } from "./discovered-items";
export { autoPostRules } from "./auto-post-rules";
export { engagementMetrics } from "./engagement-metrics";
export { workspaceSessions } from "./workspace-sessions";
export { workspaceResponses } from "./workspace-responses";
export { organicActivityConfig, organicActivityLog } from "./organic-activity";
export { userPreferences } from "./user-preferences";
export { teamTasks } from "./team-tasks";

import { users } from "./users";
import { personas } from "./personas";
import { socialAccounts } from "./social-accounts";
import { forumAccounts } from "./forum-accounts";
import { emailAccounts } from "./email-accounts";
import { roleCategories } from "./role-categories";
import { roles } from "./roles";
import { personaRoles } from "./persona-roles";
import { tags } from "./tags";
import { personaTags } from "./persona-tags";
import { campaigns } from "./campaigns";
import { contentItems } from "./content-items";
import { mediaLibrary } from "./media";
import { activityLog } from "./activity-log";
import { projects } from "./projects";
import { projectTeam } from "./project-team";
import { projectMentions } from "./project-mentions";
import { projectTasks } from "./project-tasks";
import { projectTimeline } from "./project-timeline";
import { projectPlaybooks } from "./project-playbooks";
import { bugReports } from "./bug-reports";
import { monitoredTopics } from "./monitored-topics";
import { monitoringSources } from "./monitoring-sources";
import { discoveredItems } from "./discovered-items";
import { autoPostRules } from "./auto-post-rules";
import { engagementMetrics } from "./engagement-metrics";
import { workspaceSessions } from "./workspace-sessions";
import { workspaceResponses } from "./workspace-responses";
import { organicActivityConfig, organicActivityLog } from "./organic-activity";
import { userPreferences } from "./user-preferences";
import { teamTasks } from "./team-tasks";

// ── Users relations ──────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  personas: many(personas),
  tags: many(tags),
  roleCategories: many(roleCategories),
  roles: many(roles),
  campaigns: many(campaigns),
  activityLogs: many(activityLog),
  projects: many(projects),
  playbooks: many(projectPlaybooks),
  bugReports: many(bugReports),
  monitoredTopics: many(monitoredTopics),
  preferences: many(userPreferences),
  assignedTasks: many(teamTasks),
}));

// ── User preferences relations ──────────────────────────────────────
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// ── Personas relations ───────────────────────────────────────────────
export const personasRelations = relations(personas, ({ one, many }) => ({
  user: one(users, {
    fields: [personas.userId],
    references: [users.id],
  }),
  socialAccounts: many(socialAccounts),
  forumAccounts: many(forumAccounts),
  emailAccounts: many(emailAccounts),
  contentItems: many(contentItems),
  personaTags: many(personaTags),
  personaRoles: many(personaRoles),
  media: many(mediaLibrary),
  projectTeamAssignments: many(projectTeam),
}));

// ── Social accounts relations ────────────────────────────────────────
export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [socialAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Forum accounts relations ────────────────────────────────────────
export const forumAccountsRelations = relations(forumAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [forumAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Email accounts relations ────────────────────────────────────────
export const emailAccountsRelations = relations(emailAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [emailAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Role categories relations ───────────────────────────────────────
export const roleCategoriesRelations = relations(roleCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [roleCategories.userId],
    references: [users.id],
  }),
  roles: many(roles),
  projectTeamAssignments: many(projectTeam),
}));

// ── Roles relations ─────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ one, many }) => ({
  user: one(users, {
    fields: [roles.userId],
    references: [users.id],
  }),
  category: one(roleCategories, {
    fields: [roles.categoryId],
    references: [roleCategories.id],
  }),
  personaRoles: many(personaRoles),
  projectTeamAssignments: many(projectTeam),
}));

// ── Persona roles (join table) relations ────────────────────────────
export const personaRolesRelations = relations(personaRoles, ({ one }) => ({
  persona: one(personas, {
    fields: [personaRoles.personaId],
    references: [personas.id],
  }),
  role: one(roles, {
    fields: [personaRoles.roleId],
    references: [roles.id],
  }),
}));

// ── Tags relations ───────────────────────────────────────────────────
export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  personaTags: many(personaTags),
}));

// ── Persona tags (join table) relations ──────────────────────────────
export const personaTagsRelations = relations(personaTags, ({ one }) => ({
  persona: one(personas, {
    fields: [personaTags.personaId],
    references: [personas.id],
  }),
  tag: one(tags, {
    fields: [personaTags.tagId],
    references: [tags.id],
  }),
}));

// ── Campaigns relations ──────────────────────────────────────────────
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [campaigns.projectId],
    references: [projects.id],
  }),
  contentItems: many(contentItems),
}));

// ── Content items relations ──────────────────────────────────────────
export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  persona: one(personas, {
    fields: [contentItems.personaId],
    references: [personas.id],
  }),
  campaign: one(campaigns, {
    fields: [contentItems.campaignId],
    references: [campaigns.id],
  }),
  project: one(projects, {
    fields: [contentItems.projectId],
    references: [projects.id],
  }),
  workspaceResponse: one(workspaceResponses, {
    fields: [contentItems.workspaceResponseId],
    references: [workspaceResponses.id],
  }),
  engagementMetrics: many(engagementMetrics),
}));

// ── Engagement metrics relations ────────────────────────────────────
export const engagementMetricsRelations = relations(engagementMetrics, ({ one }) => ({
  contentItem: one(contentItems, {
    fields: [engagementMetrics.contentItemId],
    references: [contentItems.id],
  }),
}));

// ── Media library relations ─────────────────────────────────────────
export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  persona: one(personas, {
    fields: [mediaLibrary.personaId],
    references: [personas.id],
  }),
}));

// ── Activity log relations ───────────────────────────────────────────
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// ── Projects relations ───────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  team: many(projectTeam),
  mentions: many(projectMentions),
  tasks: many(projectTasks),
  timeline: many(projectTimeline),
  workspaceSessions: many(workspaceSessions),
  workspaceResponses: many(workspaceResponses),
  organicActivityConfigs: many(organicActivityConfig),
}));

// ── Project team relations ───────────────────────────────────────────
export const projectTeamRelations = relations(projectTeam, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeam.projectId],
    references: [projects.id],
  }),
  persona: one(personas, {
    fields: [projectTeam.personaId],
    references: [personas.id],
  }),
  role: one(roles, {
    fields: [projectTeam.roleId],
    references: [roles.id],
  }),
  roleCategory: one(roleCategories, {
    fields: [projectTeam.roleCategoryId],
    references: [roleCategories.id],
  }),
}));

// ── Project mentions relations ───────────────────────────────────────
export const projectMentionsRelations = relations(projectMentions, ({ one }) => ({
  project: one(projects, {
    fields: [projectMentions.projectId],
    references: [projects.id],
  }),
  assignedPersona: one(personas, {
    fields: [projectMentions.assignedPersonaId],
    references: [personas.id],
  }),
  respondedContent: one(contentItems, {
    fields: [projectMentions.respondedContentId],
    references: [contentItems.id],
  }),
}));

// ── Project tasks relations ──────────────────────────────────────────
export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
  assignedPersona: one(personas, {
    fields: [projectTasks.assignedPersonaId],
    references: [personas.id],
  }),
  assignedRole: one(roles, {
    fields: [projectTasks.assignedRoleId],
    references: [roles.id],
  }),
  assignedRoleCategory: one(roleCategories, {
    fields: [projectTasks.assignedRoleCategoryId],
    references: [roleCategories.id],
  }),
  contentItem: one(contentItems, {
    fields: [projectTasks.contentItemId],
    references: [contentItems.id],
  }),
  campaign: one(campaigns, {
    fields: [projectTasks.campaignId],
    references: [campaigns.id],
  }),
}));

// ── Project timeline relations ───────────────────────────────────────
export const projectTimelineRelations = relations(projectTimeline, ({ one }) => ({
  project: one(projects, {
    fields: [projectTimeline.projectId],
    references: [projects.id],
  }),
}));

// ── Bug reports relations ───────────────────────────────────────────
export const bugReportsRelations = relations(bugReports, ({ one }) => ({
  user: one(users, {
    fields: [bugReports.userId],
    references: [users.id],
  }),
}));

// ── Monitored topics relations ─────────────────────────────────────
export const monitoredTopicsRelations = relations(monitoredTopics, ({ one, many }) => ({
  user: one(users, {
    fields: [monitoredTopics.userId],
    references: [users.id],
  }),
  sources: many(monitoringSources),
  discoveredItems: many(discoveredItems),
  autoPostRules: many(autoPostRules),
}));

// ── Monitoring sources relations ───────────────────────────────────
export const monitoringSourcesRelations = relations(monitoringSources, ({ one, many }) => ({
  topic: one(monitoredTopics, {
    fields: [monitoringSources.topicId],
    references: [monitoredTopics.id],
  }),
  discoveredItems: many(discoveredItems),
}));

// ── Discovered items relations ─────────────────────────────────────
export const discoveredItemsRelations = relations(discoveredItems, ({ one }) => ({
  topic: one(monitoredTopics, {
    fields: [discoveredItems.topicId],
    references: [monitoredTopics.id],
  }),
  source: one(monitoringSources, {
    fields: [discoveredItems.sourceId],
    references: [monitoringSources.id],
  }),
}));

// ── Auto post rules relations ──────────────────────────────────────
export const autoPostRulesRelations = relations(autoPostRules, ({ one }) => ({
  topic: one(monitoredTopics, {
    fields: [autoPostRules.topicId],
    references: [monitoredTopics.id],
  }),
}));

// ── Project playbooks relations ──────────────────────────────────────
export const projectPlaybooksRelations = relations(projectPlaybooks, ({ one }) => ({
  user: one(users, {
    fields: [projectPlaybooks.userId],
    references: [users.id],
  }),
}));

// ── Workspace sessions relations ─────────────────────────────────────
export const workspaceSessionsRelations = relations(workspaceSessions, ({ one, many }) => ({
  project: one(projects, {
    fields: [workspaceSessions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [workspaceSessions.userId],
    references: [users.id],
  }),
  sourceContent: one(projectMentions, {
    fields: [workspaceSessions.sourceContentId],
    references: [projectMentions.id],
  }),
  responses: many(workspaceResponses),
}));

// ── Workspace responses relations ────────────────────────────────────
export const workspaceResponsesRelations = relations(workspaceResponses, ({ one }) => ({
  session: one(workspaceSessions, {
    fields: [workspaceResponses.sessionId],
    references: [workspaceSessions.id],
  }),
  project: one(projects, {
    fields: [workspaceResponses.projectId],
    references: [projects.id],
  }),
  persona: one(personas, {
    fields: [workspaceResponses.personaId],
    references: [personas.id],
  }),
  sourceContent: one(projectMentions, {
    fields: [workspaceResponses.sourceContentId],
    references: [projectMentions.id],
  }),
  contentItem: one(contentItems, {
    fields: [workspaceResponses.contentItemId],
    references: [contentItems.id],
  }),
}));

// ── Organic activity config relations ────────────────────────────────
export const organicActivityConfigRelations = relations(organicActivityConfig, ({ one, many }) => ({
  project: one(projects, {
    fields: [organicActivityConfig.projectId],
    references: [projects.id],
  }),
  persona: one(personas, {
    fields: [organicActivityConfig.personaId],
    references: [personas.id],
  }),
  logs: many(organicActivityLog),
}));

// ── Team tasks relations ────────────────────────────────────────────
export const teamTasksRelations = relations(teamTasks, ({ one }) => ({
  assignedUser: one(users, {
    fields: [teamTasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [teamTasks.createdBy],
    references: [users.id],
  }),
}));

// ── Organic activity log relations ───────────────────────────────────
export const organicActivityLogRelations = relations(organicActivityLog, ({ one }) => ({
  config: one(organicActivityConfig, {
    fields: [organicActivityLog.configId],
    references: [organicActivityConfig.id],
  }),
  project: one(projects, {
    fields: [organicActivityLog.projectId],
    references: [projects.id],
  }),
  persona: one(personas, {
    fields: [organicActivityLog.personaId],
    references: [personas.id],
  }),
}));
