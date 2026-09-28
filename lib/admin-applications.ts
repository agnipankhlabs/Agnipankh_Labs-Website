import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  STAGE_CONFIG,
  type ApplicationStageKey,
  type StageInfo,
} from "@/lib/applications";

export interface AdminApplicationRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  internshipId: string;
  internshipSlug: string;
  internshipTitle: string;
  internshipDomain: string;
  roleTitle: string;
  // Academic profile snapshot
  college: string | null;
  degree: string | null;
  branch: string | null;
  graduationYear: number | null;
  phone: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  // Pipeline
  stage: ApplicationStageKey;
  stageInfo: StageInfo;
  rejectionReason: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Offer letter
  offerLetter?: {
    id: string;
    issuedAt: Date;
    signatory: string | null;
    startDate: Date | null;
  } | null;
}

export interface AdminApplicationFilters {
  stage?: string;
  domain?: string;
  search?: string;
}

export interface AdminApplicationStats {
  total: number;
  byStage: Record<ApplicationStageKey, number>;
}

/**
 * Fetch all applications with student profile data for admin review.
 */
export async function getAdminApplications(
  filters?: AdminApplicationFilters
): Promise<AdminApplicationRecord[]> {
  try {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters?.stage && filters.stage !== "ALL") {
      where.stage = filters.stage as ApplicationStageKey;
    }

    if (filters?.domain && filters.domain !== "ALL") {
      where.internship = { domain: filters.domain as never };
    }

    const apps = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              select: {
                college: true,
                degree: true,
                branch: true,
                graduationYear: true,
                phone: true,
                githubUrl: true,
                linkedinUrl: true,
                portfolioUrl: true,
              },
            },
          },
        },
        internship: {
          select: {
            id: true,
            slug: true,
            title: true,
            domain: true,
            roleTitle: true,
          },
        },
        offerLetter: {
          select: {
            id: true,
            issuedAt: true,
            signatory: true,
            startDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let result: AdminApplicationRecord[] = apps.map((a) => {
      const stage = a.stage as ApplicationStageKey;
      return {
        id: a.id,
        userId: a.userId,
        userEmail: a.user.email,
        userName: a.user.name,
        internshipId: a.internship.id,
        internshipSlug: a.internship.slug,
        internshipTitle: a.internship.title,
        internshipDomain: a.internship.domain,
        roleTitle: a.internship.roleTitle ?? "Intern",
        college: a.user.profile?.college ?? null,
        degree: a.user.profile?.degree ?? null,
        branch: a.user.profile?.branch ?? null,
        graduationYear: a.user.profile?.graduationYear ?? null,
        phone: a.user.profile?.phone ?? null,
        githubUrl: a.user.profile?.githubUrl ?? null,
        linkedinUrl: a.user.profile?.linkedinUrl ?? null,
        portfolioUrl: a.user.profile?.portfolioUrl ?? null,
        stage,
        stageInfo: STAGE_CONFIG[stage] ?? STAGE_CONFIG.APPLICATION_RECEIVED,
        rejectionReason: a.rejectionReason,
        decidedAt: a.decidedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        offerLetter: a.offerLetter
          ? {
              id: a.offerLetter.id,
              issuedAt: a.offerLetter.issuedAt,
              signatory: a.offerLetter.signatory,
              startDate: a.offerLetter.startDate,
            }
          : null,
      };
    });

    // Search filter in-memory (name / email / college)
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.userEmail.toLowerCase().includes(q) ||
          (a.userName?.toLowerCase().includes(q) ?? false) ||
          (a.college?.toLowerCase().includes(q) ?? false) ||
          a.internshipTitle.toLowerCase().includes(q)
      );
    }

    return result;
  } catch (err) {
    console.warn("[admin-applications] Database error:", err);
    return [];
  }
}

/**
 * Aggregate application counts by stage for admin KPI strip.
 */
export async function getAdminApplicationStats(): Promise<AdminApplicationStats> {
  try {
    const grouped = await prisma.application.groupBy({
      by: ["stage"],
      _count: { id: true },
    });

    const byStage = {} as Record<ApplicationStageKey, number>;
    let total = 0;

    for (const row of grouped) {
      const s = row.stage as ApplicationStageKey;
      byStage[s] = row._count.id;
      total += row._count.id;
    }

    return { total, byStage };
  } catch {
    return { total: 0, byStage: {} as Record<ApplicationStageKey, number> };
  }
}
