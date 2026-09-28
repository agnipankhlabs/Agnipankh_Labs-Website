import { prisma } from "@/lib/db";

export interface PublicCourseDetailRecord {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  level: string | null;
  prerequisites: string[];
  pricePaise: number | null;
  lessonCount: number;
  cohortCount: number;
  createdAt: Date;
  updatedAt: Date;
  lessons: PublicLessonRecord[];
  cohorts: PublicCohortRecord[];
}

export interface PublicLessonRecord {
  id: string;
  title: string;
  ordinal: number;
  kind: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  quizQuestionCount: number;
}

export interface PublicCohortRecord {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  capacity: number | null;
  enrollmentCount: number;
  mentorName: string | null;
}

/**
 * Fetch a single published course by slug with lessons and cohorts for the detail page.
 */
export async function getPublicCourseDetailBySlug(
  slug: string
): Promise<PublicCourseDetailRecord | null> {
  try {
    const c = await prisma.course.findUnique({
      where: { slug, isPublished: true },
      include: {
        _count: {
          select: {
            lessons: true,
            cohorts: true,
          },
        },
        lessons: {
          include: {
            _count: {
              select: { quiz: true },
            },
          },
          orderBy: { ordinal: "asc" },
        },
        cohorts: {
          include: {
            _count: {
              select: { enrollments: true },
            },
            mentor: {
              select: { id: true },
            },
          },
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!c) return null;

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      description: c.description,
      level: c.level,
      prerequisites: c.prerequisites ?? [],
      pricePaise: c.pricePaise,
      lessonCount: c._count.lessons,
      cohortCount: c._count.cohorts,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        ordinal: l.ordinal,
        kind: l.kind,
        content: l.content,
        videoUrl: l.videoUrl,
        durationMinutes: l.durationMinutes,
        quizQuestionCount: l._count.quiz,
      })),
      cohorts: c.cohorts.map((cohort) => ({
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        capacity: cohort.capacity,
        enrollmentCount: cohort._count.enrollments,
        mentorName: cohort.mentor?.id ?? null,
      })),
    };
  } catch {
    return null;
  }
}