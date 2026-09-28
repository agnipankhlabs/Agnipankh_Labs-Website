"use server";

import { prisma } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { ambassadorApplicationSchema } from "@/lib/validation/ambassador-application";
import { submitContact } from "./leads";
import { headers } from "next/headers";
import { type FormState } from "@/lib/validation/forms";

export async function submitAmbassadorApplicationAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const ip = clientIp(await headers());
  const rateLimit = await checkRateLimit("contact", ip);
  if (!rateLimit.success) {
    return {
      status: "error",
      message: `Too many submissions. Please try again in ${rateLimit.retryAfter} seconds.`,
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    college: formData.get("college"),
    course: formData.get("course"),
    year: formData.get("year"),
    linkedin: formData.get("linkedin") || undefined,
    github: formData.get("github") || undefined,
    motivation: formData.get("motivation"),
    consent: formData.get("consent") === "on",
    website: formData.get("website"),
    sourceChannel: formData.get("sourceChannel"),
    utmSource: formData.get("utmSource"),
    utmMedium: formData.get("utmMedium"),
    utmCampaign: formData.get("utmCampaign"),
    referrerUrl: formData.get("referrerUrl"),
  };

  const parsed = ambassadorApplicationSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { status: "error", message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  const message = `Campus Ambassador Application\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nCollege: ${data.college}\nCourse: ${data.course}\nYear: ${data.year}\nLinkedIn: ${data.linkedin ?? "Not provided"}\nGitHub: ${data.github ?? "Not provided"}\n\nMotivation:\n${data.motivation}`;

  const leadFormData = new FormData();
  leadFormData.set("name", data.name);
  leadFormData.set("email", data.email);
  leadFormData.set("phone", data.phone);
  leadFormData.set("message", message);
  leadFormData.set("consent", "on");
  if (data.sourceChannel) leadFormData.set("sourceChannel", data.sourceChannel);
  if (data.utmSource) leadFormData.set("utmSource", data.utmSource);
  if (data.utmMedium) leadFormData.set("utmMedium", data.utmMedium);
  if (data.utmCampaign) leadFormData.set("utmCampaign", data.utmCampaign);
  if (data.referrerUrl) leadFormData.set("referrerUrl", data.referrerUrl);
  leadFormData.set("website", "");

  const leadResult = await submitContact({ status: "idle" }, leadFormData);

  if (leadResult.status === "error") {
    return { status: "error", message: leadResult.message ?? "Failed to submit application." };
  }

  return {
    status: "success",
    message: "Application submitted successfully! We'll review and get back to you within 5-7 business days.",
  };
}