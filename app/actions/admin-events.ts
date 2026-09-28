"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createEventSchema, updateEventSchema } from "@/lib/validation/event";
import { recordMemoryEvent } from "@/lib/admin-events";

export interface EventActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  eventId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: EventActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

function formatSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function createEventAction(
  prevState: EventActionResult | null,
  formData: FormData
): Promise<EventActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    kind: formData.get("kind"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    location: formData.get("location"),
    isOnline: formData.get("isOnline") === "on",
    capacity: formData.get("capacity"),
    coverImageUrl: formData.get("coverImageUrl"),
    isPublished: formData.get("isPublished") === "on",
  };

  const dataWithSlug = {
    ...rawData,
    slug: rawData.slug || formatSlug(rawData.title as string),
    capacity: rawData.capacity ? Number(rawData.capacity) : undefined,
  };

  const parsed = createEventSchema.safeParse(dataWithSlug);

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
    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        kind: data.kind,
        description: data.description || null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        location: data.location || null,
        isOnline: data.isOnline,
        capacity: data.capacity ?? null,
        coverImageUrl: data.coverImageUrl || null,
        isPublished: data.isPublished,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, message: `Event "${event.title}" created.`, eventId: event.id };
  } catch (error) {
    console.error("[createEventAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "An event with this slug already exists." };
    }
    return { success: false, message: "Failed to create event." };
  }
}

export async function updateEventAction(
  eventId: string,
  prevState: EventActionResult | null,
  formData: FormData
): Promise<EventActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    kind: formData.get("kind"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    location: formData.get("location"),
    isOnline: formData.get("isOnline") === "on",
    capacity: formData.get("capacity"),
    coverImageUrl: formData.get("coverImageUrl"),
    isPublished: formData.get("isPublished") === "on",
  };

  const dataWithSlug = {
    ...rawData,
    slug: rawData.slug || (rawData.title ? formatSlug(rawData.title as string) : ""),
    capacity: rawData.capacity ? Number(rawData.capacity) : undefined,
  };

  const parsed = updateEventSchema.safeParse(dataWithSlug);

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
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.kind !== undefined) updateData.kind = data.kind;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.isOnline !== undefined) updateData.isOnline = data.isOnline;
    if (data.capacity !== undefined) updateData.capacity = data.capacity ?? null;
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl || null;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateEventAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "An event with this slug already exists." };
    }
    return { success: false, message: "Failed to update event." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");

  return { success: true, message: "Event updated.", eventId: eventId };
}

export async function togglePublishEventAction(
  eventId: string,
  publish: boolean
): Promise<EventActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return { success: false, message: "Event not found." };
    }

    if (publish && !event.slug) {
      return { success: false, message: "Cannot publish event without slug." };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isPublished: publish },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, message: publish ? "Event published." : "Event unpublished." };
  } catch (error) {
    console.error("[togglePublishEventAction] Error:", error);
    return { success: false, message: "Failed to update event status." };
  }
}

export async function deleteEventAction(eventId: string): Promise<EventActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.event.delete({ where: { id: eventId } });
  } catch (error) {
    console.error("[deleteEventAction] Error:", error);
    return { success: false, message: "Failed to delete event." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");

  return { success: true, message: "Event deleted." };
}