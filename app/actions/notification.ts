"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createNotificationSchema, updateNotificationSchema } from "@/lib/validation/notification";

export interface NotificationActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  notificationId?: string;
}

function assertAdmin(roles: string[] | undefined): { ok: true } | { ok: false; error: NotificationActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

export async function createNotificationAction(
  _prev: NotificationActionResult | null,
  formData: FormData
): Promise<NotificationActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    userId: formData.get("userId"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    href: formData.get("href") || undefined,
    kind: formData.get("kind") || "info",
  };

  const parsed = createNotificationSchema.safeParse(rawData);

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
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        href: data.href,
        kind: data.kind,
      },
    });

    revalidatePath("/admin/notifications");

    return { success: true, message: "Notification created.", notificationId: notification.id };
  } catch (error) {
    console.error("[createNotificationAction] Error:", error);
    return { success: false, message: "Failed to create notification." };
  }
}

export async function updateNotificationAction(
  notificationId: string,
  _prev: NotificationActionResult | null,
  formData: FormData
): Promise<NotificationActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title") || undefined,
    body: formData.get("body") || undefined,
    href: formData.get("href") || undefined,
    kind: formData.get("kind") || undefined,
    readAt: formData.get("readAt") ? new Date(formData.get("readAt") as string) : undefined,
  };

  const parsed = updateNotificationSchema.safeParse(rawData);

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
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.href !== undefined) updateData.href = data.href;
    if (data.kind !== undefined) updateData.kind = data.kind;
    if (data.readAt !== undefined) updateData.readAt = data.readAt;

    await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateNotificationAction] Error:", error);
    return { success: false, message: "Failed to update notification." };
  }

  revalidatePath("/admin/notifications");

  return { success: true, message: "Notification updated.", notificationId };
}

export async function deleteNotificationAction(notificationId: string): Promise<NotificationActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.notification.delete({ where: { id: notificationId } });
  } catch (error) {
    console.error("[deleteNotificationAction] Error:", error);
    return { success: false, message: "Failed to delete notification." };
  }

  revalidatePath("/admin/notifications");

  return { success: true, message: "Notification deleted." };
}

export async function markAsReadAction(notificationId: string): Promise<NotificationActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, message: "Unauthenticated." };
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return { success: false, message: "Notification not found." };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  } catch (error) {
    console.error("[markAsReadAction] Error:", error);
    return { success: false, message: "Failed to mark as read." };
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return { success: true, message: "Marked as read." };
}

export async function markAllAsReadAction(userId: string): Promise<NotificationActionResult> {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId || currentUserId !== userId) {
    return { success: false, message: "Unauthorised." };
  }

  try {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (error) {
    console.error("[markAllAsReadAction] Error:", error);
    return { success: false, message: "Failed to mark all as read." };
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return { success: true, message: "All notifications marked as read." };
}

export async function createSystemNotification(
  userId: string,
  title: string,
  body?: string,
  href?: string,
  kind: "info" | "success" | "warning" | "error" | "system" = "info"
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        href,
        kind,
      },
    });
  } catch (error) {
    console.error("[createSystemNotification] Error:", error);
  }
}