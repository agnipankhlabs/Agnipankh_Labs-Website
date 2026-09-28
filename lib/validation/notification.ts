import { z } from "zod";

export const notificationKindSchema = z.enum(["info", "success", "warning", "error", "system"]);

export const createNotificationSchema = z.object({
  userId: z.string().cuid("Invalid user ID."),
  title: z.string().min(1, "Title is required.").max(200),
  body: z.string().max(5000).optional().nullable(),
  href: z.string().url("Invalid URL.").max(2048).optional().nullable(),
  kind: notificationKindSchema.default("info"),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(5000).optional().nullable(),
  href: z.string().url().max(2048).optional().nullable(),
  kind: notificationKindSchema.optional(),
  readAt: z.date().optional().nullable(),
});

export const markAsReadSchema = z.object({
  notificationId: z.string().cuid(),
});

export const markAllAsReadSchema = z.object({
  userId: z.string().cuid(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;