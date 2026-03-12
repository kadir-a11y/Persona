import { z } from "zod";

export const forumAccountCreateSchema = z.object({
  personaId: z.string().uuid(),
  portalName: z.string().min(1).max(255),
  portalUrl: z.string().max(500).optional(),
  username: z.string().max(255).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  password: z.string().optional(),
  apiEndpoint: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecretKey: z.string().optional(),
  accessToken: z.string().optional(),
  accessTokenSecret: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const forumAccountUpdateSchema = forumAccountCreateSchema.partial();

export type ForumAccountCreateInput = z.infer<typeof forumAccountCreateSchema>;
export type ForumAccountUpdateInput = z.infer<typeof forumAccountUpdateSchema>;
