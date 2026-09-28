import { z } from "zod";

export const applicationSchema = z.object({
  internshipSlug: z
    .string()
    .min(1, "Internship track is required."),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  college: z
    .string()
    .trim()
    .min(3, "College / University name is required.")
    .max(150, "College name cannot exceed 150 characters."),
  degree: z
    .string()
    .trim()
    .min(2, "Degree / Program is required.")
    .max(100, "Degree cannot exceed 100 characters."),
  branch: z
    .string()
    .trim()
    .min(2, "Branch / Specialization is required.")
    .max(100, "Branch cannot exceed 100 characters."),
  graduationYear: z.coerce
    .number()
    .int("Graduation year must be a whole number.")
    .min(2020, "Graduation year must be 2020 or later.")
    .max(2032, "Graduation year must be 2032 or earlier."),
  statementOfPurpose: z
    .string()
    .trim()
    .min(30, "Please provide at least 30 characters explaining your interest and goals for this cohort.")
    .max(1500, "Statement of purpose cannot exceed 1500 characters."),
  githubUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://github.com/yourhandle)")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://linkedin.com/in/yourhandle)")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://yourportfolio.com)")
    .optional()
    .or(z.literal("")),
  agreeTerms: z
    .boolean()
    .refine((val) => val === true, "You must acknowledge the program guidelines to apply."),
  agreeDisclaimer: z
    .boolean()
    .refine((val) => val === true, "You must acknowledge the statutory training disclaimer."),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
