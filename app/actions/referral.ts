"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createReferralSchema, updateReferralSchema } from "@/lib/validation/referral";
import { recordMemoryReferral } from "@/lib/admin-referrals";

export interface ReferralActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  referralId?: string;
}

function assertAdmin(roles: string[] | undefined): { ok: true } | { ok: false; error: ReferralActionResult } {
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

export async function createReferralAction(
  prevState: ReferralActionResult | null,
  formData: FormData
): Promise<ReferralActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    referrerUserId: formData.get("referrerUserId"),
    referredUserId: formData.get("referredUserId") || null,
    code: formData.get("code") || generateReferralCode(),
    rewardNote: formData.get("rewardNote") || undefined,
  };

  const parsed = createReferralSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerUserId: data.referrerUserId,
        referredUserId: data.referredUserId,
        code: data.code,
        rewardNote: data.rewardNote,
      },
    });

    revalidatePath("/admin/referrals");

    return { success: true, message: `Referral ${referral.code} created.`, referralId: referral.id };
  } catch (error) {
    console.error("[createReferralAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "A referral with this code already exists." };
    }
    return { success: false, message: "Failed to create referral." };
  }
}

export async function updateReferralAction(
  referralId: string,
  prevState: ReferralActionResult | null,
  formData: FormData
): Promise<ReferralActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    rewardGranted: formData.get("rewardGranted") === "on",
    rewardNote: formData.get("rewardNote") || undefined,
  };

  const parsed = updateReferralSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const updateData: Record<string, unknown> = {};
    if (data.rewardGranted !== undefined) updateData.rewardGranted = data.rewardGranted;
    if (data.rewardNote !== undefined) updateData.rewardNote = data.rewardNote;

    await prisma.referral.update({
      where: { id: referralId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateReferralAction] Error:", error);
    return { success: false, message: "Failed to update referral." };
  }

  revalidatePath("/admin/referrals");

  return { success: true, message: "Referral updated.", referralId };
}

export async function deleteReferralAction(referralId: string): Promise<ReferralActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.referral.delete({ where: { id: referralId } });
  } catch (error) {
    console.error("[deleteReferralAction] Error:", error);
    return { success: false, message: "Failed to delete referral." };
  }

  revalidatePath("/admin/referrals");

  return { success: true, message: "Referral deleted." };
}

export async function processReferralCodeAction(
  referrerCode: string,
  referredUserId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const referrerProfile = await prisma.profile.findUnique({
      where: { ownReferralCode: referrerCode },
      select: { userId: true },
    });

    if (!referrerProfile) {
      return { success: false, message: "Invalid referral code." };
    }

    if (referrerProfile.userId === referredUserId) {
      return { success: false, message: "Cannot refer yourself." };
    }

    const existingReferral = await prisma.referral.findUnique({
      where: { referredUserId },
    });

    if (existingReferral) {
      return { success: false, message: "User already has a referrer." };
    }

    const code = referrerCode.toUpperCase();
    await prisma.referral.create({
      data: {
        referrerUserId: referrerProfile.userId,
        referredUserId,
        code,
      },
    });

    await prisma.profile.update({
      where: { userId: referredUserId },
      data: { referredByCode: code },
    });

    return { success: true, message: "Referral code applied successfully." };
  } catch (error) {
    console.error("[processReferralCodeAction] Error:", error);
    return { success: false, message: "Failed to process referral code." };
  }
}