"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface QuizActionResult {
  success: boolean;
  message?: string;
  attemptId?: string;
  scorePct?: number;
  passed?: boolean;
}

/**
 * Start a quiz attempt for a lesson.
 */
export async function startQuizAttemptAction(
  enrollmentId: string,
  lessonId: string
): Promise<QuizActionResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "Authentication required." };
  }

  try {
    // Verify enrollment belongs to user and lesson exists
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { course: true },
    });

    if (!enrollment) {
      return { success: false, message: "Enrollment not found." };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, courseId: enrollment.courseId },
      include: {
        quiz: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!lesson) {
      return { success: false, message: "Lesson not found." };
    }

    if (!lesson.quiz || lesson.quiz.length === 0) {
      return { success: false, message: "This lesson has no quiz questions." };
    }

    // Create or get existing attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { enrollmentId, lessonId },
      orderBy: { startedAt: "desc" },
    });

    if (existingAttempt && !existingAttempt.completedAt) {
      return { success: true, message: "Quiz attempt resumed.", attemptId: existingAttempt.id };
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        enrollmentId,
        lessonId,
        startedAt: new Date(),
      },
    });

    return { success: true, message: "Quiz attempt started.", attemptId: attempt.id };
  } catch (error) {
    console.error("[startQuizAttemptAction] Error:", error);
    return { success: false, message: "Failed to start quiz attempt." };
  }
}

/**
 * Submit a quiz attempt with answers.
 */
export async function submitQuizAttemptAction(
  attemptId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>
): Promise<QuizActionResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "Authentication required." };
  }

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        lesson: {
          include: {
            quiz: true,
          },
        },
      },
    });

    if (!attempt) {
      return { success: false, message: "Quiz attempt not found." };
    }

    // Verify ownership
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: attempt.enrollmentId, userId },
    });

    if (!enrollment) {
      return { success: false, message: "Unauthorized." };
    }

    if (attempt.completedAt) {
      return { success: false, message: "Quiz already submitted." };
    }

    const questions = attempt.lesson.quiz;
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    // Create answers and calculate score
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;
      const isCorrect = question.correctIndex === answer.selectedIndex;
      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      await prisma.quizAnswer.create({
        data: {
          attemptId,
          questionId: question.id,
          selectedIndex: answer.selectedIndex,
          isCorrect,
        },
      });
    }

    const scorePct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePct >= 70; // 70% passing threshold

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        scorePct,
        passed,
        totalPoints,
        earnedPoints,
      },
    });

    // If passed, mark lesson as complete
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: attempt.enrollmentId,
            lessonId: attempt.lessonId,
          },
        },
        update: { completedAt: new Date() },
        create: {
          enrollmentId: attempt.enrollmentId,
          lessonId: attempt.lessonId,
          completedAt: new Date(),
          scorePct,
        },
      });

      // Recalculate course progress
      const totalLessons = await prisma.lesson.count({ where: { courseId: enrollment.courseId } });
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          enrollmentId: attempt.enrollmentId,
          completedAt: { not: null },
        },
      });

      const progressPct = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      const newStatus = progressPct >= 100 ? "COMPLETED" : "ACTIVE";

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPct,
          status: newStatus,
          completedAt: newStatus === "COMPLETED" ? new Date() : null,
        },
      });
    }

    revalidatePath(`/dashboard`);
    revalidatePath(`/courses/${enrollment.courseId}`);

    return {
      success: true,
      message: passed ? "Quiz passed!" : "Quiz submitted. Keep practicing!",
      attemptId,
      scorePct,
      passed,
    };
  } catch (error) {
    console.error("[submitQuizAttemptAction] Error:", error);
    return { success: false, message: "Failed to submit quiz." };
  }
}

/**
 * Get quiz questions for a lesson (without correct answers).
 */
export async function getQuizQuestions(
  lessonId: string
): Promise<Array<{ id: string; prompt: string; options: string[]; points: number }> | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          select: { id: true, prompt: true, options: true, points: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return lesson?.quiz ?? null;
  } catch {
    return null;
  }
}

/**
 * Get quiz attempt results.
 */
export async function getQuizAttemptResults(
  attemptId: string
): Promise<{
  attemptId: string;
  scorePct: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  answers: Array<{ questionId: string; prompt: string; options: string[]; correctIndex: number; selectedIndex: number; isCorrect: boolean; points: number }>;
} | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        lesson: {
          include: {
            quiz: true,
          },
        },
        enrollment: true,
      },
    });

    if (!attempt) return null;

    // Verify ownership
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: attempt.enrollmentId, userId },
    });

    if (!enrollment) return null;

    return {
      attemptId: attempt.id,
      scorePct: attempt.scorePct ?? 0,
      passed: attempt.passed ?? false,
      totalPoints: attempt.totalPoints ?? 0,
      earnedPoints: attempt.earnedPoints ?? 0,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        prompt: a.question.prompt,
        options: a.question.options,
        correctIndex: a.question.correctIndex,
        selectedIndex: a.selectedIndex,
        isCorrect: a.isCorrect,
        points: a.question.points,
      })),
    };
  } catch {
    return null;
  }
}