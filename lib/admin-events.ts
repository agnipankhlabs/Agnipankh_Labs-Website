import { prisma } from "@/lib/db";
import type { EventKind } from "@/lib/generated/prisma/client";

export interface AdminEventRecord {
  id: string;
  slug: string;
  title: string;
  kind: EventKind;
  description: string | null;
  coverImageUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  isOnline: boolean;
  capacity: number | null;
  isPublished: boolean;
  registrationCount: number;
  createdAt: Date;
}

const memoryEvents: AdminEventRecord[] = [];

export async function getAdminEvents(filters?: {
  status?: "ALL" | "PUBLISHED" | "DRAFT";
  kind?: EventKind;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ events: AdminEventRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminEventRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== "ALL") {
      if (filters.status === "PUBLISHED") {
        where.isPublished = true;
      } else if (filters.status === "DRAFT") {
        where.isPublished = false;
      }
    }

    if (filters?.kind) {
      where.kind = filters.kind;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { startsAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    if (dbEvents.length > 0) {
      list = dbEvents.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        kind: e.kind,
        description: e.description,
        coverImageUrl: e.coverImageUrl,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        location: e.location,
        isOnline: e.isOnline,
        capacity: e.capacity,
        isPublished: e.isPublished,
        registrationCount: e._count.registrations,
        createdAt: e.createdAt,
      }));
      total = totalCount;
    }
  } catch {
    const filtered = memoryEvents.filter((m) => {
      if (filters?.status && filters.status !== "ALL") {
        if (filters.status === "PUBLISHED" && !m.isPublished) return false;
        if (filters.status === "DRAFT" && m.isPublished) return false;
      }
      if (filters?.kind && m.kind !== filters.kind) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { events: list, total };
}

export async function getAdminEventById(id: string): Promise<AdminEventRecord | null> {
  try {
    const e = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });
    if (!e) return null;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      kind: e.kind,
      description: e.description,
      coverImageUrl: e.coverImageUrl,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      location: e.location,
      isOnline: e.isOnline,
      capacity: e.capacity,
      isPublished: e.isPublished,
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    };
  } catch {
    return memoryEvents.find((m) => m.id === id) ?? null;
  }
}

export async function getAdminEventBySlug(slug: string): Promise<AdminEventRecord | null> {
  try {
    const e = await prisma.event.findUnique({
      where: { slug },
      include: { _count: { select: { registrations: true } } },
    });
    if (!e) return null;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      kind: e.kind,
      description: e.description,
      coverImageUrl: e.coverImageUrl,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      location: e.location,
      isOnline: e.isOnline,
      capacity: e.capacity,
      isPublished: e.isPublished,
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    };
  } catch {
    return null;
  }
}

export async function getAdminEventStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  upcoming: number;
  totalRegistrations: number;
}> {
  try {
    const [total, published, draft] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { isPublished: true } }),
      prisma.event.count({ where: { isPublished: false } }),
    ]);

    const [upcoming, totalRegistrations] = await Promise.all([
      prisma.event.count({ where: { startsAt: { gt: new Date() }, isPublished: true } }),
      prisma.eventRegistration.count(),
    ]);

    return { total, published, draft, upcoming, totalRegistrations };
  } catch {
    return { total: 0, published: 0, draft: 0, upcoming: 0, totalRegistrations: 0 };
  }
}

export function recordMemoryEvent(record: AdminEventRecord): void {
  const idx = memoryEvents.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryEvents[idx] = record;
  } else {
    memoryEvents.unshift(record);
  }
}