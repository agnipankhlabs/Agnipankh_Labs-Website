"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAmbassadorSchema, updateAmbassadorSchema, approveAmbassadorSchema } from "@/lib/validation/ambassador";
import { recordMemoryAmbassador } from "@/lib/admin-ambassadors";

export interface AmbassadorActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  ambassadorId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: AmbassadorActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createAmbassadorAction(
  prevState: AmbassadorActionResult | null,
  formData: FormData
): Promise<AmbassadorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    userId: formData.get("userId"),
    collegeId: formData.get("collegeId") || null,
    tier: formData.get("tier") || "TIER_1",
    status: formData.get("status") || "PENDING",
    referralCode: formData.get("referralCode") || generateReferralCode(),
    isSenior: formData.get("isSenior") === "on",
  };

  const parsed = createAmbassadorSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const ambassador = await prisma.campusAmbassador.create({
      data: {
        userId: data.userId,
        collegeId: data.collegeId,
        tier: data.tier,
        status: data.status,
        referralCode: data.referralCode,
        isSenior: data.isSenior,
      },
    });

    revalidatePath("/admin/ambassadors");

    return { success: true, message: `Ambassador ${ambassador.referralCode} created.`, ambassadorId: ambassador.id };
  } catch (error) {
    console.error("[createAmbassadorAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "An ambassador with this user or referral code already exists." };
    }
    return { success: false, message: "Failed to create ambassador." };
  }
}

export async function updateAmbassadorAction(
  ambassadorId: string,
  prevState: AmbassadorActionResult | null,
  formData: FormData
): Promise<AmbassadorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    collegeId: formData.get("collegeId") || null,
    tier: formData.get("tier"),
    status: formData.get("status"),
    referralCode: formData.get("referralCode"),
    isSenior: formData.get("isSenior") === "on",
  };

  const parsed = updateAmbassadorSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const updateData: Record<string, unknown> = {};
    if (data.collegeId !== undefined) updateData.collegeId = data.collegeId;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.referralCode !== undefined) updateData.referralCode = data.referralCode;
    if (data.isSenior !== undefined) updateData.isSenior = data.isSenior;

    await prisma.campusAmbassador.update({
      where: { id: ambassadorId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateAmbassadorAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "An ambassador with this referral code already exists." };
    }
    return { success: false, message: "Failed to update ambassador." };
  }

  revalidatePath("/admin/ambassadors");

  return { success: true, message: "Ambassador updated.", ambassadorId: ambassadorId };
}

export async function approveAmbassadorAction(
  ambassadorId: string,
  prevState: AmbassadorActionResult | null,
  formData: FormData
): Promise<AmbassadorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    status: formData.get("status"),
    tier: formData.get("tier") || undefined,
  };

  const parsed = approveAmbassadorSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const ambassador = await prisma.campusAmbassador.findUnique({ where: { id: ambassadorId } });
    if (!ambassador) {
      return { success: false, message: "Ambassador not found." };
    }

    const updateData: Record<string, unknown> = { status: data.status };
    if (data.tier) updateData.tier = data.tier;
    if (data.status === "APPROVED") {
      // TODO: Assign "ambassador" role to user via UserRole upsert
    }

    await prisma.campusAmbassador.update({
      where: { id: ambassadorId },
      data: updateData,
    });
  } catch (error) {
    console.error("[approveAmbassadorAction] Error:", error);
    return { success: false, message: "Failed to update ambassador status." };
  }

  revalidatePath("/admin/ambassadors");

  return { success: true, message: `Ambassador ${data.status.toLowerCase()}.` };
}

export async function deleteAmbassadorAction(ambassadorId: string): Promise<AmbassadorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.campusAmbassador.delete({ where: { id: ambassadorId } });
  } catch (error) {
    console.error("[deleteAmbassadorAction] Error:", error);
    return { success: false, message: "Failed to delete ambassador." };
  }

  revalidatePath("/admin/ambassadors");

  return { success: true, message: "Ambassador deleted." };
}