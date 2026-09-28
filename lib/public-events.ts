import { prisma } from "@/lib/db";
import type { EventKind } from "@/lib/generated/prisma/client";

export interface PublicEventRecord {
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
  isPublished: boolean;
  capacity: number | null;
  registrationCount: number;
  createdAt: Date;
}

const memoryEvents: PublicEventRecord[] = [];

export async function getPublicEvents(filters?: {
  kind?: EventKind;
  search?: string;
  upcomingOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ events: PublicEventRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  let list: PublicEventRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (filters?.kind) {
      where.kind = filters.kind;
    }

    if (filters?.upcomingOnly) {
      where.startsAt = { gt: new Date() };
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
        orderBy: { startsAt: "asc" },
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
        isPublished: e.isPublished,
        capacity: e.capacity,
        registrationCount: e._count.registrations,
        createdAt: e.createdAt,
      }));
      total = totalCount;
    }
  } catch {
    const now = new Date();
    const filtered = memoryEvents.filter((m) => {
      if (filters?.kind && m.kind !== filters.kind) return false;
      if (filters?.upcomingOnly && new Date(m.startsAt) <= now) return false;
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

export async function getPublicEventBySlug(slug: string): Promise<PublicEventRecord | null> {
  try {
    const e = await prisma.event.findUnique({
      where: { slug, isPublished: true },
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
      isPublished: e.isPublished,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    };
  } catch {
    return null;
  }
}

export async function getPublicEventById(id: string): Promise<PublicEventRecord | null> {
  try {
    const e = await prisma.event.findUnique({
      where: { id, isPublished: true },
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
      isPublished: e.isPublished,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    };
  } catch {
    return null;
  }
}

export async function getPublicEventKinds(): Promise<EventKind[]> {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      select: { kind: true },
      distinct: ["kind"],
    });
    return events.map((e) => e.kind);
  } catch {
    return [];
  }
}

export async function getUpcomingEvents(limit = 5): Promise<PublicEventRecord[]> {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true, startsAt: { gt: new Date() } },
      include: { _count: { select: { registrations: true } } },
      orderBy: { startsAt: "asc" },
      take: limit,
    });
    return events.map((e) => ({
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
      isPublished: e.isPublished,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      createdAt: e.createdAt,
    }));
  } catch {
    return [];
  }
}

export function recordMemoryEvent(record: PublicEventRecord): void {
  const idx = memoryEvents.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryEvents[idx] = record;
  } else {
    memoryEvents.unshift(record);
  }
}