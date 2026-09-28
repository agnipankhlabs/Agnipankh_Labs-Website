import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronRight,
  CheckSquare,
  UserCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { Container, Card } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/auth";
import { getInternshipBySlug } from "@/lib/internships";
import { hasStudentApplied } from "@/lib/applications";
import { INITIAL_INTERNSHIPS, MODE_LABELS } from "@/content/internships";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";

interface InternshipDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return INITIAL_INTERNSHIPS.map((track) => ({
    slug: track.slug,
  }));
}

export async function generateMetadata({
  params,
}: InternshipDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const track = await getInternshipBySlug(slug);

  if (!track) {
    return {
      title: "Internship Track Not Found",
    };
  }

  return {
    title: `${track.title} | Agnipankh Labs`,
    description: track.summary,
  };
}

export default async function InternshipDetailPage({
  params,
}: InternshipDetailPageProps) {
  const { slug } = await params;
  const track = await getInternshipBySlug(slug);

  if (!track) {
    notFound();
  }

  const session = await auth();
  const alreadyApplied = session?.user?.id
    ? await hasStudentApplied(session.user.id, track.slug)
    : false;

  const pipelineStages = [
    {
      num: 1,
      title: "Application Received",
      desc: "Submit your student profile and academic background for automated logging.",
    },
    {
      num: 2,
      title: "Eligibility Check",
      desc: "Admissions review verifies student status and prerequisite foundations.",
    },
    {
      num: 3,
      title: "Selection Decision",
      desc: "Domain mentors evaluate cohort capacity and select candidates.",
    },
    {
      num: 4,
      title: "Offer Letter Issued",
      desc: "Formal digital offer letter with reporting line and track scope generated.",
    },
    {
      num: 5,
      title: "Joining Confirmation",
      desc: "Sign institutional agreement and receive cohort onboarding access.",
    },
  ];

  return (
    <div className="py-10 sm:py-16">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-body">
            <li>
              <Link href="/" className="hover:text-navy">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-navy/30" />
            </li>
            <li>
              <Link href="/internships" className="hover:text-navy">
                Internships
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-navy/30" />
            </li>
            <li className="font-semibold text-navy truncate max-w-[200px] sm:max-w-none">
              {track.title}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand-ink" />
              <span>{track.domainLabel}</span>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              {track.title}
            </h1>

            <p className="mt-4 text-base text-body sm:text-lg leading-relaxed">
              {track.description}
            </p>

            {/* Quick Meta Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-navy/80">
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5">
                <Clock className="h-4 w-4 text-brand-ink" />
                <span>{track.durationMonths} Months Duration</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5">
                <Laptop className="h-4 w-4 text-royal-ink" />
                <span>{MODE_LABELS[track.mode] ?? track.mode}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5">
                <UserCheck className="h-4 w-4 text-emerald-700" />
                <span>Role: {track.roleTitle}</span>
              </span>
            </div>
          </div>

          {/* Sticky Enrollment Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-navy">Track Overview</h2>
              <div className="mt-4 space-y-3 divide-y divide-navy/5 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-body">Format</span>
                  <span className="font-semibold text-navy">{MODE_LABELS[track.mode]}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-body">Duration</span>
                  <span className="font-semibold text-navy">{track.durationMonths} Months</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-body">Credential</span>
                  <span className="font-semibold text-navy">Verifiable Certificate</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-body">Enrollment Fee</span>
                  <span className="font-bold text-emerald-700">Free / Sponsored</span>
                </div>
              </div>

              <div id="apply" className="mt-6 space-y-3">
                {alreadyApplied ? (
                  <ButtonLink
                    href="/dashboard"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center gap-2 bg-emerald-700 hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Application In Review → Dashboard</span>
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href={`/internships/${track.slug}/apply`}
                    variant="primary"
                    size="lg"
                    className="w-full justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Apply for This Track</span>
                  </ButtonLink>
                )}
                <ButtonLink
                  href="/contact"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  <span>Inquire with Admissions</span>
                </ButtonLink>
              </div>

              <div className="mt-4 rounded-xl bg-muted/30 p-3 text-[11px] text-body leading-tight">
                <ShieldCheck className="mb-1 h-4 w-4 text-emerald-700 inline mr-1" />
                <span>Zero tuition lock-in. Applications are reviewed sequentially per cohort.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Curriculum / Objectives */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            {/* Learning Objectives */}
            <section aria-labelledby="learning-objectives-heading">
              <h2
                id="learning-objectives-heading"
                className="font-heading text-2xl font-bold text-navy"
              >
                What You Will Master
              </h2>
              <p className="mt-2 text-sm text-body">
                Our curriculum emphasizes active implementation rather than passive listening. During this track, you will:
              </p>
              <div className="mt-5 space-y-3">
                {track.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-navy/5 bg-white p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    <p className="text-sm text-navy leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Prerequisites & Required Skills */}
            <section aria-labelledby="prerequisites-heading">
              <h2
                id="prerequisites-heading"
                className="font-heading text-2xl font-bold text-navy"
              >
                Skill Prerequisites
              </h2>
              <p className="mt-2 text-sm text-body">
                To succeed in this cohort, candidates should possess familiarity with:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {track.skillRequirements.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-brand-ink" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Completion Criteria */}
            <section aria-labelledby="completion-heading">
              <h2
                id="completion-heading"
                className="font-heading text-2xl font-bold text-navy"
              >
                Completion & Certification Criteria
              </h2>
              <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-6">
                <p className="text-sm text-body leading-relaxed">
                  {track.completionCriteria}
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-navy/5 pt-4 text-xs text-navy/80">
                  <Award className="h-4 w-4 text-brand-ink" />
                  <span>
                    Qualifying graduates receive a permanent Agnipankh Labs Verifiable Certificate.
                  </span>
                </div>
              </div>
            </section>

            {/* 5-Stage Selection Pipeline */}
            <section aria-labelledby="pipeline-heading">
              <h2
                id="pipeline-heading"
                className="font-heading text-2xl font-bold text-navy"
              >
                5-Stage Application Pipeline
              </h2>
              <p className="mt-2 text-sm text-body">
                Every application follows the standardized Internship Operations Workflow:
              </p>
              <div className="mt-6 space-y-4">
                {pipelineStages.map((stage) => (
                  <div
                    key={stage.num}
                    className="flex items-start gap-4 rounded-xl border border-navy/10 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-sm font-bold text-white">
                      {stage.num}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy">{stage.title}</h3>
                      <p className="mt-0.5 text-xs text-body">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column / FAQ / Support */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <h3 className="font-heading text-base font-bold text-navy">
                Need Academic Approval?
              </h3>
              <p className="mt-2 text-xs text-body leading-relaxed">
                If your university or college requires an institutional MoU or verification letter,
                have your Training & Placement Officer (TPO) reach out directly.
              </p>
              <div className="mt-4">
                <ButtonLink
                  href="/partnerships"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  <span>College Partnerships MoU</span>
                </ButtonLink>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-base font-bold text-navy">
                Admissions Desk
              </h3>
              <p className="mt-2 text-xs text-body leading-relaxed">
                Have questions regarding syllabus depth, cohort timelines, or prerequisite requirements?
              </p>
              <p className="mt-3 text-xs font-semibold text-brand-ink">
                internships@agnipankhlabs.com
              </p>
            </Card>
          </div>
        </div>

        {/* Legal Educational Disclaimer */}
        <div className="mt-16 rounded-2xl border border-navy/10 bg-muted/20 p-6">
          <p className="text-xs text-body leading-relaxed text-center">
            {NO_GUARANTEE_DISCLAIMER}
          </p>
        </div>
      </Container>
    </div>
  );
}
