"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { applicationSchema } from "@/lib/validation/application";
import {
  hasStudentApplied,
  recordMemoryApplication,
  acceptMemoryAgreement,
} from "@/lib/applications";
import { INITIAL_INTERNSHIPS } from "@/content/internships";

export interface ApplicationActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitApplicationAction(
  prevState: ApplicationActionResult | null,
  formData: FormData
): Promise<ApplicationActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to submit an internship application.",
      };
    }

    // Rate limiting: contact tier per user ID
    const ip = "system";
    const rateLimit = await checkRateLimit(
      "contact",
      `${ip}:apply:${session.user.id}`
    );
    if (!rateLimit.success) {
      return {
        success: false,
        message: `Too many submissions. Please wait ${rateLimit.retryAfter} seconds before trying again.`,
      };
    }

    const rawData = {
      internshipSlug: formData.get("internshipSlug"),
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      college: formData.get("college"),
      degree: formData.get("degree"),
      branch: formData.get("branch"),
      graduationYear: formData.get("graduationYear"),
      statementOfPurpose: formData.get("statementOfPurpose"),
      githubUrl: formData.get("githubUrl") || undefined,
      linkedinUrl: formData.get("linkedinUrl") || undefined,
      portfolioUrl: formData.get("portfolioUrl") || undefined,
      agreeTerms: formData.get("agreeTerms") === "on",
      agreeDisclaimer: formData.get("agreeDisclaimer") === "on",
    };

    const parsed = applicationSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please correct the highlighted errors in your application form.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    // Check duplicate application
    const alreadyApplied = await hasStudentApplied(
      session.user.id,
      data.internshipSlug
    );
    if (alreadyApplied) {
      return {
        success: false,
        message:
          "You have already submitted an application for this cohort track. Check your dashboard to track its review progress.",
      };
    }

    // Try DB persistence
    try {
      // Find or seed internship in DB
      let internship = await prisma.internship.findUnique({
        where: { slug: data.internshipSlug },
      });

      if (!internship) {
        const staticTrack = INITIAL_INTERNSHIPS.find(
          (t) => t.slug === data.internshipSlug
        );
        if (staticTrack) {
          internship = await prisma.internship.create({
            data: {
              slug: staticTrack.slug,
              title: staticTrack.title,
              domain: staticTrack.domain,
              summary: staticTrack.summary,
              description: staticTrack.description,
              roleTitle: staticTrack.roleTitle,
              durationMonths: staticTrack.durationMonths,
              learningObjectives: staticTrack.learningObjectives,
              skillRequirements: staticTrack.skillRequirements,
              completionCriteria: staticTrack.completionCriteria,
              mode: staticTrack.mode,
              isPublished: true,
            },
          });
        }
      }

      if (internship) {
        // Upsert student profile with current educational details
        await prisma.profile.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            fullName: data.fullName,
            phone: data.phone,
            college: data.college,
            degree: data.degree,
            branch: data.branch,
            graduationYear: data.graduationYear,
            githubUrl: data.githubUrl || null,
            linkedinUrl: data.linkedinUrl || null,
            portfolioUrl: data.portfolioUrl || null,
          },
          update: {
            fullName: data.fullName,
            phone: data.phone,
            college: data.college,
            degree: data.degree,
            branch: data.branch,
            graduationYear: data.graduationYear,
            ...(data.githubUrl ? { githubUrl: data.githubUrl } : {}),
            ...(data.linkedinUrl ? { linkedinUrl: data.linkedinUrl } : {}),
            ...(data.portfolioUrl ? { portfolioUrl: data.portfolioUrl } : {}),
          },
        });

        // Create application record
        await prisma.application.create({
          data: {
            userId: session.user.id,
            internshipId: internship.id,
            stage: "APPLICATION_RECEIVED",
          },
        });
      } else {
        // Fallback to memory
        recordMemoryApplication({
          userId: session.user.id,
          internshipSlug: data.internshipSlug,
        });
      }
    } catch (dbErr) {
      console.warn("[application] Database error, falling back to memory store:", dbErr);
      recordMemoryApplication({
        userId: session.user.id,
        internshipSlug: data.internshipSlug,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/internships");
    revalidatePath(`/internships/${data.internshipSlug}`);

    return {
      success: true,
      message:
        "Application submitted successfully! Your application is now in Stage 1 (Application Received).",
    };
  } catch (error) {
    console.error("[application] Unexpected submission error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try submitting again.",
    };
  }
}

/**
 * Student withdrawal action
 */
export async function withdrawApplicationAction(
  applicationId: string
): Promise<ApplicationActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthenticated" };
  }

  try {
    await prisma.application.update({
      where: { id: applicationId, userId: session.user.id },
      data: { stage: "WITHDRAWN" },
    });
  } catch {
    // Memory fallback if needed
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Your application has been marked as withdrawn.",
  };
}

/**
 * Accept internship agreement & confidentiality (Advances Stage 4 to Stage 5)
 */
export async function acceptAgreementAction(
  applicationId: string
): Promise<ApplicationActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthenticated" };
  }

  try {
    // Check application belongs to user
    const app = await prisma.application.findUnique({
      where: { id: applicationId, userId: session.user.id },
    });

    if (!app) {
      return { success: false, message: "Application record not found." };
    }

    // Upsert agreement and advance to Stage 5
    await prisma.internshipAgreement.upsert({
      where: { applicationId },
      create: {
        applicationId,
        termsVersion: "v1.0-AL-LEGAL",
        acceptedAt: new Date(),
        confidentialityAccepted: true,
      },
      update: {
        acceptedAt: new Date(),
        confidentialityAccepted: true,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { stage: "JOINING_CONFIRMATION" },
    });
  } catch {
    // DB offline fallback
    acceptMemoryAgreement(applicationId);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/offer/${applicationId}`);
  return {
    success: true,
    message:
      "Internship agreement executed! Welcome to the Agnipankh Labs cohort.",
  };
}
