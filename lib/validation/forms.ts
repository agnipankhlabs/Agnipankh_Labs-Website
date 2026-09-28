import { z } from "zod";

/**
 * Validation for every public form. Shared by the client (for inline feedback)
 * and the server action (as the actual gate) — the client copy is a convenience,
 * never the enforcement point.
 *
 * One `Lead` table backs all of these, so the shapes below are the discriminated
 * variants of a single model rather than unrelated schemas.
 */

/** Indian mobile numbers, with or without +91 / 0 prefix. Optional everywhere. */
const phone = z
  .string()
  .trim()
  .regex(
    /^(?:\+?91[\s-]?)?[6-9]\d{9}$/,
    "Enter a 10-digit Indian mobile number.",
  );

const name = z
  .string()
  .trim()
  .min(2, "Please enter your name.")
  .max(100, "That name is too long.");

const email = z
  .email("Enter a valid email address.")
  .trim()
  .toLowerCase()
  .max(254);

/**
 * Honeypot. Real users never see this field, so any value in it means a bot.
 * Kept in the schema (rather than checked ad hoc) so no form can forget it.
 */
const honeypot = z
  .string()
  .max(0, "Submission rejected.")
  .optional()
  .or(z.literal(""));

const message = z
  .string()
  .trim()
  .min(10, "Please tell us a little more — at least 10 characters.")
  .max(5000, "Please keep this under 5000 characters.");

/** Attribution captured from the URL, never user-entered. */
const attribution = z.object({
  sourceChannel: z.string().trim().max(120).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  referrerUrl: z.string().trim().max(2048).optional(),
});

export const contactSchema = attribution.extend({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  message,
  /** DPDP Act 2023 needs a recorded lawful basis; an unticked box is not consent. */
  consent: z
    .boolean()
    .refine((v) => v, "Please agree to the Privacy Policy to continue."),
  website: honeypot,
});

export const newsletterSchema = attribution.extend({
  email,
  website: honeypot,
});

export const partnershipSchema = attribution.extend({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  partnerType: z.enum(["COLLEGE", "CORPORATE", "CSR", "SPONSOR"]),
  organizationName: z
    .string()
    .trim()
    .min(2, "Please enter your organisation's name.")
    .max(200),
  designation: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  message,
  consent: z
    .boolean()
    .refine((v) => v, "Please agree to the Privacy Policy to continue."),
  website: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type PartnershipInput = z.infer<typeof partnershipSchema>;

/** Uniform result shape for every form action, so one client hook handles all. */
export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

/** Flattens a ZodError into the FormState shape above. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
