import { prisma } from "@/lib/db";

export interface PublicCourseRecord {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  level: string | null;
  pricePaise: number | null;
  lessonCount: number;
  cohortCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retrieve all published courses for the public catalog.
 */
export async function getPublicCourses(filters?: {
  level?: string;
  search?: string;
}): Promise<PublicCourseRecord[]> {
  let list: PublicCourseRecord[] = [];

  try {
    const dbCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            cohorts: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    if (dbCourses.length > 0) {
      list = dbCourses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        description: c.description,
        level: c.level,
        pricePaise: c.pricePaise,
        lessonCount: c._count.lessons,
        cohortCount: c._count.cohorts,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
    }
  } catch {
    // Fall back to empty array if DB unavailable
  }

  let filtered = list;

  if (filters?.level && filters.level !== "ALL") {
    filtered = filtered.filter((c) => c.level === filters.level);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.slug.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Fetch a single published course by slug for the detail page.
 */
export async function getPublicCourseBySlug(
  slug: string
): Promise<PublicCourseRecord | null> {
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
      pricePaise: c.pricePaise,
      lessonCount: c._count.lessons,
      cohortCount: c._count.cohorts,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Get unique levels from published courses for filter dropdown.
 */
export async function getPublicCourseLevels(): Promise<string[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { level: true },
      distinct: ["level"],
    });
    return courses
      .map((c) => c.level)
      .filter((l): l is string => Boolean(l))
      .sort();
  } catch {
    return [];
  }
}