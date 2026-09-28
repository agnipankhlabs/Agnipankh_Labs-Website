import { z } from "zod";

export const lessonKindEnum = z.enum([
  "READING",
  "VIDEO",
  "QUIZ",
  "ASSIGNMENT",
  "CODE_LAB",
]);

export const lessonSchema = z.object({
  title: z.string().trim().min(3, "Lesson title must be at least 3 characters.").max(150, "Title cannot exceed 150 characters."),
  ordinal: z.coerce.number().int().positive("Ordinal must be a positive integer."),
  kind: lessonKindEnum.default("READING"),
  content: z.string().trim().optional().or(z.literal("")),
  videoUrl: z.string().trim().url("Must be a valid URL.").optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().positive().optional(),
});

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Course title must be at least 3 characters.").max(150, "Title cannot exceed 150 characters."),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters.").max(80, "Slug cannot exceed 80 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  summary: z.string().trim().max(300, "Summary cannot exceed 300 characters.").optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  level: z.string().trim().max(50, "Level cannot exceed 50 characters.").optional().or(z.literal("")),
  prerequisites: z.string().trim().optional().or(z.literal("")),
  pricePaise: z.coerce.number().int().nonnegative("Price must be a non-negative integer.").optional(),
  isPublished: z.boolean().default(false),
  lessons: z.array(lessonSchema).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;