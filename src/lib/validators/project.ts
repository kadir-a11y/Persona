import { z } from "zod";

// ── Enum değerleri ───────────────────────────────────────────────────
export const projectTypes = ["crisis_management", "reputation_defense", "perception_operation", "monitoring"] as const;
export const projectSeverities = ["critical", "high", "medium", "low"] as const;
export const projectStatuses = ["detected", "analyzing", "responding", "monitoring", "resolved", "archived"] as const;
export const teamRoles = ["defender", "monitor", "amplifier", "reporter", "coordinator"] as const;
export const assignmentTypes = ["persona", "role", "role_category"] as const;
export const mentionSentiments = ["positive", "negative", "neutral"] as const;
export const mentionResponseStatuses = ["not_needed", "pending", "assigned", "responded", "ignored"] as const;
export const taskTypes = ["create_content", "reply", "report", "monitor", "escalate", "analyze", "coordinate"] as const;
export const taskPhases = ["detection", "analysis", "response", "monitoring", "resolution"] as const;
export const taskPriorities = ["urgent", "high", "medium", "low"] as const;
export const taskStatuses = ["pending", "in_progress", "completed", "cancelled"] as const;
export const timelineEventTypes = [
  "incident", "detection", "team_assigned", "task_created", "content_published",
  "mention_detected", "severity_change", "status_change", "escalation", "resolution", "note",
] as const;

// ── Proje ────────────────────────────────────────────────────────────
export const projectCreateSchema = z.object({
  name: z.string().min(2, "Proje adı en az 2 karakter olmalı").max(255),
  description: z.string().max(5000).optional(),
  type: z.enum(projectTypes).default("monitoring"),
  severity: z.enum(projectSeverities).default("medium"),
  clientName: z.string().max(255).optional(),
  clientInfo: z.record(z.unknown()).default({}),
  languages: z.array(z.string()).min(1, "En az bir dil seçilmelidir").default(["tr"]),
  keywords: z.array(z.string()).default([]),
  startedAt: z.string().datetime().optional(),
  playbookId: z.string().uuid().optional(),
});

export const projectUpdateSchema = projectCreateSchema.omit({ playbookId: true }).partial();

// ── Ekip Ataması ─────────────────────────────────────────────────────
export const teamAssignmentSchema = z
  .object({
    assignmentType: z.enum(assignmentTypes),
    personaId: z.string().uuid().optional(),
    roleId: z.string().uuid().optional(),
    roleCategoryId: z.string().uuid().optional(),
    teamRole: z.enum(teamRoles).default("monitor"),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.assignmentType === "persona") return !!data.personaId;
      if (data.assignmentType === "role") return !!data.roleId;
      if (data.assignmentType === "role_category") return !!data.roleCategoryId;
      return false;
    },
    { message: "Atama tipine uygun ID belirtilmelidir" }
  );

export const bulkTeamAssignmentSchema = z.object({
  assignments: z.array(teamAssignmentSchema).min(1, "En az bir atama gereklidir"),
});

// ── Mention ──────────────────────────────────────────────────────────
export const mentionCreateSchema = z.object({
  platform: z.string().min(1).max(50),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceAuthor: z.string().max(255).optional(),
  content: z.string().min(1, "İçerik zorunludur").max(10000),
  sentiment: z.enum(mentionSentiments).default("neutral"),
  reachEstimate: z.number().int().min(0).optional(),
  engagementCount: z.number().int().min(0).default(0),
  requiresResponse: z.boolean().default(false),
  detectedAt: z.string().datetime().optional(),
});

export const mentionUpdateSchema = mentionCreateSchema.partial().extend({
  responseStatus: z.enum(mentionResponseStatuses).optional(),
  assignedPersonaId: z.string().uuid().nullable().optional(),
});

export const bulkMentionCreateSchema = z.object({
  mentions: z.array(mentionCreateSchema).min(1).max(500),
});

// ── Proje Görevi ─────────────────────────────────────────────────────
export const projectTaskCreateSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur").max(500),
  description: z.string().max(5000).optional(),
  type: z.enum(taskTypes).default("monitor"),
  phase: z.enum(taskPhases).default("detection"),
  priority: z.enum(taskPriorities).default("medium"),
  assignmentType: z.enum(assignmentTypes).optional(),
  assignedPersonaId: z.string().uuid().optional(),
  assignedRoleId: z.string().uuid().optional(),
  assignedRoleCategoryId: z.string().uuid().optional(),
  platform: z.string().max(50).optional(),
  deadline: z.string().datetime().optional(),
});

export const projectTaskUpdateSchema = projectTaskCreateSchema.partial().extend({
  status: z.enum(taskStatuses).optional(),
  contentItemId: z.string().uuid().nullable().optional(),
  campaignId: z.string().uuid().nullable().optional(),
});

export const bulkProjectTaskCreateSchema = z.object({
  tasks: z.array(projectTaskCreateSchema).min(1).max(100),
});

// ── Timeline ─────────────────────────────────────────────────────────
export const timelineEventCreateSchema = z.object({
  eventType: z.enum(timelineEventTypes),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  metadata: z.record(z.unknown()).default({}),
});

// ── Playbook ─────────────────────────────────────────────────────────
export const playbookTaskTemplateSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(taskTypes),
  phase: z.enum(taskPhases),
  priority: z.enum(taskPriorities),
  assignmentType: z.enum(assignmentTypes).optional(),
  teamRole: z.enum(teamRoles).optional(),
  platform: z.string().max(50).optional(),
});

export const playbookTeamTemplateSchema = z.object({
  assignmentType: z.enum(assignmentTypes),
  teamRole: z.enum(teamRoles),
  roleId: z.string().uuid().optional(),
  roleCategoryId: z.string().uuid().optional(),
});

export const playbookCreateSchema = z.object({
  name: z.string().min(2, "Playbook adı en az 2 karakter olmalı").max(255),
  description: z.string().max(5000).optional(),
  type: z.enum(projectTypes).default("monitoring"),
  templateTasks: z.array(playbookTaskTemplateSchema).default([]),
  templateTeam: z.array(playbookTeamTemplateSchema).default([]),
  defaultKeywords: z.array(z.string()).default([]),
});

export const playbookUpdateSchema = playbookCreateSchema.partial();

export const applyPlaybookSchema = z.object({
  playbookId: z.string().uuid(),
});

// ── Type exports ─────────────────────────────────────────────────────
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type TeamAssignmentInput = z.infer<typeof teamAssignmentSchema>;
export type BulkTeamAssignmentInput = z.infer<typeof bulkTeamAssignmentSchema>;
export type MentionCreateInput = z.infer<typeof mentionCreateSchema>;
export type MentionUpdateInput = z.infer<typeof mentionUpdateSchema>;
export type ProjectTaskCreateInput = z.infer<typeof projectTaskCreateSchema>;
export type ProjectTaskUpdateInput = z.infer<typeof projectTaskUpdateSchema>;
export type TimelineEventCreateInput = z.infer<typeof timelineEventCreateSchema>;
export type PlaybookCreateInput = z.infer<typeof playbookCreateSchema>;
export type PlaybookUpdateInput = z.infer<typeof playbookUpdateSchema>;
