import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */

/** Discovery conversation requests sent from the website's inquiry form. */
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  restaurant: text("restaurant").notNull(),
  locations: text("locations").notNull(),
  /** Qualification answers from the fit call form. Empty on older rows. */
  role: text("role").notNull().default(""),
  venue: text("venue").notNull().default(""),
  volume: text("volume").notNull().default(""),
  pos: text("pos").notNull().default(""),
  message: text("message").notNull().default(""),
  /** "yes" when they want to sign in 2026, on the 2026 terms (column name kept from the founder offer). */
  founder: text("founder").notNull().default("no"),
  /** "sent" once the notification email went out, otherwise "pending" or "failed". */
  notified: text("notified").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
