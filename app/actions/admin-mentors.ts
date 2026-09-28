"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  mentorApprovalSchema,
  mentorEvaluationSchema,
} from "@/lib/validation/mentor";

export interface MentorActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  mentorId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: MentorActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

export async function approveMentorAction(
  mentorId: string,
  action: "APPROVE" | "REJECT",
  approvedById: string,
  rejectionReason?: string
): Promise<MentorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = mentorApprovalSchema.safeParse({ mentorId, action, approvedById, rejectionReason });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const { mentorId: id, action: act, approvedById: approverId } = parsed.data;

  try {
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return { success: false, message: "Mentor not found." };
    }

    if (mentor.approvalStatus !== "PENDING") {
      return { success: false, message: `Mentor is already ${mentor.approvalStatus.toLowerCase()}.` };
    }

    const newStatus = act === "APPROVE" ? "APPROVED" : "REJECTED";
    const updateData: Record<string, unknown> = {
      approvalStatus: newStatus,
      approvedById: approverId,
      approvedAt: new Date(),
    };

    if (act === "REJECT" && rejectionReason) {
      // Store rejection reason in a note or separate field
    }

    await prisma.mentor.update({
      where: { id },
      data: updateData,
    });

    // If approved, ensure mentor role is granted to user
    if (act === "APPROVE") {
      const mentorRole = await prisma.role.findUnique({ where: { key: "mentor" } });
      if (mentorRole) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: mentor.userId, roleId: mentorRole.id } },
          update: {},
          create: {
            userId: mentor.userId,
            roleId: mentorRole.id,
            grantedBy: approverId,
          },
        });
      }
    }
  } catch (error) {
    console.error("[approveMentorAction] Error:", error);
    return { success: false, message: "Failed to update mentor status." };
  }

  revalidatePath("/admin/mentors");
  revalidatePath("/admin/mentors/" + mentorId);

  return { success: true, message: `Mentor ${act === "APPROVE" ? "approved" : "rejected"}.`, mentorId: id };
}

export async function createMentorEvaluationAction(
  mentorId: string,
  data: {
    engagement: number;
    communication: number;
    reviewDetail: number;
    learnerImpact: number;
    reviewPeriod: string;
    administrativeAction?: string;
  }
): Promise<MentorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = mentorEvaluationSchema.safeParse({ mentorId, ...data });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const { mentorId: id, ...evalData } = parsed.data;

  try {
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return { success: false, message: "Mentor not found." };
    }

    if (mentor.approvalStatus !== "APPROVED") {
      return { success: false, message: "Can only evaluate approved mentors." };
    }

    const score = Math.round((evalData.engagement + evalData.communication + evalData.reviewDetail + evalData.learnerImpact) / 4 * 20); // Convert to 0-100 scale

    let classification: "OUTSTANDING" | "STRONG" | "SATISFACTORY" | "IMPROVEMENT_NEEDED";
    if (score >= 90) classification = "OUTSTANDING";
    else if (score >= 75) classification = "STRONG";
    else if (score >= 60) classification = "SATISFACTORY";
    else classification = "IMPROVEMENT_NEEDED";

await prisma.mentorEvaluation.create({
        data: {
          mentorId: id,
          engagement: evalData.engagement,
          communication: evalData.communication,
          reviewDetail: evalData.reviewDetail,
          learnerImpact: evalData.learnerImpact,
          score,
          classification,
          administrativeAction: evalData.administrativeAction ?? null,
          reviewPeriod: evalData.reviewPeriod
        }
      });

    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentors/" + mentorId);

    return { success: true, message: `Evaluation created with ${classification} classification.`, mentorId: id };
  } catch (error) {
    console.error("[createMentorEvaluationAction] Error:", error);
    return { success: false, message: "Failed to create evaluation." };
  }
}

export async function assignMentorToCohortAction(
  mentorId: string,
  cohortId: string
): Promise<MentorActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return { success: false, message: "Mentor not found." };
    }

    if (mentor.approvalStatus !== "APPROVED") {
      return { success: false, message: "Only approved mentors can be assigned to cohorts." };
    }

    const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) {
      return { success: false, message: "Cohort not found." };
    }

    await prisma.cohort.update({
      where: { id: cohortId },
      data: { mentorId },
    });

    revalidatePath("/admin/mentors");
    revalidatePath("/admin/cohorts");

    return { success: true, message: "Mentor assigned to cohort.", mentorId };
  } catch (error) {
    console.error("[assignMentorToCohortAction] Error:", error);
    return { success: false, message: "Failed to assign mentor." };
  }
}