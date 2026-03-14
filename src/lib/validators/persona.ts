import { z } from "zod";

export const personaCreateSchema = z.object({
  name: z.string().min(1, "İsim zorunludur").max(255),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  personalityTraits: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  behavioralPatterns: z
    .record(z.string(), z.unknown())
    .default({}),
  gender: z.enum(["erkek", "kadın"]).optional(),
  birthDate: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  language: z.string().default("tr"),
  timezone: z.string().default("Europe/Istanbul"),
  activeHoursStart: z.number().min(0).max(23).default(9),
  activeHoursEnd: z.number().min(0).max(23).default(23),
  maxPostsPerDay: z.number().min(1).max(100).default(5),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
});

export const personaUpdateSchema = personaCreateSchema.partial();

export type PersonaCreateInput = z.infer<typeof personaCreateSchema>;
export type PersonaUpdateInput = z.infer<typeof personaUpdateSchema>;
