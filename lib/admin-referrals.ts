import { prisma } from "@/lib/db";
import type { Referral } from "@/lib/generated/prisma/client";

export interface AdminReferralRecord {
  id: string;
  referrerUserId: string;
  referrerName: string | null;
  referrerEmail: string | null;
  referredUserId: string | null;
  referredName: string | null;
  referredEmail: string | null;
  code: string;
  rewardGranted: boolean;
  rewardNote: string | null;
  createdAt: Date;
}

const memoryReferrals: AdminReferralRecord[] = [];

type ReferralWithRelations = Referral & {
  referrer: { name: string | null; email: string } | null;
  referred: { name: string | null; email: string } | null;
};

export async function getAdminReferrals(filters?: {
  rewardGranted?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ referrals: AdminReferralRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminReferralRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.rewardGranted !== undefined) {
      where.rewardGranted = filters.rewardGranted;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { referrer: { name: { contains: q, mode: "insensitive" } } },
        { referrer: { email: { contains: q, mode: "insensitive" } } },
        { referred: { name: { contains: q, mode: "insensitive" } } },
        { referred: { email: { contains: q, mode: "insensitive" } } },
        { code: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbReferrals, totalCount] = await Promise.all([
      prisma.referral.findMany({
        where,
        include: {
          referrer: { select: { name: true, email: true } },
          referred: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }) as Promise<ReferralWithRelations[]>,
      prisma.referral.count({ where }),
    ]);

    if (dbReferrals.length > 0) {
      list = (dbReferrals as ReferralWithRelations[]).map((r) => ({
        id: r.id,
        referrerUserId: r.referrerUserId,
        referrerName: r.referrer?.name ?? null,
        referrerEmail: r.referrer?.email ?? null,
        referredUserId: r.referredUserId,
        referredName: r.referred?.name ?? null,
        referredEmail: r.referred?.email ?? null,
        code: r.code,
        rewardGranted: r.rewardGranted,
        rewardNote: r.rewardNote,
        createdAt: r.createdAt,
      }));
      total = totalCount;
    }
  } catch {
    const filtered = memoryReferrals.filter((m) => {
      if (filters?.rewardGranted !== undefined && m.rewardGranted !== filters.rewardGranted) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.referrerName?.toLowerCase().includes(q) ||
          m.referrerEmail?.toLowerCase().includes(q) ||
          m.referredName?.toLowerCase().includes(q) ||
          m.referredEmail?.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { referrals: list, total };
}

export async function getAdminReferralStats(): Promise<{
  total: number;
  rewarded: number;
  pending: number;
  uniqueReferrers: number;
}> {
  try {
    const [total, rewarded, pending] = await Promise.all([
      prisma.referral.count(),
      prisma.referral.count({ where: { rewardGranted: true } }),
      prisma.referral.count({ where: { rewardGranted: false } }),
    ]);

    const uniqueReferrers = await prisma.referral.groupBy({
      by: ["referrerUserId"],
      _count: { referrerUserId: true },
    });

    return { total, rewarded, pending, uniqueReferrers: uniqueReferrers.length };
  } catch {
    return { total: 0, rewarded: 0, pending: 0, uniqueReferrers: 0 };
  }
}

export async function getReferralById(id: string): Promise<AdminReferralRecord | null> {
  try {
    const r = await prisma.referral.findUnique({
      where: { id },
      include: {
        referrer: { select: { name: true, email: true } },
        referred: { select: { name: true, email: true } },
      },
    }) as ReferralWithRelations | null;
    if (!r) return null;
    return {
      id: r.id,
      referrerUserId: r.referrerUserId,
      referrerName: r.referrer?.name ?? null,
      referrerEmail: r.referrer?.email ?? null,
      referredUserId: r.referredUserId,
      referredName: r.referred?.name ?? null,
      referredEmail: r.referred?.email ?? null,
      code: r.code,
      rewardGranted: r.rewardGranted,
      rewardNote: r.rewardNote,
      createdAt: r.createdAt,
    };
  } catch {
    return memoryReferrals.find((m) => m.id === id) ?? null;
  }
}

export function recordMemoryReferral(record: AdminReferralRecord): void {
  const idx = memoryReferrals.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryReferrals[idx] = record;
  } else {
    memoryReferrals.unshift(record);
  }
}