"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const registerSchema = z.object({
  eventId: z.string().cuid(),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address."),
  phone: z.string().trim().regex(/^(\+91[\-\s]?|0)?[6-9]\d{9}$/, "Invalid Indian mobile number.").optional().or(z.literal("")),
});

export interface RegistrationActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  registrationId?: string;
}

export async function registerForEventAction(
  prevState: RegistrationActionResult | null,
  formData: FormData
): Promise<RegistrationActionResult> {
  const rawData = {
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  const parsed = registerSchema.safeParse(rawData);

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
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return { success: false, message: "Event not found." };
    }

    if (!event.isPublished) {
      return { success: false, message: "This event is not open for registration." };
    }

    if (new Date(event.startsAt) <= new Date()) {
      return { success: false, message: "This event has already started." };
    }

    if (event.capacity && event._count.registrations >= event.capacity) {
      return { success: false, message: "This event has reached its capacity." };
    }

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId: data.eventId, email: data.email } },
    });

    if (existing) {
      return { success: false, message: "You are already registered for this event." };
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
      },
    });

    revalidatePath(`/events/${event.slug}`);

    return { success: true, message: "Registration successful! Check your email for confirmation.", registrationId: registration.id };
  } catch (error) {
    console.error("[registerForEventAction] Error:", error);
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return { success: false, message: "You are already registered for this event." };
    }
    return { success: false, message: "Failed to register for event." };
  }
}

export async function cancelRegistrationAction(
  eventId: string,
  email: string
): Promise<RegistrationActionResult> {
  try {
    await prisma.eventRegistration.delete({
      where: { eventId_email: { eventId, email } },
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event) {
      revalidatePath(`/events/${event.slug}`);
    }

    return { success: true, message: "Registration cancelled." };
  } catch (error) {
    console.error("[cancelRegistrationAction] Error:", error);
    return { success: false, message: "Failed to cancel registration." };
  }
}