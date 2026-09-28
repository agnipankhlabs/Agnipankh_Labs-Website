"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface EnrollmentActionResult {
  success: boolean;
  message?: string;
  enrollmentId?: string;
}

/**
 * Enroll a student in a course.
 */
export async function enrollInCourseAction(
  courseId: string
): Promise<EnrollmentActionResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "Authentication required." };
  }

  try {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true, title: true },
    });

    if (!course) {
      return { success: false, message: "Course not found." };
    }

    if (!course.isPublished) {
      return { success: false, message: "This course is not available for enrollment." };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { 
        success: true, 
        message: `Already enrolled in "${course.title}".`,
        enrollmentId: existingEnrollment.id,
      };
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
        progressPct: 0,
      },
    });

    // Initialize lesson progress for all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });

    if (lessons.length > 0) {
      await prisma.lessonProgress.createMany({
        data: lessons.map((lesson) => ({
          enrollmentId: enrollment.id,
          lessonId: lesson.id,
        })),
      });
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Successfully enrolled in "${course.title}"!`,
      enrollmentId: enrollment.id,
    };
  } catch (error) {
    console.error("[enrollInCourseAction] Error:", error);
    return { success: false, message: "Failed to enroll in course." };
  }
}

/**
 * Mark a lesson as complete for the enrolled student.
 */
export async function completeLessonAction(
  enrollmentId: string,
  lessonId: string
): Promise<{ success: boolean; message?: string; progressPct?: number }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "Authentication required." };
  }

  try {
    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { course: true },
    });

    if (!enrollment) {
      return { success: false, message: "Enrollment not found." };
    }

    // Update lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        enrollmentId,
        lessonId,
        completedAt: new Date(),
      },
    });

    // Recalculate course progress
    const totalLessons = await prisma.lesson.count({ where: { courseId: enrollment.courseId } });
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completedAt: { not: null },
      },
    });

    const progressPct = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    const newStatus = progressPct >= 100 ? "COMPLETED" : "ACTIVE";

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPct,
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

    revalidatePath(`/dashboard`);
    revalidatePath(`/courses/${enrollment.courseId}`);

    return { success: true, message: "Lesson marked as complete!", progressPct };
  } catch (error) {
    console.error("[completeLessonAction] Error:", error);
    return { success: false, message: "Failed to update progress." };
  }
}

/**
 * Get student's enrollments with progress.
 */
export async function getStudentEnrollments(): Promise<Array<{
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: string;
  progressPct: number;
  completedAt: Date | null;
  lessonCount: number;
  completedLessons: number;
}>> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: { id: true, title: true, slug: true, _count: { select: { lessons: true } } },
      },
      lessonProgress: {
        where: { completedAt: { not: null } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    courseTitle: e.course.title,
    courseSlug: e.course.slug,
    status: e.status,
    progressPct: e.progressPct,
    completedAt: e.completedAt,
    lessonCount: e.course._count.lessons,
    completedLessons: e.lessonProgress.length,
  }));
}