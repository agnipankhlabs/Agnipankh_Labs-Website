import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number.")
    .or(z.literal(""))
    .optional(),
  headline: z
    .string()
    .trim()
    .max(120, "Headline cannot exceed 120 characters.")
    .optional(),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1,000 characters.")
    .optional(),
  city: z
    .string()
    .trim()
    .max(100, "City cannot exceed 100 characters.")
    .optional(),
  state: z
    .string()
    .trim()
    .max(100, "State cannot exceed 100 characters.")
    .optional(),
  college: z
    .string()
    .trim()
    .max(150, "College name cannot exceed 150 characters.")
    .optional(),
  degree: z
    .string()
    .trim()
    .max(100, "Degree cannot exceed 100 characters.")
    .optional(),
  branch: z
    .string()
    .trim()
    .max(100, "Branch/Stream cannot exceed 100 characters.")
    .optional(),
  graduationYear: z.coerce
    .number()
    .int()
    .min(2000, "Graduation year must be valid.")
    .max(2035, "Graduation year must be realistic.")
    .optional()
    .nullable(),
  skills: z
    .string()
    .trim()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  githubUrl: z
    .string()
    .trim()
    .url("Please enter a valid GitHub URL.")
    .refine(
      (url) => !url || url.includes("github.com"),
      "Must be a valid GitHub link."
    )
    .or(z.literal(""))
    .optional(),
  linkedinUrl: z
    .string()
    .trim()
    .url("Please enter a valid LinkedIn URL.")
    .refine(
      (url) => !url || url.includes("linkedin.com"),
      "Must be a valid LinkedIn link."
    )
    .or(z.literal(""))
    .optional(),
  portfolioUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL.")
    .or(z.literal(""))
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
