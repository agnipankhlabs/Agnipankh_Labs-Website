"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { acknowledgeEnquiry, notifyContact, notifyPartnership } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import {
  contactSchema,
  newsletterSchema,
  partnershipSchema,
  toFieldErrors,
  type FormState,
} from "@/lib/validation/forms";
import { SITE } from "@/content/site";

/**
 * Lead capture for every public form.
 *
 * Ordering is deliberate and identical in all three actions:
 *   1. rate limit   — cheapest rejection first
 *   2. validate     — never trust the client copy of the schema
 *   3. honeypot     — silently succeed, so bots learn nothing
 *   4. persist      — the Lead row is the record of truth
 *   5. notify       — best-effort; a mail failure never fails the submission
 *
 * Step 5 comes last and is settled rather than awaited-and-thrown, because the
 * row is already committed by then. See lib/email.ts for why.
 */

const GENERIC_ERROR =
  "Something went wrong on our end. Please try again, or email us directly.";

/** A bot-tripped honeypot gets the same response a real success does. */
const silentSuccess = (message: string): FormState => ({
  status: "success",
  message,
});

async function requestContext() {
  const h = await headers();
  return {
    ip: clientIp(h),
    referrerUrl: h.get("referer") ?? undefined,
  };
}

function rateLimited(retryAfter: number): FormState {
  const minutes = Math.ceil(retryAfter / 60);
  return {
    status: "error",
    message:
      retryAfter > 0
        ? `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`
        : "Too many submissions. Please try again shortly.",
  };
}

/** Policy version stamped on every consent record, for DPDP audit purposes. */
const policyVersion = () => SITE.entity.policiesEffectiveDate ?? "unversioned";

// --- Contact ---------------------------------------------------------------

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { ip, referrerUrl } = await requestContext();

  const limit = await checkRateLimit("contact", ip);
  if (!limit.success) return rateLimited(limit.retryAfter);

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
    website: formData.get("website") ?? "",
    sourceChannel: formData.get("sourceChannel") ?? undefined,
    utmSource: formData.get("utmSource") ?? undefined,
    utmMedium: formData.get("utmMedium") ?? undefined,
    utmCampaign: formData.get("utmCampaign") ?? undefined,
    referrerUrl,
  });

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    if (fieldErrors.website) {
      return silentSuccess("Thank you — we've received your message.");
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction([
      prisma.lead.create({
        data: {
          kind: "CONTACT",
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message,
          sourceChannel: data.sourceChannel,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          referrerUrl: data.referrerUrl,
        },
      }),
      prisma.consent.create({
        data: {
          subjectEmail: data.email,
          purpose: "PRIVACY_POLICY",
          granted: true,
          policyVersion: policyVersion(),
          ipAddress: ip,
        },
      }),
    ]);
  } catch (error) {
    console.error("[submitContact] persist failed:", error);
    return { status: "error", message: GENERIC_ERROR };
  }

  await Promise.allSettled([
    notifyContact(data),
    acknowledgeEnquiry(data.email, data.name),
  ]);

  return {
    status: "success",
    message:
      "Thank you — we've received your message and will reply within one working day.",
  };
}

// --- Newsletter ------------------------------------------------------------

export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { ip, referrerUrl } = await requestContext();

  const limit = await checkRateLimit("newsletter", ip);
  if (!limit.success) return rateLimited(limit.retryAfter);

  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    website: formData.get("website") ?? "",
    sourceChannel: formData.get("sourceChannel") ?? undefined,
    referrerUrl,
  });

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    if (fieldErrors.website) return silentSuccess("You're subscribed.");
    return {
      status: "error",
      message: fieldErrors.email?.[0] ?? "Please enter a valid email address.",
      fieldErrors,
    };
  }

  const { email, sourceChannel, referrerUrl: ref } = parsed.data;

  try {
    // Re-subscribing must clear a previous unsubscribe, not silently no-op.
    await prisma.subscriber.upsert({
      where: { email },
      create: { email, source: sourceChannel ?? ref ?? null },
      update: { unsubscribedAt: null },
    });

    await prisma.consent.create({
      data: {
        subjectEmail: email,
        purpose: "MARKETING_EMAIL",
        granted: true,
        policyVersion: policyVersion(),
        ipAddress: ip,
      },
    });
  } catch (error) {
    console.error("[subscribeNewsletter] persist failed:", error);
    return { status: "error", message: GENERIC_ERROR };
  }

  return {
    status: "success",
    message: "You're subscribed. Watch your inbox for updates.",
  };
}

// --- Partnerships ----------------------------------------------------------

export async function submitPartnership(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { ip, referrerUrl } = await requestContext();

  const limit = await checkRateLimit("partnership", ip);
  if (!limit.success) return rateLimited(limit.retryAfter);

  const parsed = partnershipSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    partnerType: formData.get("partnerType"),
    organizationName: formData.get("organizationName"),
    designation: formData.get("designation") ?? undefined,
    city: formData.get("city") ?? undefined,
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
    website: formData.get("website") ?? "",
    utmSource: formData.get("utmSource") ?? undefined,
    utmMedium: formData.get("utmMedium") ?? undefined,
    utmCampaign: formData.get("utmCampaign") ?? undefined,
    referrerUrl,
  });

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    if (fieldErrors.website) {
      return silentSuccess("Thank you — we've received your enquiry.");
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction([
      prisma.lead.create({
        data: {
          kind: "PARTNERSHIP",
          partnerType: data.partnerType,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          organizationName: data.organizationName,
          designation: data.designation,
          city: data.city,
          message: data.message,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          referrerUrl: data.referrerUrl,
        },
      }),
      prisma.consent.create({
        data: {
          subjectEmail: data.email,
          purpose: "PRIVACY_POLICY",
          granted: true,
          policyVersion: policyVersion(),
          ipAddress: ip,
        },
      }),
    ]);
  } catch (error) {
    console.error("[submitPartnership] persist failed:", error);
    return { status: "error", message: GENERIC_ERROR };
  }

  await Promise.allSettled([
    notifyPartnership(data),
    acknowledgeEnquiry(data.email, data.name),
  ]);

  return {
    status: "success",
    message: "Thank you — our partnerships team will be in touch shortly.",
  };
}
