import { z } from "zod";

export const internshipDomainEnum = z.enum([
  "WEB_DEVELOPMENT",
  "AI_ML",
  "DATA_SCIENCE",
  "CYBERSECURITY",
  "MARKETING",
  "HR",
]);

export const deliveryModeEnum = z.enum(["ONLINE", "OFFLINE", "HYBRID"]);

export const internshipSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title cannot exceed 120 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(80, "Slug cannot exceed 80 characters.")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens (e.g. cloud-native-dev)."
    ),
  domain: internshipDomainEnum,
  roleTitle: z
    .string()
    .trim()
    .min(3, "Role title must be at least 3 characters.")
    .max(100, "Role title cannot exceed 100 characters."),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters.")
    .max(500, "Summary cannot exceed 500 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description cannot exceed 5000 characters."),
  durationMonths: z.coerce
    .number()
    .int("Duration must be a whole number.")
    .min(1, "Duration must be at least 1 month.")
    .max(12, "Duration cannot exceed 12 months."),
  mode: deliveryModeEnum,
  feePaise: z.coerce
    .number()
    .int("Fee must be a valid integer in paise.")
    .min(0, "Fee cannot be negative."),
  learningObjectives: z
    .string()
    .trim()
    .min(5, "At least one learning objective is required."),
  skillRequirements: z
    .string()
    .trim()
    .min(5, "At least one skill requirement is required."),
  completionCriteria: z
    .string()
    .trim()
    .min(10, "Completion criteria must be at least 10 characters.")
    .max(1000, "Completion criteria cannot exceed 1000 characters."),
  isPublished: z.boolean().default(false),
});

export type InternshipInput = z.infer<typeof internshipSchema>;
