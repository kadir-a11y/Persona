import { z } from "zod";

export const emailAccountCreateSchema = z.object({
  personaId: z.string().uuid(),
  provider: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().optional(),
  phone: z.string().max(50).optional(),
  recoveryEmail: z.string().max(255).optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.string().max(10).optional(),
  imapHost: z.string().max(255).optional(),
  imapPort: z.string().max(10).optional(),
  apiKey: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const emailAccountUpdateSchema = emailAccountCreateSchema.partial();

export type EmailAccountCreateInput = z.infer<typeof emailAccountCreateSchema>;
export type EmailAccountUpdateInput = z.infer<typeof emailAccountUpdateSchema>;
