import { z } from "zod";

export const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED_LOST",
]);

export const leadKindEnum = z.enum([
  "CONTACT",
  "NEWSLETTER",
  "PARTNERSHIP",
  "CAREERS",
  "MENTOR_APPLICATION",
  "TRAINER_APPLICATION",
  "CAMPUS_AMBASSADOR",
  "CORPORATE_HIRING",
]);

export const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required."),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED_LOST"]),
});

export const addLeadNoteSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required."),
  note: z.string().trim().min(1, "Note cannot be empty.").max(2000, "Note cannot exceed 2000 characters."),
});

export const assignLeadSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required."),
  handledById: z.string().min(1, "Handler user ID is required."),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;