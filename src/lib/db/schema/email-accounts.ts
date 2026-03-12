import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { personas } from "./personas";

export const emailAccounts = pgTable("email_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: text("password"),
  phone: varchar("phone", { length: 50 }),
  recoveryEmail: varchar("recovery_email", { length: 255 }),
  smtpHost: varchar("smtp_host", { length: 255 }),
  smtpPort: varchar("smtp_port", { length: 10 }),
  imapHost: varchar("imap_host", { length: 255 }),
  imapPort: varchar("imap_port", { length: 10 }),
  apiKey: text("api_key"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
