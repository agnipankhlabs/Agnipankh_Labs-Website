import { z } from "zod";

export const certificateTypeEnum = z.enum([
  "INTERNSHIP",
  "COURSE",
  "EXCELLENCE",
  "RECOGNITION",
  "LEADERSHIP",
  "CITATION",
]);

export const issueCertificateSchema = z.object({
  userId: z.string().trim().min(1, "Recipient user ID is required."),
  recipientEmail: z.string().trim().email("Valid recipient email is required."),
  verifiedFullLegalName: z
    .string()
    .trim()
    .min(2, "Full legal name must be at least 2 characters.")
    .max(120, "Full legal name cannot exceed 120 characters."),
  type: certificateTypeEnum,
  programName: z
    .string()
    .trim()
    .min(3, "Program name must be at least 3 characters.")
    .max(150, "Program name cannot exceed 150 characters."),
  trackName: z
    .string()
    .trim()
    .max(100, "Track name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  cohortStartDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  cohortEndDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  signatureAuthority: z
    .string()
    .trim()
    .min(3, "Authorized signatory is required.")
    .max(100, "Signatory title cannot exceed 100 characters.")
    .default("Director — Agnipankh Labs"),
  signatureRef: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const revokeCertificateSchema = z.object({
  certificateId: z.string().trim().min(1, "Certificate ID is required."),
  revokedReason: z
    .string()
    .trim()
    .min(5, "Revocation reason must be at least 5 characters.")
    .max(300, "Revocation reason cannot exceed 300 characters."),
});

export const supersedeCertificateSchema = z.object({
  originalCertificateId: z.string().trim().min(1, "Original certificate ID is required."),
  newCertificateId: z.string().trim().min(1, "New certificate ID is required."),
  supersessionReason: z
    .string()
    .trim()
    .min(5, "Supersession reason must be at least 5 characters.")
    .max(300, "Supersession reason cannot exceed 300 characters."),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type RevokeCertificateInput = z.infer<typeof revokeCertificateSchema>;
export type SupersedeCertificateInput = z.infer<typeof supersedeCertificateSchema>;
