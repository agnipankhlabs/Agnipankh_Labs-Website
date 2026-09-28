import { z } from "zod";

export const ticketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_USER",
  "RESOLVED",
  "CLOSED",
]);

export const ticketPriorityEnum = z.enum([
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

export const ticketCategoryEnum = z.enum([
  "GENERAL",
  "TECHNICAL",
  "URGENT",
  "CERTIFICATE",
  "ACADEMIC",
]);

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required."),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_USER", "RESOLVED", "CLOSED"]),
});

export const updateTicketPrioritySchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required."),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required."),
  assignedToId: z.string().min(1, "Assignee user ID is required."),
});

export const addTicketReplySchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required."),
  body: z.string().trim().min(1, "Reply cannot be empty.").max(5000, "Reply cannot exceed 5000 characters."),
  isInternal: z.boolean().default(false),
});

export const createTicketSchema = z.object({
  requesterEmail: z.string().email("Valid email is required."),
  requesterName: z.string().trim().max(120).optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(200),
  body: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
  category: z.enum(["GENERAL", "TECHNICAL", "URGENT", "CERTIFICATE", "ACADEMIC"]).default("GENERAL"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  userId: z.string().optional(),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddTicketReplyInput = z.infer<typeof addTicketReplySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;