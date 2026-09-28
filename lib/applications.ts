import { prisma } from "@/lib/db";
import { INITIAL_INTERNSHIPS, type InternshipTrack } from "@/content/internships";

export type ApplicationStageKey =
  | "APPLICATION_RECEIVED"
  | "ELIGIBILITY_CHECK"
  | "SELECTION_DECISION"
  | "OFFER_LETTER_ISSUED"
  | "JOINING_CONFIRMATION"
  | "WITHDRAWN"
  | "REJECTED";

export interface StageInfo {
  step: number; // 1 to 5, 0 for terminal
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  color: "blue" | "amber" | "purple" | "emerald" | "red" | "gray";
}

export const STAGE_CONFIG: Record<ApplicationStageKey, StageInfo> = {
  APPLICATION_RECEIVED: {
    step: 1,
    title: "Application Received",
    shortTitle: "Received",
    description:
      "Your application has been received and queued for initial credential verification.",
    badge: "Stage 1 of 5",
    color: "blue",
  },
  ELIGIBILITY_CHECK: {
    step: 2,
    title: "Eligibility Verification",
    shortTitle: "Eligibility",
    description:
      "Our academic desk is verifying your college, graduation year, and degree specialization.",
    badge: "Stage 2 of 5",
    color: "amber",
  },
  SELECTION_DECISION: {
    step: 3,
    title: "Selection Decision",
    shortTitle: "Selection",
    description:
      "Review completed. Your application is shortlisted for cohort seat allotment.",
    badge: "Stage 3 of 5",
    color: "purple",
  },
  OFFER_LETTER_ISSUED: {
    step: 4,
    title: "Offer Letter Issued",
    shortTitle: "Offer Letter",
    description:
      "Your formal cohort offer letter is generated. Review terms and digitally execute the agreement.",
    badge: "Action Required",
    color: "emerald",
  },
  JOINING_CONFIRMATION: {
    step: 5,
    title: "Joining Confirmed",
    shortTitle: "Confirmed",
    description:
      "Internship agreement signed and seat confirmed! Cohort onboarding link and mentor details are active.",
    badge: "Completed",
    color: "emerald",
  },
  WITHDRAWN: {
    step: 0,
    title: "Application Withdrawn",
    shortTitle: "Withdrawn",
    description: "You have voluntarily withdrawn this application.",
    badge: "Withdrawn",
    color: "gray",
  },
  REJECTED: {
    step: 0,
    title: "Application Not Selected",
    shortTitle: "Not Selected",
    description:
      "Unfortunately, this application was not selected for the current cohort cycle.",
    badge: "Closed",
    color: "red",
  },
};

export interface StudentApplicationRecord {
  id: string;
  userId: string;
  internshipId: string;
  internshipSlug: string;
  internshipTitle: string;
  internshipDomain: string;
  roleTitle: string;
  durationMonths: number;
  stage: ApplicationStageKey;
  stageInfo: StageInfo;
  createdAt: Date;
  updatedAt: Date;
  offerLetter?: {
    id: string;
    signatory: string | null;
    startDate: Date | null;
    reportingTo: string | null;
    issuedAt: Date;
  } | null;
  agreement?: {
    id: string;
    termsVersion: string;
    acceptedAt: Date | null;
    confidentialityAccepted: boolean;
  } | null;
}

// In-memory fallback cache for development before DB migration
interface MemoryApplication {
  id: string;
  userId: string;
  internshipSlug: string;
  stage: ApplicationStageKey;
  createdAt: Date;
  updatedAt: Date;
  agreement?: {
    id: string;
    termsVersion: string;
    acceptedAt: Date | null;
    confidentialityAccepted: boolean;
  };
}

const memoryApplications: MemoryApplication[] = [];

/**
 * Persist application to memory cache (fallback when DB is offline)
 */
