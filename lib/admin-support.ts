import { prisma } from "@/lib/db";
import type { TicketCategory, TicketPriority, TicketStatus, TicketChannel } from "@/lib/generated/prisma/client";

export interface AdminSupportTicketRecord {
  id: string;
  subject: string;
  body: string;
  category: TicketCategory;
  channel: TicketChannel;
  priority: TicketPriority;
  status: TicketStatus;
  requesterEmail: string;
  requesterName: string | null;
  userId: string | null;
  assignedToId: string | null;
  responseSlaHours: number | null;
  slaDueAt: Date | null;
  firstRespondedAt: Date | null;
  resolvedAt: Date | null;
  slaBreached: boolean;
  firstContactResolution: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memoryTickets: AdminSupportTicketRecord[] = [];

export async function getAdminSupportTickets(filters?: {
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ tickets: AdminSupportTicketRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminSupportTicketRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters?.priority && filters.priority !== "ALL") {
      where.priority = filters.priority;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { subject: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { requesterEmail: { contains: q, mode: "insensitive" } },
        { requesterName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbTickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    list = dbTickets;
    total = totalCount;
  } catch {
    const filtered = memoryTickets.filter((t) => {
      if (filters?.category && filters.category !== "ALL" && t.category !== filters.category) return false;
      if (filters?.priority && filters.priority !== "ALL" && t.priority !== filters.priority) return false;
      if (filters?.status && filters.status !== "ALL" && t.status !== filters.status) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          t.requesterEmail.toLowerCase().includes(q) ||
          t.requesterName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { tickets: list, total };
}

export async function getAdminSupportTicketById(id: string): Promise<AdminSupportTicketRecord | null> {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    return ticket ?? null;
  } catch {
    const mem = memoryTickets.find((m) => m.id === id);
    return mem ?? null;
  }
}

export async function getAdminSupportTicketStats(): Promise<{
  total: number;
  open: number;
  inProgress: number;
  waitingOnUser: number;
  resolved: number;
  closed: number;
  slaBreached: number;
  avgResponseTimeHours: number | null;
}> {
  try {
    const [total, byStatus, slaBreachedCount] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.supportTicket.count({ where: { slaBreached: true } }),
    ]);

    const byStatusMap: Record<string, number> = {};
    for (const item of byStatus) {
      byStatusMap[item.status] = item._count.status;
    }

    // Calculate average response time for tickets with firstRespondedAt
    const ticketsWithResponse = await prisma.supportTicket.findMany({
      where: { firstRespondedAt: { not: null } },
      select: { createdAt: true, firstRespondedAt: true },
    });

    let avgResponseTimeHours: number | null = null;
    if (ticketsWithResponse.length > 0) {
      const totalHours = ticketsWithResponse.reduce((sum, t) => {
        const diff = new Date(t.firstRespondedAt!).getTime() - t.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgResponseTimeHours = Math.round(totalHours / ticketsWithResponse.length * 10) / 10;
    }

    return {
      total,
      open: byStatusMap.OPEN ?? 0,
      inProgress: byStatusMap.IN_PROGRESS ?? 0,
      waitingOnUser: byStatusMap.WAITING_ON_USER ?? 0,
      resolved: byStatusMap.RESOLVED ?? 0,
      closed: byStatusMap.CLOSED ?? 0,
      slaBreached: slaBreachedCount,
      avgResponseTimeHours,
    };
  } catch {
    return { total: 0, open: 0, inProgress: 0, waitingOnUser: 0, resolved: 0, closed: 0, slaBreached: 0, avgResponseTimeHours: null };
  }
}

export function recordMemoryTicket(record: AdminSupportTicketRecord): void {
  const idx = memoryTickets.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryTickets[idx] = record;
  } else {
    memoryTickets.unshift(record);
  }
}