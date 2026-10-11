import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { emailConfigured, sendEmail } from "../services/email";

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const LOCATION_LABEL: Record<string, string> = {
  "1": "One location",
  "2": "Two locations",
  "3+": "Three or more",
};

export const inquiries = {
  create: base
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(200),
        restaurant: z.string().trim().min(1).max(160),
        locations: z.enum(["1", "2", "3+"]),
        message: z.string().trim().max(4000).default(""),
        /** Honeypot: hidden from people, filled in by bots. */
        website: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { website, ...fields } = input;
      if (website) return { ok: true as const };

      let row: { id: number };
      try {
        [row] = await db.insert(schema.inquiries).values(fields).returning({
          id: schema.inquiries.id,
        });
      } catch (err) {
        console.error("inquiry insert failed", err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Could not save the inquiry" });
      }

      if (emailConfigured()) {
        const when = new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
        const lines = [
          ["Name", fields.name],
          ["Email", fields.email],
          ["Restaurant", fields.restaurant],
          ["Locations", LOCATION_LABEL[fields.locations]],
          ["Received", `${when} (Mountain)`],
        ];
        const text = `${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${fields.message || "(No message)"}\n\nReply to this email to answer ${fields.name} directly.`;
        const html = `<div style="font-family:Georgia,serif;color:#1b1a17;font-size:15px;line-height:1.6">
<h2 style="font-weight:400;margin:0 0 16px">New discovery conversation request</h2>
<table style="border-collapse:collapse">${lines
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 18px 4px 0;color:#77715e">${k}</td><td style="padding:4px 0">${escape(v)}</td></tr>`,
          )
          .join("")}</table>
<p style="margin:20px 0 6px;color:#77715e">What is on their mind</p>
<p style="margin:0;white-space:pre-wrap">${escape(fields.message || "(No message)")}</p>
<p style="margin:24px 0 0;color:#77715e;font-size:13px">Reply to this email to answer ${escape(fields.name)} directly.</p></div>`;
        try {
          await sendEmail({
            to: process.env.INQUIRY_NOTIFY_EMAIL!,
            subject: `New inquiry: ${fields.restaurant} (${fields.name})`,
            text,
            html,
            replyTo: fields.email,
          });
          await db
            .update(schema.inquiries)
            .set({ notified: "sent" })
            .where(eq(schema.inquiries.id, row.id));
        } catch (err) {
          // The inquiry is already saved; a failed notification must not lose it.
          console.error("inquiry email failed", err);
          await db
            .update(schema.inquiries)
            .set({ notified: "failed" })
            .where(eq(schema.inquiries.id, row.id));
        }
      }

      return { ok: true as const };
    }),
};