export function recordMemoryApplication(app: {
  userId: string;
  internshipSlug: string;
}): MemoryApplication {
  const existing = memoryApplications.find(
    (a) => a.userId === app.userId && a.internshipSlug === app.internshipSlug
  );
  if (existing) {
    return existing;
  }
  const created: MemoryApplication = {
    id: `app-mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: app.userId,
    internshipSlug: app.internshipSlug,
    stage: "APPLICATION_RECEIVED",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryApplications.push(created);
  return created;
}

export function getMemoryApplication(applicationId: string): MemoryApplication | undefined {
  return memoryApplications.find((a) => a.id === applicationId);
}

export function acceptMemoryAgreement(applicationId: string): boolean {
  const app = memoryApplications.find((a) => a.id === applicationId);
  if (app) {
    app.stage = "JOINING_CONFIRMATION";
    app.agreement = {
      id: `agr-${Date.now()}`,
      termsVersion: "v1.0-AL-LEGAL",
      acceptedAt: new Date(),
      confidentialityAccepted: true,
    };
    return true;
  }
  return false;
}

/**
 * Retrieve all applications submitted by a student
 */
export async function getUserApplications(
  userId: string
): Promise<StudentApplicationRecord[]> {
  try {
    const dbApps = await prisma.application.findMany({
      where: { userId },
      include: {
        internship: true,
        offerLetter: true,
        agreement: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbApps.length > 0) {
      return dbApps.map((a) => {
        const stage = a.stage as ApplicationStageKey;
        return {
          id: a.id,
          userId: a.userId,
          internshipId: a.internshipId,
          internshipSlug: a.internship.slug,
          internshipTitle: a.internship.title,
          internshipDomain: a.internship.domain,
          roleTitle: a.internship.roleTitle ?? "Intern",
          durationMonths: a.internship.durationMonths ?? 2,
          stage,
          stageInfo: STAGE_CONFIG[stage] ?? STAGE_CONFIG.APPLICATION_RECEIVED,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          offerLetter: a.offerLetter
            ? {
                id: a.offerLetter.id,
                signatory: a.offerLetter.signatory,
                startDate: a.offerLetter.startDate,
                reportingTo: a.offerLetter.reportingTo,
                issuedAt: a.offerLetter.issuedAt,
              }
            : null,
          agreement: a.agreement
            ? {
                id: a.agreement.id,
                termsVersion: a.agreement.termsVersion,
                acceptedAt: a.agreement.acceptedAt,
                confidentialityAccepted: a.agreement.confidentialityAccepted,
              }
            : null,
        };
      });
    }
  } catch {
    // Database offline / unmigrated: fall back to memory
  }

  // Fallback to memory store
  const userMemoryApps = memoryApplications.filter((a) => a.userId === userId);
  return userMemoryApps.map((a) => {
    const track: InternshipTrack | undefined = INITIAL_INTERNSHIPS.find(
      (t) => t.slug === a.internshipSlug
    );
    const stage = a.stage;
    return {
      id: a.id,
      userId: a.userId,
      internshipId: track?.id ?? a.internshipSlug,
      internshipSlug: a.internshipSlug,
      internshipTitle: track?.title ?? "Internship Track",
      internshipDomain: track?.domain ?? "ENGINEERING",
      roleTitle: track?.roleTitle ?? "Intern",
      durationMonths: track?.durationMonths ?? 2,
      stage,
      stageInfo: STAGE_CONFIG[stage] ?? STAGE_CONFIG.APPLICATION_RECEIVED,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      offerLetter: null,
      agreement: a.agreement ?? null,
    };
  });
}

/**
 * Check if student has already applied to an internship track
 */
export async function hasStudentApplied(
  userId: string,
  internshipSlug: string
): Promise<boolean> {
  try {
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        internship: { slug: internshipSlug },
      },
    });
    if (existing) return true;
  } catch {
    // Fall back to memory
  }

  return memoryApplications.some(
    (a) => a.userId === userId && a.internshipSlug === internshipSlug
  );
}
