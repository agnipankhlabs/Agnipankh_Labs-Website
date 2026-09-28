import { Resend } from "resend";
import { SITE } from "@/content/site";

/**
 * Transactional email via Resend (PRD-mandated).
 *
 * Email delivery NEVER blocks a form submission. The Lead row is written first
 * and committed; if Resend then fails, the lead is still captured and the user
 * still sees success. Losing a lead because a third-party mail API had a bad
 * minute is the worse outcome — the row is the record, the email is the alert.
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? `${SITE.name} <${SITE.email.info}>`;

export interface SendResult {
  sent: boolean;
  error?: string;
}

async function send(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!resend) {
    // Loud in dev so nobody assumes mail is going out during local testing.
    console.warn(
      `[email] RESEND_API_KEY not set — not sending "${options.subject}" to ${options.to}`,
    );
    return { sent: false, error: "not-configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    if (error) {
      console.error("[email] Resend rejected the message:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] send threw:", error);
    return { sent: false, error: String(error) };
  }
}

/** Escapes user-supplied text before it enters an HTML email body. */
function esc(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function table(rows: Array<[string, string | null | undefined]>): string {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:6px 12px 6px 0;color:#374151;font:14px/1.5 system-ui;vertical-align:top;white-space:nowrap"><strong>${esc(label)}</strong></td>
           <td style="padding:6px 0;color:#0f172a;font:14px/1.5 system-ui">${esc(value)}</td>
         </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0">${cells}</table>`;
}

function shell(heading: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f4f6">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:28px">
      <p style="margin:0 0 4px;font:600 12px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#b35100">${esc(SITE.name)}</p>
      <h1 style="margin:0 0 20px;font:700 20px/1.3 system-ui;color:#0f172a">${esc(heading)}</h1>
      ${body}
    </div>
  </body></html>`;
}

// --- Internal notifications ------------------------------------------------

export function notifyContact(input: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  return send({
    to: process.env.EMAIL_TO_CONTACT ?? SITE.email.info,
    replyTo: input.email,
    subject: `New enquiry from ${input.name}`,
    html: shell(
      "New contact enquiry",
      table([
        ["Name", input.name],
        ["Email", input.email],
        ["Phone", input.phone],
        ["Message", input.message],
      ]),
    ),
  });
}

export function notifyPartnership(input: {
  name: string;
  email: string;
  phone?: string | null;
  partnerType: string;
  organizationName: string;
  designation?: string | null;
  city?: string | null;
  message: string;
}) {
  return send({
    to: process.env.EMAIL_TO_PARTNERSHIPS ?? SITE.email.partnerships,
    replyTo: input.email,
    subject: `${input.partnerType} partnership enquiry — ${input.organizationName}`,
    html: shell(
      "New partnership enquiry",
      table([
        ["Track", input.partnerType],
        ["Organisation", input.organizationName],
        ["Contact", input.name],
        ["Designation", input.designation],
        ["Email", input.email],
        ["Phone", input.phone],
        ["City", input.city],
        ["Message", input.message],
      ]),
    ),
  });
}

// --- User-facing acknowledgement -------------------------------------------

export function acknowledgeEnquiry(to: string, name: string) {
  return send({
    to,
    subject: `We've received your message — ${SITE.name}`,
    html: shell(
      `Thank you, ${name}`,
      `<p style="margin:0 0 16px;font:15px/1.6 system-ui;color:#374151">
         We've received your message and someone from our team will get back to you
         within one working day.
       </p>
       <p style="margin:0 0 16px;font:15px/1.6 system-ui;color:#374151">
         If your enquiry is urgent, reply to this email or write to
         <a href="mailto:${SITE.email.support}" style="color:#b35100">${SITE.email.support}</a>.
       </p>
       <p style="margin:24px 0 0;font:13px/1.6 system-ui;color:#6b7280">
         ${esc(SITE.name)} — ${esc(SITE.tagline)}
       </p>`,
    ),
  });
}
