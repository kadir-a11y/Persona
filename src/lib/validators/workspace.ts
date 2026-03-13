import { z } from "zod";

export const workspaceSessionStatuses = ["active", "completed", "archived"] as const;
export const workspaceResponseStatuses = ["pending_review", "approved", "rejected", "published", "failed"] as const;
export const workspaceContentTypes = ["reply", "comment", "post", "like", "retweet", "quote"] as const;
export const workspacePlatforms = ["twitter", "instagram", "facebook", "linkedin", "tiktok"] as const;
export const workspaceSentiments = ["positive", "negative", "neutral", "supportive", "defensive"] as const;

export const workspaceSessionCreateSchema = z.object({
  sourceContentId: z.string().uuid().optional(),
  aiCommand: z.string().min(1, "AI komutu zorunludur").max(5000),
  selectedPersonaIds: z.array(z.string().uuid()).min(1, "En az bir persona seçilmelidir").max(100),
  personaFilterCriteria: z.record(z.unknown()).default({}),
  platform: z.enum(workspacePlatforms),
});

export const workspaceSessionUpdateSchema = z.object({
  aiCommand: z.string().min(1).max(5000).optional(),
  selectedPersonaIds: z.array(z.string().uuid()).min(1).max(100).optional(),
  personaFilterCriteria: z.record(z.unknown()).optional(),
  platform: z.enum(workspacePlatforms).optional(),
  status: z.enum(workspaceSessionStatuses).optional(),
});

export const workspaceGenerateSchema = z.object({
  contentType: z.enum(workspaceContentTypes).default("reply"),
  sentimentDirection: z.enum(workspaceSentiments).optional(),
  temperature: z.number().min(0).max(1).default(0.85),
});

export const workspaceResponseUpdateSchema = z.object({
  editedContent: z.string().min(1).max(10000),
});

export const workspaceBulkApproveSchema = z.object({
  responseIds: z.array(z.string().uuid()).min(1),
});

export const workspacePublishSchema = z.object({
  sessionId: z.string().uuid(),
  staggerMinutes: z.number().min(1).max(60).default(5),
});

export type WorkspaceSessionCreateInput = z.infer<typeof workspaceSessionCreateSchema>;
export type WorkspaceSessionUpdateInput = z.infer<typeof workspaceSessionUpdateSchema>;
export type WorkspaceGenerateInput = z.infer<typeof workspaceGenerateSchema>;
export type WorkspaceResponseUpdateInput = z.infer<typeof workspaceResponseUpdateSchema>;
export type WorkspaceBulkApproveInput = z.infer<typeof workspaceBulkApproveSchema>;
export type WorkspacePublishInput = z.infer<typeof workspacePublishSchema>;
