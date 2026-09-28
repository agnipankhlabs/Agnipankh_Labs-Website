import { z } from "zod";

function parseTags(tagsString: string | undefined): string[] {
  if (!tagsString?.trim()) return [];
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title cannot exceed 120 characters."),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters.").max(120, "Slug cannot exceed 120 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  excerpt: z.string().trim().max(300, "Excerpt cannot exceed 300 characters.").optional().or(z.literal("")),
  content: z.string().trim().min(50, "Content must be at least 50 characters.").max(50000, "Content cannot exceed 50,000 characters."),
  coverImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  category: z.string().trim().max(50, "Category cannot exceed 50 characters.").optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")).transform(parseTags),
  metaTitle: z.string().trim().max(60, "Meta title cannot exceed 60 characters.").optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160, "Meta description cannot exceed 160 characters.").optional().or(z.literal("")),
  ogImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  canonicalUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  publishedAt: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;