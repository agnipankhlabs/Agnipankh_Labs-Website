import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, lessonId } = body;

    if (!enrollmentId || !lessonId) {
      return NextResponse.json({ success: false, message: "Enrollment ID and Lesson ID are required." }, { status: 400 });
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { course: true },
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Enrollment not found." }, { status: 404 });
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

    return NextResponse.json({ success: true, message: "Lesson marked as complete!", progressPct });
  } catch (error) {
    console.error("[POST /api/lesson-progress] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}