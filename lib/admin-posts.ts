import { prisma } from "@/lib/db";

export interface AdminPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[];
  authorId: string | null;
  authorName: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const memoryPosts: AdminPostRecord[] = [];

export async function getAdminPosts(filters?: {
  status?: "ALL" | "PUBLISHED" | "DRAFT";
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ posts: AdminPostRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminPostRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== "ALL") {
      if (filters.status === "PUBLISHED") {
        where.publishedAt = { not: null };
      } else if (filters.status === "DRAFT") {
        where.publishedAt = null;
      }
    }

    if (filters?.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbPosts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    if (dbPosts.length > 0) {
      list = dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: p.coverImageUrl,
        category: p.category,
        tags: p.tags,
        authorId: p.authorId,
        authorName: p.author?.name ?? null,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        ogImageUrl: p.ogImageUrl,
        canonicalUrl: p.canonicalUrl,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      total = totalCount;
    }
  } catch {
    const filtered = memoryPosts.filter((m) => {
      if (filters?.status && filters.status !== "ALL") {
        if (filters.status === "PUBLISHED" && !m.publishedAt) return false;
        if (filters.status === "DRAFT" && m.publishedAt) return false;
      }
      if (filters?.category && filters.category !== "ALL" && m.category !== filters.category) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          m.title.toLowerCase().includes(q) ||
          m.excerpt?.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { posts: list, total };
}

export async function getAdminPostById(id: string): Promise<AdminPostRecord | null> {
  try {
    const p = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImageUrl: p.coverImageUrl,
      category: p.category,
      tags: p.tags,
      authorId: p.authorId,
      authorName: p.author?.name ?? null,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      ogImageUrl: p.ogImageUrl,
      canonicalUrl: p.canonicalUrl,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  } catch {
    return memoryPosts.find((m) => m.id === id) ?? null;
  }
}

export async function getAdminPostBySlug(slug: string): Promise<AdminPostRecord | null> {
  try {
    const p = await prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImageUrl: p.coverImageUrl,
      category: p.category,
      tags: p.tags,
      authorId: p.authorId,
      authorName: p.author?.name ?? null,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      ogImageUrl: p.ogImageUrl,
      canonicalUrl: p.canonicalUrl,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function getAdminPostStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}> {
  try {
    const [total, published, draft] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { publishedAt: { not: null } } }),
      prisma.post.count({ where: { publishedAt: null } }),
    ]);
    // Views tracking would be implemented separately
    return { total, published, draft, totalViews: 0 };
  } catch {
    return { total: 0, published: 0, draft: 0, totalViews: 0 };
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    return posts.map((p) => p.category!).filter(Boolean).sort();
  } catch {
    return [];
  }
}

export function recordMemoryPost(record: AdminPostRecord): void {
  const idx = memoryPosts.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryPosts[idx] = record;
  } else {
    memoryPosts.unshift(record);
  }
}