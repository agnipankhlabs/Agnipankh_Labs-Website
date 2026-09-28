import { prisma } from "@/lib/db";
import {
  INITIAL_INTERNSHIPS,
  DOMAIN_LABELS,
  type InternshipTrack,
  type InternshipDomain,
  type DeliveryMode,
} from "@/content/internships";

/**
 * Fetch all published internships with optional domain and mode filters.
 * Queries Postgres via Prisma when connected; falls back to static content when empty or offline.
 */
export async function getPublishedInternships(filters?: {
  domain?: string;
  mode?: string;
}): Promise<InternshipTrack[]> {
  try {
    const dbInternships = await prisma.internship.findMany({
      where: {
        isPublished: true,
        ...(filters?.domain && filters.domain !== "ALL"
          ? { domain: filters.domain as InternshipDomain }
          : {}),
        ...(filters?.mode && filters.mode !== "ALL"
          ? { mode: filters.mode as DeliveryMode }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbInternships.length > 0) {
      return dbInternships.map((item) => ({
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
      }));
    }
  } catch (err) {
    // Database offline / unmigrated: fall back gracefully
    console.warn("[internships] Falling back to default catalog:", err);
  }

  // Fallback to static catalog
  let list = [...INITIAL_INTERNSHIPS];
  if (filters?.domain && filters.domain !== "ALL") {
    list = list.filter((i) => i.domain === filters.domain);
  }
  if (filters?.mode && filters.mode !== "ALL") {
    list = list.filter((i) => i.mode === filters.mode);
  }
  return list;
}

/**
 * Fetch a single internship track by its URL slug.
 */
export async function getInternshipBySlug(slug: string): Promise<InternshipTrack | null> {
  try {
    const item = await prisma.internship.findUnique({
      where: { slug },
    });

    if (item && item.isPublished) {
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
      };
    }
  } catch {
    // Fall back to static catalog
  }

  const found = INITIAL_INTERNSHIPS.find((i) => i.slug === slug);
  return found ?? null;
}
