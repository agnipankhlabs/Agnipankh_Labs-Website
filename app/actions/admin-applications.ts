"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStageKey } from "@/lib/applications";

export interface AdminActionResult {
  success: boolean;
  message?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: AdminActionResult } {
  const isAdmin =
    roles?.includes("admin") || roles?.includes("super_admin");
  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

/**
 * Advance an application to the next pipeline stage or a specific target stage.
 */
export async function advanceApplicationStageAction(
  applicationId: string,
  targetStage: ApplicationStageKey
): Promise<AdminActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: targetStage,
        decidedById: session?.user?.id,
        decidedAt: new Date(),
      },
    });

    // If advancing to OFFER_LETTER_ISSUED, auto-generate offer letter record
    if (targetStage === "OFFER_LETTER_ISSUED") {
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { internship: true },
      });

      if (app) {
        await prisma.offerLetter.upsert({
          where: { applicationId },
          create: {
            applicationId,
            signatory: "Director – Agnipankh Labs",
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            reportingTo: "Program Coordinator",
            issuedAt: new Date(),
          },
          update: {
            issuedAt: new Date(),
          },
        });
      }
    }

    revalidatePath("/admin/applications");
    return { success: true, message: `Application advanced to ${targetStage.replace(/_/g, " ")}.` };
  } catch (error) {
    console.error("[admin] advanceApplicationStage error:", error);
    return { success: false, message: "Database error. Please try again." };
  }
}

/**
 * Reject an application with an optional reason.
 */
export async function rejectApplicationAction(
  applicationId: string,
  reason: string
): Promise<AdminActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: "REJECTED",
        rejectionReason: reason || "Did not meet the cohort selection criteria.",
        decidedById: session?.user?.id,
        decidedAt: new Date(),
      },
    });

    revalidatePath("/admin/applications");
    return { success: true, message: "Application rejected." };
  } catch (error) {
    console.error("[admin] rejectApplication error:", error);
    return { success: false, message: "Database error. Please try again." };
  }
}
