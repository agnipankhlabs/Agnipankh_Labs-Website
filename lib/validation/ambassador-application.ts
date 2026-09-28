import { z } from "zod";

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

const honeypot = z
  .string()
  .max(0, "Submission rejected.")
  .optional()
  .or(z.literal(""));

const motivation = z
  .string()
  .trim()
  .min(100, "Please share more about your motivation — at least 100 characters.")
  .max(5000, "Please keep this under 5000 characters.");

const url = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .max(2048)
  .optional()
  .or(z.literal(""));

const year = z.enum(["1", "2", "3", "4", "5"]);

const attribution = z.object({
  sourceChannel: z.string().trim().max(120).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  referrerUrl: z.string().trim().max(2048).optional(),
});

export const ambassadorApplicationSchema = attribution.extend({
  name,
  email,
  phone,
  college: z.string().trim().min(2, "Please enter your college/university name.").max(200),
  course: z.string().trim().min(2, "Please enter your course/program.").max(200),
  year,
  linkedin: url,
  github: url,
  motivation,
  consent: z
    .boolean()
    .refine((v) => v, "Please agree to the Terms of Service and Privacy Policy to continue."),
  website: honeypot,
});

export type AmbassadorApplicationInput = z.infer<typeof ambassadorApplicationSchema>;