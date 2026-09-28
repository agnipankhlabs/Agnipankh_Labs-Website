import { prisma } from "@/lib/db";
import type { Mentor, MentorReview, MentorEvaluation, Cohort } from "@/lib/generated/prisma/client";

export interface AdminMentorRecord {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  domainExperience: string | null;
  expertise: string[];
  yearsExperience: number | null;
  currentEmployer: string | null;
  approvalStatus: string;
  approvedById: string | null;
  approvedAt: Date | null;
  cohortCount: number;
  reviewCount: number;
  evaluationCount: number;
  averageScore: number | null;
  lastEvaluationAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Full relations for detail page
  user?: { name: string | null; email: string | null } | null;
  cohorts?: { id: string; name: string; startDate: Date; endDate: Date }[];
  reviews?: { id: string; reviewDate: Date; feedback: string | null; student: { name: string | null; email: string | null } }[];
  evaluations?: { id: string; engagement: number; communication: number; reviewDetail: number; learnerImpact: number; score: number; classification: string; administrativeAction: string | null; reviewPeriod: string; createdAt: Date }[];
}

// Type for mentor with all relations included
type MentorWithRelations = Mentor & {
  user: { name: string | null; email: string | null } | null;
  cohorts: Cohort[];
  reviews: (MentorReview & { student: { name: string | null; email: string | null } | null })[];
  evaluations: MentorEvaluation[];
};

const memoryMentors: AdminMentorRecord[] = [];

export async function getAdminMentors(filters?: {
  approvalStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ mentors: AdminMentorRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminMentorRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.approvalStatus && filters.approvalStatus !== "ALL") {
      where.approvalStatus = filters.approvalStatus;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { domainExperience: { contains: q, mode: "insensitive" } },
        { currentEmployer: { contains: q, mode: "insensitive" } },
        { expertise: { hasSome: [q] } },
      ];
    }

    const [dbMentors, totalCount] = await Promise.all([
      prisma.mentor.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: {
            select: {
              cohorts: true,
              reviews: true,
              evaluations: true,
            },
          },
          evaluations: {
            select: { score: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.mentor.count({ where }),
    ]);

    if (dbMentors.length > 0) {
      list = dbMentors.map((m) => {
        const evaluationScores = m.evaluations.map((e) => e.score);
        const avgScore = evaluationScores.length > 0
          ? Math.round(evaluationScores.reduce((a: number, b: number) => a + b, 0) / evaluationScores.length)
          : null;

        return {
          id: m.id,
          userId: m.userId,
          userName: m.user?.name ?? null,
          userEmail: m.user?.email ?? null,
          domainExperience: m.domainExperience,
          expertise: m.expertise,
          yearsExperience: m.yearsExperience,
          currentEmployer: m.currentEmployer,
          approvalStatus: m.approvalStatus,
          approvedById: m.approvedById,
          approvedAt: m.approvedAt,
          cohortCount: m._count.cohorts,
          reviewCount: m._count.reviews,
          evaluationCount: m._count.evaluations,
          averageScore: avgScore,
          lastEvaluationAt: m.evaluations[0]?.createdAt ?? null,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        };
      });
      total = totalCount;
    }
  } catch {
    // Fall back to memory store
    const filtered = memoryMentors.filter((m) => {
      if (filters?.approvalStatus && filters.approvalStatus !== "ALL" && m.approvalStatus !== filters.approvalStatus) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.userName?.toLowerCase().includes(q) ||
          m.userEmail?.toLowerCase().includes(q) ||
          m.domainExperience?.toLowerCase().includes(q) ||
          m.currentEmployer?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { mentors: list, total };
}

export async function getAdminMentorById(id: string) {
  try {
    const m = await prisma.mentor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        cohorts: {
          select: { id: true, name: true, startDate: true, endDate: true },
          orderBy: { startDate: "desc" },
        },
        reviews: {
          orderBy: { reviewDate: "desc" },
        },
        evaluations: {
          orderBy: { createdAt: "desc" },
        },
      },
    }) as MentorWithRelations | null;
    if (!m) return null;

    const evaluationScores = m.evaluations.map((e) => e.score);
    const avgScore = evaluationScores.length > 0
      ? Math.round(evaluationScores.reduce((a: number, b: number) => a + b, 0) / evaluationScores.length)
      : null;

    return {
      id: m.id,
      userId: m.userId,
      userName: m.user?.name ?? null,
      userEmail: m.user?.email ?? null,
      domainExperience: m.domainExperience,
      expertise: m.expertise,
      yearsExperience: m.yearsExperience,
      currentEmployer: m.currentEmployer,
      approvalStatus: m.approvalStatus,
      approvedById: m.approvedById,
      approvedAt: m.approvedAt,
      cohortCount: m.cohorts.length,
      reviewCount: m.reviews.length,
      evaluationCount: m.evaluations.length,
      averageScore: avgScore,
      lastEvaluationAt: m.evaluations[0]?.createdAt ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      user: m.user,
      cohorts: m.cohorts,
      reviews: m.reviews.map((r) => ({
        id: r.id,
        reviewDate: r.reviewDate,
        feedback: r.feedback,
        student: null,
      })),
      evaluations: m.evaluations.map((e) => ({
        id: e.id,
        engagement: e.engagement,
        communication: e.communication,
        reviewDetail: e.reviewDetail,
        learnerImpact: e.learnerImpact,
        score: e.score,
        classification: e.classification,
        administrativeAction: e.administrativeAction,
        reviewPeriod: e.reviewPeriod,
        createdAt: e.createdAt,
      })),
    };
  } catch {
    return memoryMentors.find((m) => m.id === id) ?? null;
  }
}

export async function getAdminMentorStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalCohorts: number;
  totalReviews: number;
  avgScore: number | null;
}> {
  try {
    const [total, byStatus, totalCohorts, totalReviews, avgScoreResult] = await Promise.all([
      prisma.mentor.count(),
      prisma.mentor.groupBy({ by: ["approvalStatus"], _count: { approvalStatus: true } }),
      prisma.cohort.count({ where: { mentorId: { not: null } } }),
      prisma.mentorReview.count(),
      prisma.mentorEvaluation.aggregate({ _avg: { score: true } }),
    ]);

    const byStatusMap: Record<string, number> = {};
    for (const item of byStatus) {
      byStatusMap[item.approvalStatus] = item._count.approvalStatus;
    }

    return {
      total,
      pending: byStatusMap.PENDING ?? 0,
      approved: byStatusMap.APPROVED ?? 0,
      rejected: byStatusMap.REJECTED ?? 0,
      totalCohorts,
      totalReviews,
      avgScore: avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score * 10) / 10 : null,
    };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0, totalCohorts: 0, totalReviews: 0, avgScore: null };
  }
}

export function recordMemoryMentor(record: AdminMentorRecord): void {
  const idx = memoryMentors.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryMentors[idx] = record;
  } else {
    memoryMentors.unshift(record);
  }
}