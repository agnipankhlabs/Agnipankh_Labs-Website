"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  assignTicketSchema,
  addTicketReplySchema,
  createTicketSchema,
} from "@/lib/validation/support";

export interface SupportActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  ticketId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: SupportActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: string
): Promise<SupportActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = updateTicketStatusSchema.safeParse({ ticketId, status });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const { ticketId: id, status: newStatus } = parsed.data;

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return { success: false, message: "Ticket not found." };
    }

    const updateData: Record<string, unknown> = {
      status: newStatus as "OPEN" | "IN_PROGRESS" | "WAITING_ON_USER" | "RESOLVED" | "CLOSED",
    };

    // Set timestamps based on status
    if (newStatus === "IN_PROGRESS" && !ticket.firstRespondedAt) {
      updateData.firstRespondedAt = new Date();
    }
    if (newStatus === "RESOLVED" && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (newStatus === "CLOSED") {
      updateData.resolvedAt = ticket.resolvedAt ?? new Date();
    }

    await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateTicketStatusAction] Error:", error);
    return { success: false, message: "Failed to update ticket status." };
  }

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);

  return { success: true, message: `Ticket status updated to ${status}.` };
}

export async function updateTicketPriorityAction(
  ticketId: string,
  priority: string
): Promise<SupportActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = updateTicketPrioritySchema.safeParse({ ticketId, priority });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority: parsed.data.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT" },
    });
  } catch (error) {
    console.error("[updateTicketPriorityAction] Error:", error);
    return { success: false, message: "Failed to update priority." };
  }

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);

  return { success: true, message: `Priority updated to ${priority}.` };
}

export async function assignTicketAction(
  ticketId: string,
  assignedToId: string
): Promise<SupportActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = assignTicketSchema.safeParse({ ticketId, assignedToId });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid assignment." };
  }

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId: parsed.data.assignedToId,
        status: "IN_PROGRESS",
        firstRespondedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[assignTicketAction] Error:", error);
    return { success: false, message: "Failed to assign ticket." };
  }

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);

  return { success: true, message: "Ticket assigned successfully." };
}

export async function addTicketReplyAction(
  ticketId: string,
  body: string,
  isInternal: boolean = false
): Promise<SupportActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = addTicketReplySchema.safeParse({ ticketId, body, isInternal });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid reply." };
  }

  // Note: In a real implementation, you'd have a TicketReply model.
  // For now, we'll append to the ticket body with a timestamp.
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId }, select: { body: true } });
    if (!ticket) {
      return { success: false, message: "Ticket not found." };
    }

    const prefix = isInternal ? "[Internal Note]" : "[Reply]";
    const newBody = `${ticket.body}\n\n---\n${prefix} (${new Date().toISOString()}):\n${parsed.data.body}`;

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        body: newBody,
        firstRespondedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });
  } catch (error) {
    console.error("[addTicketReplyAction] Error:", error);
    return { success: false, message: "Failed to add reply." };
  }

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);

  return { success: true, message: isInternal ? "Internal note added." : "Reply sent." };
}

export async function createSupportTicketAction(
  data: {
    requesterEmail: string;
    requesterName?: string;
    subject: string;
    body: string;
    category: string;
    priority: string;
    userId?: string;
  }
): Promise<SupportActionResult> {
  const parsed = createTicketSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        requesterEmail: parsed.data.requesterEmail,
        requesterName: parsed.data.requesterName ?? null,
        subject: parsed.data.subject,
        body: parsed.data.body,
        category: parsed.data.category as "GENERAL" | "TECHNICAL" | "URGENT" | "CERTIFICATE" | "ACADEMIC",
        priority: parsed.data.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
        userId: parsed.data.userId ?? null,
        responseSlaHours: getSlaHours(parsed.data.category, parsed.data.priority),
        slaDueAt: new Date(Date.now() + getSlaHours(parsed.data.category, parsed.data.priority) * 60 * 60 * 1000),
      },
    });

    revalidatePath("/admin/support");
    revalidatePath("/contact");

    return { success: true, message: "Support ticket created.", ticketId: ticket.id };
  } catch (error) {
    console.error("[createSupportTicketAction] Error:", error);
    return { success: false, message: "Failed to create ticket." };
  }
}

function getSlaHours(category: string, priority: string): number {
  // Ops Manual SLA: General 24h, Technical 12h, Urgent 6h
  if (priority === "URGENT" || category === "URGENT") return 6;
  if (category === "TECHNICAL") return 12;
  return 24; // GENERAL, CERTIFICATE, ACADEMIC
}