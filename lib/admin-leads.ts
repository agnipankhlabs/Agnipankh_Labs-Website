import { prisma } from "@/lib/db";
import type { LeadKind, LeadStatus } from "@/lib/generated/prisma/client";

export interface AdminLeadRecord {
  id: string;
  kind: LeadKind;
  name: string;
  email: string;
  phone: string | null;
  partnerType: string | null;
  organizationName: string | null;
  designation: string | null;
  city: string | null;
  status: LeadStatus;
  sourceChannel: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrerUrl: string | null;
  handledById: string | null;
  handledAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const memoryLeads: AdminLeadRecord[] = [];

export async function getAdminLeads(filters?: {
  kind?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ leads: AdminLeadRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminLeadRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.kind && filters.kind !== "ALL") {
      where.kind = filters.kind;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { organizationName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbLeads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    list = dbLeads;
    total = totalCount;
  } catch {
    // Fall back to memory store
    const filtered = memoryLeads.filter((l) => {
      if (filters?.kind && filters.kind !== "ALL" && l.kind !== filters.kind) return false;
      if (filters?.status && filters.status !== "ALL" && l.status !== filters.status) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.organizationName?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { leads: list, total };
}

export async function getAdminLeadById(id: string): Promise<AdminLeadRecord | null> {
  try {
    const lead = await prisma.lead.findUnique({ where: { id } });
    return lead ?? null;
  } catch {
    const mem = memoryLeads.find((m) => m.id === id);
    return mem ?? null;
  }
}

export async function getAdminLeadStats(): Promise<{
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  closedLost: number;
  byKind: Record<string, number>;
}> {
  try {
    const [total, byStatus, byKind] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.lead.groupBy({ by: ["kind"], _count: { kind: true } }),
    ]);

    const byStatusMap: Record<string, number> = {};
    for (const item of byStatus) {
      byStatusMap[item.status] = item._count.status;
    }

    const byKindMap: Record<string, number> = {};
    for (const item of byKind) {
      byKindMap[item.kind] = item._count.kind;
    }

    return {
      total,
      new: byStatusMap.NEW ?? 0,
      contacted: byStatusMap.CONTACTED ?? 0,
      qualified: byStatusMap.QUALIFIED ?? 0,
      converted: byStatusMap.CONVERTED ?? 0,
      closedLost: byStatusMap.CLOSED_LOST ?? 0,
      byKind: byKindMap,
    };
  } catch {
    return { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, closedLost: 0, byKind: {} };
  }
}

export function recordMemoryLead(record: AdminLeadRecord): void {
  const idx = memoryLeads.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryLeads[idx] = record;
  } else {
    memoryLeads.unshift(record);
  }
}