import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
} from "lucide-react";
import { Container, Card } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { InternshipFilters } from "@/components/internships/internship-filters";
import { getPublishedInternships } from "@/lib/internships";
import { MODE_LABELS } from "@/content/internships";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Industry Internship Programs",
  description:
    "Apply for structured internships in Web Development, AI/ML, Data Science, Cybersecurity, Marketing, and HR. Gain real-world experience and verifiable certificates.",
};

interface InternshipsPageProps {
  searchParams: Promise<{
    domain?: string;
    mode?: string;
  }>;
}

export default async function InternshipsPage({ searchParams }: InternshipsPageProps) {
  const resolvedParams = await searchParams;
  const activeDomain = resolvedParams.domain ?? "ALL";
  const activeMode = resolvedParams.mode ?? "ALL";

  const internships = await getPublishedInternships({
    domain: activeDomain,
    mode: activeMode,
  });

  return (
    <div className="py-[2cm]">
      <Container>
        {/* Page Header Hero Banner with Background Image */}
        <div className="relative overflow-hidden rounded-3xl border border-navy/20 bg-navy p-8 sm:p-12 shadow-2xl">
          {/* Background Image & Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/internship-showcase.jpg"
              alt="Agnipankh Tech Internship Showcase"
              fill
              className="object-cover object-center opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/60" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-ink backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span className="text-white">Practical Industry Exposure</span>
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Experiential Internship Programs
            </h1>
            <p className="mt-4 text-base text-slate-200 sm:text-lg">
              Bridge academic theory with industry execution. Work on real capstone deliverables,
              collaborate with technical mentors, and earn tamper-evident, cryptographically verified credentials.
            </p>
          </div>

          {/* Glassmorphic Value Highlights Strip */}
          <div className="relative z-10 mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-lg sm:grid-cols-3 sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
                <Laptop className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Hands-On Sprints</h2>
                <p className="mt-0.5 text-xs text-slate-200">
                  Real codebases, architecture reviews, and production deployment standards.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
                <Award className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">1-on-1 Mentor Guidance</h2>
                <p className="mt-0.5 text-xs text-slate-200">
                  Structured evaluations, resume feedback, and direct code reviews.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Verifiable Credentials</h2>
                <p className="mt-0.5 text-xs text-slate-200">
                  Permanently verifiable certificates with tamper-evident SHA-256 digests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mt-12 rounded-2xl border border-navy/10 bg-white p-6 shadow-2xs">
          <Suspense fallback={<div className="h-14 animate-pulse rounded-lg bg-muted/40" />}>
            <InternshipFilters activeDomain={activeDomain} activeMode={activeMode} />
          </Suspense>
        </div>

        {/* Listings Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-body">
              Showing <span className="font-bold text-navy">{internships.length}</span> Track{internships.length === 1 ? "" : "s"}
            </p>
          </div>

          {internships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center">
              <p className="font-heading text-lg font-semibold text-navy">
                No internships found matching your filters
              </p>
              <p className="mt-2 text-sm text-body">
                Try resetting your filters or check back soon for upcoming cohort batches.
              </p>
              <div className="mt-6">
                <ButtonLink href="/internships" variant="outline" size="sm">
                  Clear Filters
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-stagger>
              {internships.map((track) => (
                <Card
                  key={track.id}
                  className="reveal flex h-full flex-col justify-between transition-all hover:border-brand-ink/30 hover:shadow-md"
                >
                  <div>
                    {/* Badge & Mode */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-semibold text-navy">
                        {track.domainLabel}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-body">
                        <Clock className="h-3.5 w-3.5 text-brand-ink" />
                        <span>{track.durationMonths} Mo</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 font-heading text-lg font-bold text-navy hover:text-brand-ink">
                      <Link href={`/internships/${track.slug}`}>{track.title}</Link>
                    </h3>

                    {/* Summary */}
                    <p className="mt-2 line-clamp-3 text-sm text-body leading-relaxed">
                      {track.summary}
                    </p>

                    {/* Format meta */}
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-navy/80">
                      <Laptop className="h-3.5 w-3.5 text-royal-ink" />
                      <span>{MODE_LABELS[track.mode] ?? track.mode}</span>
                      <span className="text-navy/20">•</span>
                      <span className="text-emerald-700 font-semibold">Free Enrollment</span>
                    </div>

                    {/* Skill tags */}
                    <div className="mt-4 border-t border-navy/5 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-body">
                        Key Skills Acquired
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {track.skillRequirements.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-navy/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3 border-t border-navy/10 pt-4">
                    <ButtonLink
                      href={`/internships/${track.slug}`}
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center text-xs"
                    >
                      <span>Details</span>
                    </ButtonLink>
                    <ButtonLink
                      href={`/internships/${track.slug}#apply`}
                      variant="primary"
                      size="sm"
                      className="flex-1 justify-center gap-1.5 text-xs"
                    >
                      <span>Apply</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </ButtonLink>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Educational Disclaimer Notice */}
        <div className="mt-16 rounded-2xl border border-navy/10 bg-navy/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-navy shadow-2xs">
              <Info className="h-5 w-5 text-brand-ink" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-navy">
                Important Educational Notice
              </h2>
              <p className="mt-1 text-sm text-body leading-relaxed">
                {NO_GUARANTEE_DISCLAIMER}
              </p>
              <p className="mt-2 text-xs text-body">
                All candidates are evaluated based on merit, continuous milestone delivery, and code review evaluations.
                For inquiries regarding institutional cohort arrangements, visit our{" "}
                <Link href="/partnerships" className="font-semibold text-brand-ink hover:underline">
                  College Partnerships
                </Link>{" "}
                desk.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
