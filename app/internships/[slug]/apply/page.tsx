import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getInternshipBySlug } from "@/lib/internships";
import { hasStudentApplied } from "@/lib/applications";
import { Container, Card } from "@/components/ui/layout";
import { InternshipApplyForm } from "@/components/forms/internship-apply-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = await getInternshipBySlug(slug);

  if (!track) {
    return { title: "Track Not Found" };
  }

  return {
    title: `Apply for ${track.title} Cohort | Agnipankh Labs`,
    description: `Submit your candidate profile and statement of purpose for the ${track.title} internship track.`,
  };
}

export default async function InternshipApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/internships/${encodeURIComponent(slug)}/apply`);
  }

  const track = await getInternshipBySlug(slug);
  if (!track) {
    notFound();
  }

  const alreadyApplied = await hasStudentApplied(session.user.id, slug);

  // Fetch student profile for default prefill
  let userProfile = null;
  try {
    userProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
  } catch {
    // Database offline fallback
  }

  const defaultValues = {
    fullName: userProfile?.fullName || session.user.name || "",
    phone: userProfile?.phone || "",
    college: userProfile?.college || "",
    degree: userProfile?.degree || "",
    branch: userProfile?.branch || "",
    graduationYear: userProfile?.graduationYear || null,
    githubUrl: userProfile?.githubUrl || "",
    linkedinUrl: userProfile?.linkedinUrl || "",
    portfolioUrl: userProfile?.portfolioUrl || "",
  };

  return (
    <div className="bg-muted/20 py-10 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-body">
          <Link href="/internships" className="hover:text-navy hover:underline">
            Internships
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-navy/30" aria-hidden="true" />
          <Link
            href={`/internships/${track.slug}`}
            className="hover:text-navy hover:underline max-w-[200px] truncate"
          >
            {track.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-navy/30" aria-hidden="true" />
          <span className="font-semibold text-navy">Apply</span>
        </nav>

        {/* Back link */}
        <div className="mb-6">
          <Link
            href={`/internships/${track.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-ink hover:text-brand-hover hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Track Details</span>
          </Link>
        </div>

        {alreadyApplied ? (
          <Card className="p-8 sm:p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-ink">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy sm:text-3xl">
              Application In Progress
            </h1>
            <p className="mt-3 text-sm text-body max-w-md mx-auto leading-relaxed">
              You have already submitted an application for the <strong>{track.title}</strong> cohort. You can monitor review milestones, eligibility verification, and offer letter updates live on your dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
              >
                <span>Go to Learner Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/internships"
                className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-5 py-3 text-sm font-medium text-navy hover:bg-muted/30 transition-colors"
              >
                <span>Browse Other Tracks</span>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm sm:p-10">
            {/* Header */}
            <div className="border-b border-navy/10 pb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <span>Internship Admission Portal</span>
              </div>
              <h1 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
                Apply for {track.title}
              </h1>
              <p className="mt-2 text-sm text-body leading-relaxed">
                Fill out the application below. Admitted interns are selected based on academic alignment, technical curiosity, and statement of purpose.
              </p>
            </div>

            {/* Application Form */}
            <div className="mt-8">
              <InternshipApplyForm
                track={track}
                defaultValues={defaultValues}
              />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
