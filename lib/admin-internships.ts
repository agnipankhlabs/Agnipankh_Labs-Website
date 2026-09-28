import { prisma } from "@/lib/db";
import {
  INITIAL_INTERNSHIPS,
  DOMAIN_LABELS,
  type InternshipDomain,
  type DeliveryMode,
} from "@/content/internships";

export interface AdminInternshipRecord {
  id: string;
  slug: string;
  title: string;
  domain: InternshipDomain;
  domainLabel: string;
  summary: string;
  description: string;
  roleTitle: string;
  durationMonths: number;
  learningObjectives: string[];
  skillRequirements: string[];
  completionCriteria: string;
  mode: DeliveryMode;
  feePaise: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicationsCount: number;
}

// In-memory store for custom created / updated tracks when DB is offline
const memoryInternships: AdminInternshipRecord[] = [];

/**
 * Get all internships for admin view with application counts and filters.
 */
export async function getAdminInternships(filters?: {
  domain?: string;
  status?: string;
  search?: string;
}): Promise<AdminInternshipRecord[]> {
  let list: AdminInternshipRecord[] = [];

  try {
    const dbItems = await prisma.internship.findMany({
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbItems.length > 0) {
      list = dbItems.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        domain: item.domain as InternshipDomain,
        domainLabel: DOMAIN_LABELS[item.domain as InternshipDomain] ?? item.domain,
        summary: item.summary ?? "",
        description: item.description ?? "",
        roleTitle: item.roleTitle ?? "Intern",
        durationMonths: item.durationMonths ?? 2,
        learningObjectives: item.learningObjectives,
        skillRequirements: item.skillRequirements,
        completionCriteria: item.completionCriteria ?? "",
        mode: item.mode as DeliveryMode,
        feePaise: item.feePaise ?? 0,
        isPublished: item.isPublished,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        applicationsCount: item._count?.applications ?? 0,
      }));
    }
  } catch {
    // Database offline or unmigrated; use memory + initial catalog
  }

  // Fallback to static items + memory store if DB returned nothing
  if (list.length === 0) {
    const staticMapped: AdminInternshipRecord[] = INITIAL_INTERNSHIPS.map(
      (item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        domain: item.domain,
        domainLabel: item.domainLabel,
        summary: item.summary,
        description: item.description,
        roleTitle: item.roleTitle,
        durationMonths: item.durationMonths,
        learningObjectives: item.learningObjectives,
        skillRequirements: item.skillRequirements,
        completionCriteria: item.completionCriteria,
        mode: item.mode,
        feePaise: item.feePaise,
        isPublished: item.isPublished,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        applicationsCount: 0,
      })
    );

    // Merge memory overrides / new tracks
    const memoryMap = new Map(memoryInternships.map((m) => [m.id, m]));
    list = [
      ...staticMapped.map((s) => memoryMap.get(s.id) ?? s),
      ...memoryInternships.filter(
        (m) => !staticMapped.some((s) => s.id === m.id)
      ),
    ];
  }

  // Apply filters
  if (filters?.domain && filters.domain !== "ALL") {
    list = list.filter((i) => i.domain === filters.domain);
  }

  if (filters?.status && filters.status !== "ALL") {
    if (filters.status === "PUBLISHED") {
      list = list.filter((i) => i.isPublished);
    } else if (filters.status === "DRAFT") {
      list = list.filter((i) => !i.isPublished);
    }
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.roleTitle.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Fetch a single internship record by ID or slug for editing.
 */
export async function getAdminInternshipById(
  id: string
): Promise<AdminInternshipRecord | null> {
  try {
    const item = await prisma.internship.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (item) {
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        domain: item.domain as InternshipDomain,
        domainLabel: DOMAIN_LABELS[item.domain as InternshipDomain] ?? item.domain,
        summary: item.summary ?? "",
        description: item.description ?? "",
        roleTitle: item.roleTitle ?? "Intern",
        durationMonths: item.durationMonths ?? 2,
        learningObjectives: item.learningObjectives,
        skillRequirements: item.skillRequirements,
        completionCriteria: item.completionCriteria ?? "",
        mode: item.mode as DeliveryMode,
        feePaise: item.feePaise ?? 0,
        isPublished: item.isPublished,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        applicationsCount: item._count?.applications ?? 0,
      };
    }
  } catch {
    // DB offline fallback
  }

  // Check memory store
  const memoryItem = memoryInternships.find(
    (m) => m.id === id || m.slug === id
  );
  if (memoryItem) return memoryItem;

  // Check initial static catalog
  const staticItem = INITIAL_INTERNSHIPS.find(
    (s) => s.id === id || s.slug === id
  );
  if (staticItem) {
    return {
      id: staticItem.id,
      slug: staticItem.slug,
      title: staticItem.title,
      domain: staticItem.domain,
      domainLabel: staticItem.domainLabel,
      summary: staticItem.summary,
      description: staticItem.description,
      roleTitle: staticItem.roleTitle,
      durationMonths: staticItem.durationMonths,
      learningObjectives: staticItem.learningObjectives,
      skillRequirements: staticItem.skillRequirements,
      completionCriteria: staticItem.completionCriteria,
      mode: staticItem.mode,
      feePaise: staticItem.feePaise,
      isPublished: staticItem.isPublished,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      applicationsCount: 0,
    };
  }

  return null;
}

/**
 * Get aggregate statistics across all internship tracks.
 */
export async function getAdminInternshipStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  totalApplications: number;
}> {
  const all = await getAdminInternships();
  const published = all.filter((t) => t.isPublished).length;
  const drafts = all.length - published;
  const totalApplications = all.reduce((sum, t) => sum + t.applicationsCount, 0);

  return {
    total: all.length,
    published,
    drafts,
    totalApplications,
  };
}

/**
 * Save memory fallback record
 */
export function recordMemoryInternship(
  record: Omit<AdminInternshipRecord, "createdAt" | "updatedAt" | "applicationsCount"> & {
    createdAt?: Date;
    updatedAt?: Date;
    applicationsCount?: number;
  }
): AdminInternshipRecord {
  const existingIdx = memoryInternships.findIndex((m) => m.id === record.id);
  const now = new Date();

  const full: AdminInternshipRecord = {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: now,
    applicationsCount: record.applicationsCount ?? 0,
  };

  if (existingIdx >= 0) {
    memoryInternships[existingIdx] = full;
  } else {
    memoryInternships.unshift(full);
  }

  return full;
}

/**
 * Toggle publish status in memory fallback
 */
export function toggleMemoryInternshipPublish(id: string): boolean {
  const item = memoryInternships.find((m) => m.id === id || m.slug === id);
  if (item) {
    item.isPublished = !item.isPublished;
    item.updatedAt = new Date();
    return true;
  }

  // If in static catalog, copy into memory store with inverted isPublished
  const staticItem = INITIAL_INTERNSHIPS.find(
    (s) => s.id === id || s.slug === id
  );
  if (staticItem) {
    recordMemoryInternship({
      id: staticItem.id,
      slug: staticItem.slug,
      title: staticItem.title,
      domain: staticItem.domain,
      domainLabel: staticItem.domainLabel,
      summary: staticItem.summary,
      description: staticItem.description,
      roleTitle: staticItem.roleTitle,
      durationMonths: staticItem.durationMonths,
      learningObjectives: staticItem.learningObjectives,
      skillRequirements: staticItem.skillRequirements,
      completionCriteria: staticItem.completionCriteria,
      mode: staticItem.mode,
      feePaise: staticItem.feePaise,
      isPublished: !staticItem.isPublished,
    });
    return true;
  }

  return false;
}
