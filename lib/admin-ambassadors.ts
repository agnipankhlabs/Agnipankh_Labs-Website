import { prisma } from "@/lib/db";
import type { AmbassadorTier, ApprovalStatus } from "@/lib/generated/prisma/client";

export interface AdminAmbassadorRecord {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  collegeId: string | null;
  collegeName: string | null;
  tier: AmbassadorTier;
  status: ApprovalStatus;
  referralCode: string;
  referralCount: number;
  isSenior: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memoryAmbassadors: AdminAmbassadorRecord[] = [];

export async function getAdminAmbassadors(filters?: {
  status?: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  tier?: AmbassadorTier;
  isSenior?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ ambassadors: AdminAmbassadorRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminAmbassadorRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.tier) {
      where.tier = filters.tier;
    }

    if (filters?.isSenior !== undefined) {
      where.isSenior = filters.isSenior;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { referralCode: { contains: q, mode: "insensitive" } },
        { college: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [dbAmbassadors, totalCount] = await Promise.all([
      prisma.campusAmbassador.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          college: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.campusAmbassador.count({ where }),
    ]);

    if (dbAmbassadors.length > 0) {
      list = dbAmbassadors.map((a) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user?.name ?? null,
        userEmail: a.user?.email ?? null,
        collegeId: a.collegeId,
        collegeName: a.college?.name ?? null,
        tier: a.tier,
        status: a.status,
        referralCode: a.referralCode,
        referralCount: a.referralCount,
        isSenior: a.isSenior,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
      total = totalCount;
    }
  } catch {
    const filtered = memoryAmbassadors.filter((m) => {
      if (filters?.status && filters.status !== "ALL" && m.status !== filters.status) return false;
      if (filters?.tier && m.tier !== filters.tier) return false;
      if (filters?.isSenior !== undefined && m.isSenior !== filters.isSenior) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.userName?.toLowerCase().includes(q) ||
          m.userEmail?.toLowerCase().includes(q) ||
          m.referralCode.toLowerCase().includes(q) ||
          m.collegeName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { ambassadors: list, total };
}

export async function getAdminAmbassadorById(id: string): Promise<AdminAmbassadorRecord | null> {
  try {
    const a = await prisma.campusAmbassador.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        college: { select: { name: true } },
      },
    });
    if (!a) return null;
    return {
      id: a.id,
      userId: a.userId,
      userName: a.user?.name ?? null,
      userEmail: a.user?.email ?? null,
      collegeId: a.collegeId,
      collegeName: a.college?.name ?? null,
      tier: a.tier,
      status: a.status,
      referralCode: a.referralCode,
      referralCount: a.referralCount,
      isSenior: a.isSenior,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  } catch {
    return memoryAmbassadors.find((m) => m.id === id) ?? null;
  }
}

export async function getAdminAmbassadorStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  senior: number;
  totalReferrals: number;
}> {
  try {
    const [total, pending, approved, rejected, senior] = await Promise.all([
      prisma.campusAmbassador.count(),
      prisma.campusAmbassador.count({ where: { status: "PENDING" } }),
      prisma.campusAmbassador.count({ where: { status: "APPROVED" } }),
      prisma.campusAmbassador.count({ where: { status: "REJECTED" } }),
      prisma.campusAmbassador.count({ where: { isSenior: true } }),
    ]);

    const totalReferrals = await prisma.campusAmbassador.aggregate({
      _sum: { referralCount: true },
    });

    return { total, pending, approved, rejected, senior, totalReferrals: totalReferrals._sum.referralCount ?? 0 };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0, senior: 0, totalReferrals: 0 };
  }
}

export function recordMemoryAmbassador(record: AdminAmbassadorRecord): void {
  const idx = memoryAmbassadors.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryAmbassadors[idx] = record;
  } else {
    memoryAmbassadors.unshift(record);
  }
}