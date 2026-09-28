import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title cannot exceed 120 characters."),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters.").max(120, "Slug cannot exceed 120 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  kind: z.enum(["WEBINAR", "BOOTCAMP", "HACKATHON", "INNOVATION_CHALLENGE", "COMPETITION", "MASTERCLASS"]),
  description: z.string().trim().max(5000, "Description cannot exceed 5,000 characters.").optional().or(z.literal("")),
  startsAt: z.string().min(1, "Start date/time is required."),
  endsAt: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(200, "Location cannot exceed 200 characters.").optional().or(z.literal("")),
  isOnline: z.boolean().default(true),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number.").optional(),
  coverImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;