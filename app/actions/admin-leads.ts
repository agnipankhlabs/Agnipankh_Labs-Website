"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  updateLeadStatusSchema,
  addLeadNoteSchema,
  assignLeadSchema,
} from "@/lib/validation/lead";

export interface LeadActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: LeadActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

export async function updateLeadStatusAction(
  leadId: string,
  status: string
): Promise<LeadActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = updateLeadStatusSchema.safeParse({ leadId, status });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: parsed.data.status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED_LOST",
        handledAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[updateLeadStatusAction] Error:", error);
    return { success: false, message: "Failed to update lead status." };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");

  return { success: true, message: `Lead status updated to ${status}.` };
}

export async function addLeadNoteAction(
  leadId: string,
  note: string
): Promise<LeadActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = addLeadNoteSchema.safeParse({ leadId, note });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid note." };
  }

  try {
    const existing = await prisma.lead.findUnique({ where: { id: leadId }, select: { notes: true } });
    const updatedNotes = existing?.notes
      ? `${existing.notes}\n\n[${new Date().toISOString()}] ${parsed.data.note}`
      : `[${new Date().toISOString()}] ${parsed.data.note}`;

    await prisma.lead.update({
      where: { id: leadId },
      data: { notes: updatedNotes },
    });
  } catch (error) {
    console.error("[addLeadNoteAction] Error:", error);
    return { success: false, message: "Failed to add note." };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);

  return { success: true, message: "Note added successfully." };
}

export async function assignLeadAction(
  leadId: string,
  handledById: string
): Promise<LeadActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = assignLeadSchema.safeParse({ leadId, handledById });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid assignment." };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        handledById: parsed.data.handledById,
        handledAt: new Date(),
        status: "CONTACTED",
      },
    });
  } catch (error) {
    console.error("[assignLeadAction] Error:", error);
    return { success: false, message: "Failed to assign lead." };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");

  return { success: true, message: "Lead assigned successfully." };
}