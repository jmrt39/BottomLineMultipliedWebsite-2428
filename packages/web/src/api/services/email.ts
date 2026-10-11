interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

/** True once a Resend key and a notification address are configured in .env. */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFY_EMAIL);
}

/**
 * Sends through Resend's HTTP API. Without a verified domain, Resend only
 * delivers from onboarding@resend.dev to the account owner's own address,
 * which is exactly what an owner notification needs.
 */
export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailOptions) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM || "Bottom Line Multiplied <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
      reply_to: replyTo,
    }),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as { id: string };
}
