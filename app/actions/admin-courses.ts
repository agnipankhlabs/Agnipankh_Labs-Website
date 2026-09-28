"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  createCourseSchema,
  updateCourseSchema,
  lessonSchema,
  type CreateCourseInput,
  type LessonInput,
} from "@/lib/validation/course";
import {
  recordMemoryCourse,
  toggleMemoryCoursePublish,
} from "@/lib/admin-courses";
import type { LessonKind } from "@/lib/generated/prisma/client";

export interface CourseActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  courseId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: CourseActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

function parsePrerequisites(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Create a new course.
 */
export async function createCourseAction(
  prevState: CourseActionResult | null,
  formData: FormData
): Promise<CourseActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    level: formData.get("level"),
    prerequisites: formData.get("prerequisites"),
    pricePaise: formData.get("pricePaise"),
    isPublished: formData.get("isPublished") === "on",
  };

  // Parse lessons from form data
  const lessons: LessonInput[] = [];
  const lessonCount = parseInt(formData.get("lessonCount") as string || "0");
  for (let i = 0; i < lessonCount; i++) {
    const title = formData.get(`lessons[${i}].title`);
    const ordinal = formData.get(`lessons[${i}].ordinal`);
    const kind = formData.get(`lessons[${i}].kind`);
    const content = formData.get(`lessons[${i}].content`);
    const videoUrl = formData.get(`lessons[${i}].videoUrl`);
    const durationMinutes = formData.get(`lessons[${i}].durationMinutes`);

    if (title) {
      lessons.push({
        title: title as string,
        ordinal: ordinal ? parseInt(ordinal as string) : i + 1,
        kind: (kind as LessonKind) || "READING",
        content: content as string || undefined,
        videoUrl: videoUrl as string || undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes as string) : undefined,
      });
    }
  }

  const dataWithLessons = { ...rawData, lessons };
  const parsed = createCourseSchema.safeParse(dataWithLessons);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return {
      success: false,
      message: "Please fix the validation errors below.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const prerequisitesArray = parsePrerequisites(data.prerequisites ?? "");

  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary || null,
        description: data.description || null,
        level: data.level || null,
        prerequisites: prerequisitesArray,
        pricePaise: data.pricePaise ?? null,
        isPublished: data.isPublished,
        lessons: data.lessons?.length
          ? {
              create: data.lessons.map((lesson) => ({
                title: lesson.title,
                ordinal: lesson.ordinal,
                kind: lesson.kind,
                content: lesson.content || null,
                videoUrl: lesson.videoUrl || null,
                durationMinutes: lesson.durationMinutes ?? null,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Course "${course.title}" created successfully!`,
      courseId: course.id,
    };
  } catch (error) {
    console.warn("[admin-courses] DB insert failed, recording to memory cache:", error);
    recordMemoryCourse({
      id: `course-mem-${Date.now()}`,
      slug: data.slug,
      title: data.title,
      summary: data.summary ?? null,
      level: data.level ?? null,
      pricePaise: data.pricePaise ?? null,
      isPublished: data.isPublished,
      lessonCount: data.lessons?.length ?? 0,
      cohortCount: 0,
      enrollmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Course "${data.title}" created (in-memory fallback)!`,
      courseId: `course-mem-${Date.now()}`,
    };
  }
}

/**
 * Update an existing course.
 */
export async function updateCourseAction(
  courseId: string,
  prevState: CourseActionResult | null,
  formData: FormData
): Promise<CourseActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    level: formData.get("level"),
    prerequisites: formData.get("prerequisites"),
    pricePaise: formData.get("pricePaise"),
    isPublished: formData.get("isPublished") === "on",
  };

  // Parse lessons from form data
  const lessons: LessonInput[] = [];
  const lessonCount = parseInt(formData.get("lessonCount") as string || "0");
  for (let i = 0; i < lessonCount; i++) {
    const title = formData.get(`lessons[${i}].title`);
    const ordinal = formData.get(`lessons[${i}].ordinal`);
    const kind = formData.get(`lessons[${i}].kind`);
    const content = formData.get(`lessons[${i}].content`);
    const videoUrl = formData.get(`lessons[${i}].videoUrl`);
    const durationMinutes = formData.get(`lessons[${i}].durationMinutes`);

    if (title) {
      lessons.push({
        title: title as string,
        ordinal: ordinal ? parseInt(ordinal as string) : i + 1,
        kind: (kind as LessonKind) || "READING",
        content: content as string || undefined,
        videoUrl: videoUrl as string || undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes as string) : undefined,
      });
    }
  }

  const dataWithLessons = { ...rawData, lessons };
  const parsed = updateCourseSchema.safeParse(dataWithLessons);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return {
      success: false,
      message: "Please fix the validation errors below.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const prerequisitesArray = data.prerequisites !== undefined
    ? parsePrerequisites(data.prerequisites)
    : undefined;

  try {
    // Update course
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.summary !== undefined) updateData.summary = data.summary || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.level !== undefined) updateData.level = data.level || null;
    if (prerequisitesArray !== undefined) updateData.prerequisites = prerequisitesArray;
    if (data.pricePaise !== undefined) updateData.pricePaise = data.pricePaise ?? null;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    // Handle lessons: delete existing and recreate (simpler than diffing)
    if (data.lessons !== undefined) {
      await prisma.lesson.deleteMany({ where: { courseId } });
      if (data.lessons.length > 0) {
        await prisma.lesson.createMany({
          data: data.lessons.map((lesson) => ({
            courseId,
            title: lesson.title,
            ordinal: lesson.ordinal,
            kind: lesson.kind,
            content: lesson.content ?? null,
            videoUrl: lesson.videoUrl ?? null,
            durationMinutes: lesson.durationMinutes ?? null,
          })),
        });
      }
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/admin");

    return {
      success: true,
      message: "Course updated successfully!",
      courseId,
    };
  } catch (error) {
    console.warn("[admin-courses] DB update failed:", error);
    return { success: false, message: "Failed to update course." };
  }
}

/**
 * Toggle course publish status.
 */
export async function togglePublishCourseAction(
  courseId: string,
  isPublished: boolean
): Promise<CourseActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
    });
  } catch (error) {
    console.warn("[admin-courses] DB update failed, toggling in memory:", error);
    toggleMemoryCoursePublish(courseId, isPublished);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");

  return {
    success: true,
    message: `Course ${isPublished ? "published" : "unpublished"}.`,
    courseId,
  }
}

/**
 * Delete a course.
 */
export async function deleteCourseAction(
  courseId: string
): Promise<CourseActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.course.delete({ where: { id: courseId } });
  } catch (error) {
    console.warn("[admin-courses] DB delete failed:", error);
    return { success: false, message: "Failed to delete course." };
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");

  return { success: true, message: "Course deleted." };
}