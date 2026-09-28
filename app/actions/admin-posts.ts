"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createPostSchema, updatePostSchema } from "@/lib/validation/post";
import { recordMemoryPost } from "@/lib/admin-posts";

export interface PostActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  postId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: PostActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

function formatSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function createPostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    ogImageUrl: formData.get("ogImageUrl"),
    canonicalUrl: formData.get("canonicalUrl"),
    publishedAt: formData.get("publishedAt"),
    isPublished: formData.get("isPublished") === "on",
  };

  const dataWithSlug = {
    ...rawData,
    slug: rawData.slug || formatSlug(rawData.title as string),
  };

  const parsed = createPostSchema.safeParse(dataWithSlug);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;
  const publishedAt = data.isPublished && data.publishedAt
    ? new Date(data.publishedAt)
    : data.isPublished
      ? new Date()
      : null;

  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        category: data.category || null,
        tags: data.tags,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        ogImageUrl: data.ogImageUrl || null,
        canonicalUrl: data.canonicalUrl || null,
        publishedAt,
        authorId: (session?.user as unknown as { id?: string })?.id ?? null,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/blog");

    return { success: true, message: `Post "${post.title}" created.`, postId: post.id };
  } catch (error) {
    console.error("[createPostAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "A post with this slug already exists." };
    }
    return { success: false, message: "Failed to create post." };
  }
}

export async function updatePostAction(
  postId: string,
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    ogImageUrl: formData.get("ogImageUrl"),
    canonicalUrl: formData.get("canonicalUrl"),
    publishedAt: formData.get("publishedAt"),
    isPublished: formData.get("isPublished") === "on",
  };

  const dataWithSlug = {
    ...rawData,
    slug: rawData.slug || (rawData.title ? formatSlug(rawData.title as string) : ""),
  };

  const parsed = updatePostSchema.safeParse(dataWithSlug);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;
  const publishedAt = data.isPublished && data.publishedAt
    ? new Date(data.publishedAt)
    : data.isPublished
      ? new Date()
      : data.isPublished === false
        ? null
        : undefined;

  try {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl || null;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle || null;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription || null;
    if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl || null;
    if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl || null;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

    await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updatePostAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "A post with this slug already exists." };
    }
    return { success: false, message: "Failed to update post." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");

  return { success: true, message: "Post updated.", postId: postId };
}

export async function togglePublishPostAction(
  postId: string,
  publish: boolean
): Promise<PostActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, message: "Post not found." };
    }

    if (publish && !post.slug) {
      return { success: false, message: "Cannot publish post without slug." };
    }

    const publishedAt = publish && !post.publishedAt ? new Date() : publish ? post.publishedAt : null;

    await prisma.post.update({
      where: { id: postId },
      data: { publishedAt },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");

    return { success: true, message: publish ? "Post published." : "Post unpublished." };
  } catch (error) {
    console.error("[togglePublishPostAction] Error:", error);
    return { success: false, message: "Failed to update post status." };
  }
}

export async function deletePostAction(postId: string): Promise<PostActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.post.delete({ where: { id: postId } });
  } catch (error) {
    console.error("[deletePostAction] Error:", error);
    return { success: false, message: "Failed to delete post." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");

  return { success: true, message: "Post deleted." };
}