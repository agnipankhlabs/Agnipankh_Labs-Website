import { prisma } from "@/lib/db";

export interface PublicPostRecord {
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

const memoryPosts: PublicPostRecord[] = [];

export async function getPublicPosts(filters?: {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ posts: PublicPostRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  let list: PublicPostRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {
      publishedAt: { not: null },
    };

    if (filters?.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters?.tag) {
      where.tags = { has: filters.tag };
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
        orderBy: { publishedAt: "desc" },
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
      if (filters?.category && filters.category !== "ALL" && m.category !== filters.category) return false;
      if (filters?.tag && !m.tags.includes(filters.tag)) return false;
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

export async function getPublicPostBySlug(slug: string): Promise<PublicPostRecord | null> {
  try {
    const p = await prisma.post.findUnique({
      where: { slug, publishedAt: { not: null } },
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

export async function getPublicPostById(id: string): Promise<PublicPostRecord | null> {
  try {
    const p = await prisma.post.findUnique({
      where: { id, publishedAt: { not: null } },
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

export async function getPublicCategories(): Promise<string[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { category: { not: null }, publishedAt: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    return posts.map((p) => p.category!).filter(Boolean).sort();
  } catch {
    return [];
  }
}

export async function getPublicTags(): Promise<string[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      select: { tags: true },
    });
    const allTags = posts.flatMap((p) => p.tags);
    return [...new Set(allTags)].sort();
  } catch {
    return [];
  }
}

export async function getRecentPosts(limit = 5): Promise<PublicPostRecord[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    return posts.map((p) => ({
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
  } catch {
    return [];
  }
}

export function recordMemoryPost(record: PublicPostRecord): void {
  const idx = memoryPosts.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryPosts[idx] = record;
  } else {
    memoryPosts.unshift(record);
  }
}