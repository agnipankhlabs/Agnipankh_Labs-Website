import { prisma } from "@/lib/db";
import { type ApplicationStageKey, getMemoryApplication } from "@/lib/applications";
import { INITIAL_INTERNSHIPS } from "@/content/internships";

export interface OfferLetterData {
  applicationId: string;
  userId: string;
  // Candidate details
  candidateName: string;
  candidateEmail: string;
  college: string | null;
  degree: string | null;
  branch: string | null;
  // Track details
  internshipTitle: string;
  internshipDomain: string;
  internshipSlug: string;
  roleTitle: string;
  durationMonths: number;
  deliveryMode: string;
  // Offer details
  issuedAt: Date;
  startDate: Date | null;
  signatory: string;
  reportingTo: string;
  // Agreement status
  stage: ApplicationStageKey;
  agreementAcceptedAt: Date | null;
  confidentialityAccepted: boolean;
  termsVersion: string | null;
  isDraftPreview?: boolean;
}

/**
 * Fetch full offer letter data for student or admin viewing.
 * If allowDraft is true, will construct draft offer data even if not yet formally issued in DB.
 */
export async function getOfferLetterData(
  applicationId: string,
  allowDraft = false
): Promise<OfferLetterData | null> {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                college: true,
                degree: true,
                branch: true,
              },
            },
          },
        },
        internship: {
          select: {
            slug: true,
            title: true,
            domain: true,
            roleTitle: true,
            durationMonths: true,
            mode: true,
          },
        },
        offerLetter: true,
        agreement: true,
      },
    });

    if (app) {
      const isOfferEligible =
        Boolean(app.offerLetter) ||
        allowDraft ||
        app.stage === "OFFER_LETTER_ISSUED" ||
        app.stage === "JOINING_CONFIRMATION";

      if (!isOfferEligible) return null;

      const defaultStartDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return {
        applicationId: app.id,
        userId: app.userId,
        candidateName:
          app.user.profile?.fullName ?? app.user.name ?? "Candidate",
        candidateEmail: app.user.email,
        college: app.user.profile?.college ?? null,
        degree: app.user.profile?.degree ?? null,
        branch: app.user.profile?.branch ?? null,
        internshipTitle: app.internship.title,
        internshipDomain: app.internship.domain,
        internshipSlug: app.internship.slug,
        roleTitle: app.internship.roleTitle ?? "Intern",
        durationMonths: app.internship.durationMonths ?? 2,
        deliveryMode: app.internship.mode,
        issuedAt: app.offerLetter?.issuedAt ?? new Date(),
        startDate: app.offerLetter?.startDate ?? defaultStartDate,
        signatory: app.offerLetter?.signatory ?? "Director — Agnipankh Labs",
        reportingTo:
          app.offerLetter?.reportingTo ?? "Program Coordinator",
        stage: app.stage as ApplicationStageKey,
        agreementAcceptedAt: app.agreement?.acceptedAt ?? null,
        confidentialityAccepted: app.agreement?.confidentialityAccepted ?? false,
        termsVersion: app.agreement?.termsVersion ?? null,
        isDraftPreview: !app.offerLetter && app.stage !== "OFFER_LETTER_ISSUED" && app.stage !== "JOINING_CONFIRMATION",
      };
    }
  } catch {
    // DB error / unmigrated fallback below
  }

  // Memory fallback
  const mem = getMemoryApplication(applicationId);
  if (mem) {
    const track = INITIAL_INTERNSHIPS.find((t) => t.slug === mem.internshipSlug);
    return {
      applicationId: mem.id,
      userId: mem.userId,
      candidateName: "Learner Candidate",
      candidateEmail: "candidate@agnipankhlabs.com",
      college: "Indian Institute of Technology / University",
      degree: "B.Tech Computer Science",
      branch: "Computer Science & Engineering",
      internshipTitle: track?.title ?? "Internship Track",
      internshipDomain: track?.domain ?? "ENGINEERING",
      internshipSlug: mem.internshipSlug,
      roleTitle: track?.roleTitle ?? "Intern",
      durationMonths: track?.durationMonths ?? 2,
      deliveryMode: track?.mode ?? "ONLINE",
      issuedAt: new Date(),
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      signatory: "Director — Agnipankh Labs",
      reportingTo: "Program Coordinator",
      stage: mem.stage,
      agreementAcceptedAt: mem.agreement?.acceptedAt ?? null,
      confidentialityAccepted: mem.agreement?.confidentialityAccepted ?? false,
      termsVersion: mem.agreement?.termsVersion ?? null,
      isDraftPreview: mem.stage !== "OFFER_LETTER_ISSUED" && mem.stage !== "JOINING_CONFIRMATION",
    };
  }

  return null;
}

/**
 * Memory fallback for generating a synthetic offer letter view when DB is offline.
 * Used on the student dashboard if the real record cannot be fetched.
 */
export function buildMemoryOfferLetter(params: {
  applicationId: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  internshipSlug: string;
}): OfferLetterData {
  const track = INITIAL_INTERNSHIPS.find(
    (t) => t.slug === params.internshipSlug
  );

  return {
    applicationId: params.applicationId,
    userId: params.userId,
    candidateName: params.candidateName,
    candidateEmail: params.candidateEmail,
    college: null,
    degree: null,
    branch: null,
    internshipTitle: track?.title ?? "Internship Track",
    internshipDomain: track?.domain ?? "ENGINEERING",
    internshipSlug: params.internshipSlug,
    roleTitle: track?.roleTitle ?? "Intern",
    durationMonths: track?.durationMonths ?? 2,
    deliveryMode: track?.mode ?? "ONLINE",
    issuedAt: new Date(),
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    signatory: "Director — Agnipankh Labs",
    reportingTo: "Program Coordinator",
    stage: "OFFER_LETTER_ISSUED",
    agreementAcceptedAt: null,
    confidentialityAccepted: false,
    termsVersion: null,
  };
}
