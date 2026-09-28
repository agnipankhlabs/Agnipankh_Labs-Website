import { prisma } from "@/lib/db";

export interface AdminNotificationRecord {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  title: string;
  body: string | null;
  href: string | null;
  kind: string;
  readAt: Date | null;
  createdAt: Date;
}

const memoryNotifications: AdminNotificationRecord[] = [];

export async function getAdminNotifications(filters?: {
  kind?: string;
  read?: boolean;
  userId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ notifications: AdminNotificationRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminNotificationRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.kind) {
      where.kind = filters.kind;
    }

    if (filters?.read !== undefined) {
      where.readAt = filters.read ? { not: null } : null;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [dbNotifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    if (dbNotifications.length > 0) {
      list = dbNotifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        userName: n.user?.name ?? null,
        userEmail: n.user?.email ?? null,
        title: n.title,
        body: n.body,
        href: n.href,
        kind: n.kind,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }));
      total = totalCount;
    }
  } catch {
    const filtered = memoryNotifications.filter((m) => {
      if (filters?.kind && m.kind !== filters.kind) return false;
      if (filters?.read !== undefined) {
        const isRead = !!m.readAt;
        if (isRead !== filters.read) return false;
      }
      if (filters?.userId && m.userId !== filters.userId) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.title.toLowerCase().includes(q) ||
          m.body?.toLowerCase().includes(q) ||
          m.userName?.toLowerCase().includes(q) ||
          m.userEmail?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { notifications: list, total };
}

export async function getAdminNotificationStats(): Promise<{
  total: number;
  unread: number;
  read: number;
  byKind: Record<string, number>;
}> {
  try {
    const [total, unread, read] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { readAt: null } }),
      prisma.notification.count({ where: { readAt: { not: null } } }),
    ]);

    const byKindResult = await prisma.notification.groupBy({
      by: ["kind"],
      _count: { kind: true },
    });

    const byKind: Record<string, number> = {};
    for (const item of byKindResult) {
      byKind[item.kind] = item._count.kind;
    }

    return { total, unread, read, byKind };
  } catch {
    return { total: 0, unread: 0, read: 0, byKind: {} };
  }
}

export async function getNotificationById(id: string): Promise<AdminNotificationRecord | null> {
  try {
    const n = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    if (!n) return null;
    return {
      id: n.id,
      userId: n.userId,
      userName: n.user?.name ?? null,
      userEmail: n.user?.email ?? null,
      title: n.title,
      body: n.body,
      href: n.href,
      kind: n.kind,
      readAt: n.readAt,
      createdAt: n.createdAt,
    };
  } catch {
    return memoryNotifications.find((m) => m.id === id) ?? null;
  }
}

export function recordMemoryNotification(record: AdminNotificationRecord): void {
  const idx = memoryNotifications.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryNotifications[idx] = record;
  } else {
    memoryNotifications.unshift(record);
  }
}