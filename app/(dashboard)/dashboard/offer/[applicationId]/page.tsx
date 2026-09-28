import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOfferLetterData, buildMemoryOfferLetter } from "@/lib/offer-letter";
import { getUserApplications } from "@/lib/applications";
import { OfferLetterDocument } from "@/components/dashboard/offer-letter-document";
import { Container } from "@/components/ui/layout";
import { isStaff } from "@/lib/auth/rbac";

export const metadata: Metadata = {
  title: "Offer Letter & Internship Agreement | Agnipankh Labs",
  description:
    "Review your official Internship Offer Letter, verify program details, and digitally execute the Internship Training Agreement.",
};

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function StudentOfferPage({ params }: PageProps) {
  const { applicationId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/offer/${applicationId}`);
  }

  // Fetch offer letter data
  let data = await getOfferLetterData(applicationId);

  // If DB returned null, check user's applications for fallback
  if (!data) {
    const userApps = await getUserApplications(session.user.id);
    const userApp = userApps.find((a) => a.id === applicationId);

    if (userApp) {
      data = buildMemoryOfferLetter({
        applicationId,
        userId: session.user.id,
        candidateName: session.user.name ?? "Learner Candidate",
        candidateEmail: session.user.email ?? "candidate@agnipankhlabs.com",
        internshipSlug: userApp.internshipSlug,
      });
      data.stage = userApp.stage;
      if (userApp.agreement) {
        data.agreementAcceptedAt = userApp.agreement.acceptedAt;
        data.confidentialityAccepted = userApp.agreement.confidentialityAccepted;
        data.termsVersion = userApp.agreement.termsVersion;
      }
    }
  }

  if (!data) {
    notFound();
  }

  // Security check: Candidate can only view their own offer letter (unless staff/admin)
  const isStaffOrAdmin = isStaff(session);

  if (data.userId !== session.user.id && !isStaffOrAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div className="bg-muted/30 py-8 sm:py-12">
      <Container>
        <OfferLetterDocument
          data={data}
          isAdminPreview={false}
          studentReturnHref="/dashboard"
        />
      </Container>
    </div>
  );
}
