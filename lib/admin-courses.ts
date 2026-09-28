import { prisma } from "@/lib/db";

export interface AdminCourseRecord {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  level: string | null;
  pricePaise: number | null;
  isPublished: boolean;
  lessonCount: number;
  cohortCount: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCourseDetail extends AdminCourseRecord {
  description: string | null;
  prerequisites: string[];
  lessons: AdminLessonRecord[];
  cohorts: AdminCohortRecord[];
}

export interface AdminLessonRecord {
  id: string;
  title: string;
  ordinal: number;
  kind: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  quizQuestionCount: number;
}

export interface AdminCohortRecord {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  capacity: number | null;
  enrollmentCount: number;
  mentorName: string | null;
}

const memoryCourses: AdminCourseRecord[] = [];

/**
 * Retrieve all courses for the admin console.
 */
export async function getAdminCourses(filters?: {
  status?: string;
  search?: string;
}): Promise<AdminCourseRecord[]> {
  let list: AdminCourseRecord[] = [];

  try {
    const dbCourses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            lessons: true,
            cohorts: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbCourses.length > 0) {
      list = dbCourses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        level: c.level,
        pricePaise: c.pricePaise,
        isPublished: c.isPublished,
        lessonCount: c._count.lessons,
        cohortCount: c._count.cohorts,
        enrollmentCount: c._count.enrollments,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
    }
  } catch {
    // Fall back to memory store
  }

  const combined = [
    ...list,
    ...memoryCourses.filter((m) => !list.some((l) => l.id === m.id)),
  ];

  let filtered = combined;

  if (filters?.status && filters.status !== "ALL") {
    if (filters.status === "PUBLISHED") {
      filtered = filtered.filter((c) => c.isPublished);
    } else if (filters.status === "DRAFT") {
      filtered = filtered.filter((c) => !c.isPublished);
    }
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.slug.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Fetch course by ID with lessons and cohorts.
 */
export async function getAdminCourseById(
  id: string
): Promise<AdminCourseDetail | null> {
  try {
    const c = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lessons: true,
            cohorts: true,
            enrollments: true,
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
          orderBy: { startDate: "desc" },
        },
      },
    });

    if (c) {
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        level: c.level,
        pricePaise: c.pricePaise,
        isPublished: c.isPublished,
        lessonCount: c._count.lessons,
        cohortCount: c._count.cohorts,
        enrollmentCount: c._count.enrollments,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        description: c.description,
        prerequisites: c.prerequisites ?? [],
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
    }
  } catch {
    // Fall back to memory
  }

  const mem = memoryCourses.find((m) => m.id === id);
  if (mem) {
    return { ...mem, description: null, prerequisites: [], lessons: [], cohorts: [] };
  }
  return null;
}

/**
 * KPI stats for admin course desk.
 */
export async function getAdminCourseStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  totalEnrollments: number;
}> {
  const all = await getAdminCourses();
  const published = all.filter((c) => c.isPublished).length;
  const draft = all.length - published;
  const totalEnrollments = all.reduce((sum, c) => sum + c.enrollmentCount, 0);

  return {
    total: all.length,
    published,
    draft,
    totalEnrollments,
  };
}

/**
 * Record memory course for local testing
 */
export function recordMemoryCourse(record: AdminCourseRecord): void {
  const idx = memoryCourses.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryCourses[idx] = record;
  } else {
    memoryCourses.unshift(record);
  }
}

/**
 * Update memory course publish status
 */
export function toggleMemoryCoursePublish(id: string, isPublished: boolean): boolean {
  const course = memoryCourses.find((m) => m.id === id);
  if (course) {
    course.isPublished = isPublished;
    return true;
  }
  return false;
}