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
  message: text("message").notNull().default(""),
  /** "sent" once the notification email went out, otherwise "pending" or "failed". */
  notified: text("notified").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
