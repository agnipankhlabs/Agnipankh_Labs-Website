"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { internshipSchema } from "@/lib/validation/internship";
import {
  recordMemoryInternship,
  toggleMemoryInternshipPublish,
  getAdminInternshipById,
} from "@/lib/admin-internships";
import { DOMAIN_LABELS, type InternshipDomain, type DeliveryMode } from "@/content/internships";

export interface InternshipActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  trackSlug?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: InternshipActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n|;/)
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter((line) => line.length > 0);
}

/**
 * Create a new internship track
 */
export async function createInternshipAction(
  prevState: InternshipActionResult | null,
  formData: FormData
): Promise<InternshipActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    domain: formData.get("domain"),
    roleTitle: formData.get("roleTitle"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    durationMonths: formData.get("durationMonths"),
    mode: formData.get("mode"),
    feePaise: formData.get("feePaise") ?? 0,
    learningObjectives: formData.get("learningObjectives"),
    skillRequirements: formData.get("skillRequirements"),
    completionCriteria: formData.get("completionCriteria"),
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  };

  const parsed = internshipSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return {
      success: false,
      message: "Please review the form errors below.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const objectives = splitLines(data.learningObjectives);
  const skills = splitLines(data.skillRequirements);

  try {
    // Check slug uniqueness
    const existing = await prisma.internship.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return {
        success: false,
        fieldErrors: { slug: ["This URL slug is already in use by another track."] },
      };
    }

    await prisma.internship.create({
      data: {
        title: data.title,
        slug: data.slug,
        domain: data.domain,
        roleTitle: data.roleTitle,
        summary: data.summary,
        description: data.description,
        durationMonths: data.durationMonths,
        mode: data.mode,
        feePaise: data.feePaise,
        learningObjectives: objectives,
        skillRequirements: skills,
        completionCriteria: data.completionCriteria,
        isPublished: data.isPublished,
      },
    });
  } catch (error) {
    console.warn("[admin-internships] DB write failed, recording to memory:", error);
    recordMemoryInternship({
      id: `int-${Date.now()}`,
      slug: data.slug,
      title: data.title,
      domain: data.domain as InternshipDomain,
      domainLabel: DOMAIN_LABELS[data.domain as InternshipDomain] ?? data.domain,
      summary: data.summary,
      description: data.description,
      roleTitle: data.roleTitle,
      durationMonths: data.durationMonths,
      learningObjectives: objectives,
      skillRequirements: skills,
      completionCriteria: data.completionCriteria,
      mode: data.mode as DeliveryMode,
      feePaise: data.feePaise,
      isPublished: data.isPublished,
    });
  }

  revalidatePath("/admin/internships");
  revalidatePath("/internships");
  revalidatePath("/admin");

  return {
    success: true,
    message: `Internship track "${data.title}" successfully created!`,
    trackSlug: data.slug,
  };
}

/**
 * Update an existing internship track
 */
export async function updateInternshipAction(
  trackId: string,
  prevState: InternshipActionResult | null,
  formData: FormData
): Promise<InternshipActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    domain: formData.get("domain"),
    roleTitle: formData.get("roleTitle"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    durationMonths: formData.get("durationMonths"),
    mode: formData.get("mode"),
    feePaise: formData.get("feePaise") ?? 0,
    learningObjectives: formData.get("learningObjectives"),
    skillRequirements: formData.get("skillRequirements"),
    completionCriteria: formData.get("completionCriteria"),
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  };

  const parsed = internshipSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return {
      success: false,
      message: "Please review the form errors below.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const objectives = splitLines(data.learningObjectives);
  const skills = splitLines(data.skillRequirements);

  try {
    // Check if slug taken by another track
    const existing = await prisma.internship.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: trackId },
      },
    });

    if (existing) {
      return {
        success: false,
        fieldErrors: { slug: ["This URL slug is already taken by another track."] },
      };
    }

    await prisma.internship.update({
      where: { id: trackId },
      data: {
        title: data.title,
        slug: data.slug,
        domain: data.domain,
        roleTitle: data.roleTitle,
        summary: data.summary,
        description: data.description,
        durationMonths: data.durationMonths,
        mode: data.mode,
        feePaise: data.feePaise,
        learningObjectives: objectives,
        skillRequirements: skills,
        completionCriteria: data.completionCriteria,
        isPublished: data.isPublished,
      },
    });
  } catch (error) {
    console.warn("[admin-internships] DB update failed, saving to memory:", error);
    recordMemoryInternship({
      id: trackId,
      slug: data.slug,
      title: data.title,
      domain: data.domain as InternshipDomain,
      domainLabel: DOMAIN_LABELS[data.domain as InternshipDomain] ?? data.domain,
      summary: data.summary,
      description: data.description,
      roleTitle: data.roleTitle,
      durationMonths: data.durationMonths,
      learningObjectives: objectives,
      skillRequirements: skills,
      completionCriteria: data.completionCriteria,
      mode: data.mode as DeliveryMode,
      feePaise: data.feePaise,
      isPublished: data.isPublished,
    });
  }

  revalidatePath("/admin/internships");
  revalidatePath("/internships");
  revalidatePath(`/internships/${data.slug}`);
  revalidatePath("/admin");

  return {
    success: true,
    message: `Internship track "${data.title}" updated successfully.`,
    trackSlug: data.slug,
  };
}

/**
 * Toggle track publish status (published <-> draft)
 */
export async function togglePublishInternshipAction(
  trackId: string
): Promise<InternshipActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    const item = await prisma.internship.findUnique({
      where: { id: trackId },
    });

    if (item) {
      const updated = await prisma.internship.update({
        where: { id: trackId },
        data: { isPublished: !item.isPublished },
      });

      revalidatePath("/admin/internships");
      revalidatePath("/internships");
      revalidatePath(`/internships/${updated.slug}`);
      revalidatePath("/admin");

      return {
        success: true,
        message: `Track "${updated.title}" is now ${updated.isPublished ? "PUBLISHED" : "saved as DRAFT"}.`,
      };
    }
  } catch {
    // DB fallback
  }

  // Memory fallback
  const memoryItem = await getAdminInternshipById(trackId);
  toggleMemoryInternshipPublish(trackId);

  revalidatePath("/admin/internships");
  revalidatePath("/internships");
  revalidatePath("/admin");

  return {
    success: true,
    message: `Publish status updated for track ${memoryItem?.title ?? trackId}.`,
  };
}
