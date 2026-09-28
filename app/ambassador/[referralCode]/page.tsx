import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Award,
  Star,
  Calendar,
  MapPin,
  Share2,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { getPublicAmbassadorByCode, mapToPublicSummary } from "@/lib/public-ambassadors";

interface PageProps {
  params: Promise<{ referralCode: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { referralCode } = await params;
  return {
    title: `Campus Ambassador | ${referralCode} | Agnipankh Labs`,
    description: `View the public profile of Campus Ambassador ${referralCode}.`,
    openGraph: {
      title: `Campus Ambassador ${referralCode} | Agnipankh Labs`,
      description: `View the public profile of Campus Ambassador ${referralCode}.`,
      type: "profile",
    },
  };
}

export default async function AmbassadorProfilePage({ params }: PageProps) {
  const { referralCode } = await params;

  const ambassador = await getPublicAmbassadorByCode(referralCode);

  if (!ambassador) {
    notFound();
  }

  const summary = mapToPublicSummary(ambassador);

  const TIER_LABELS: Record<string, { label: string; color: string }> = {
    TIER_1: { label: "Tier 1 (5+)", color: "amber" },
    TIER_2: { label: "Tier 2 (10+)", color: "orange" },
    TIER_3: { label: "Tier 3 (25+)", color: "purple" },
    TIER_4: { label: "Tier 4 (50+)", color: "pink" },
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <Section className="pt-8 pb-6 border-b border-navy/10">
        <Container>
          <nav className="flex items-center gap-2 text-xs text-navy/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center gap-1.5 hover:text-brand-ink transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <span>/</span>
            <Link href="/ambassador/apply" className="hover:text-brand-ink transition-colors">
              Ambassador Programme
            </Link>
            <span>/</span>
            <span className="text-navy/40 truncate max-w-[200px]">{summary.name}</span>
          </nav>

          <header className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-${TIER_LABELS[summary.tier].color}-100 text-${TIER_LABELS[summary.tier].color}-700`}>
                <Award className="h-4 w-4" />
                {TIER_LABELS[summary.tier].label}
              </span>
              {summary.isSenior && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Senior Ambassador
                </span>
              )}
              {summary.status === "APPROVED" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Ambassador
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
              {summary.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-navy/60">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>{summary.college}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{summary.course} • {summary.year}</span>
              </span>
            </div>
          </header>
        </Container>
      </Section>

      {/* Profile Stats */}
      <Section className="pt-6 pb-12 bg-muted/20">
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-xs">
              <p className="font-heading text-3xl font-bold text-navy">{summary.referralCount}</p>
              <p className="text-xs text-navy/50 mt-1">Total Referrals</p>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-xs">
              <p className="font-heading text-3xl font-bold text-navy">{summary.tier.replace("_", " ")}</p>
              <p className="text-xs text-navy/50 mt-1">Current Tier</p>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-xs">
              <p className="font-heading text-3xl font-bold text-navy">{summary.isSenior ? "Yes" : "No"}</p>
              <p className="text-xs text-navy/50 mt-1">Senior Status</p>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-xs">
              <p className="font-heading text-3xl font-bold text-navy">{summary.status === "APPROVED" ? "Active" : summary.status}</p>
              <p className="text-xs text-navy/50 mt-1">Status</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Main Content */}
      <Section className="pt-8 pb-16">
        <Container className="max-w-3xl space-y-10">
          {/* About */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-ink" />
              About
            </h3>
            <p className="text-body leading-relaxed">{summary.bio ?? "No bio provided."}</p>
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-ink" />
              Education
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                <GraduationCap className="h-8 w-8 text-brand-ink/50" />
                <div>
                  <p className="font-semibold text-navy">{summary.college}</p>
                  <p className="text-sm text-body">{summary.course} • {summary.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                <Calendar className="h-8 w-8 text-brand-ink/50" />
                <div>
                  <p className="font-semibold text-navy">Joined Programme</p>
                  <p className="text-sm text-body">{format(summary.joinedAt, "MMMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-brand-ink" />
              Connect
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {summary.linkedin && (
                <a
                  href={summary.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              {summary.github && (
                <a
                  href={summary.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Referral Info */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-ink" />
              Referral Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-navy/10 bg-white p-4">
                <p className="text-xs text-navy/50 mb-1">Your Referral Code</p>
                <p className="font-heading text-2xl font-bold text-navy font-mono tracking-wider">{summary.referralCode}</p>
              </div>
              <div className="rounded-xl border border-navy/10 bg-white p-4">
                <p className="text-xs text-navy/50 mb-1">Referral Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://agnipankhlabs.com/ambassador/apply?ref=${summary.referralCode}`}
                    readOnly
                    className="flex-1 rounded-xl border border-navy/10 bg-muted/20 px-3 py-2 text-sm font-mono text-navy/60"
                  />
                  <Button variant="secondary" size="sm" className="whitespace-nowrap">
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Apply CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-navy/90 to-royal/90 p-8 text-center text-white">
            <h3 className="font-heading text-2xl font-bold">Not an Ambassador Yet?</h3>
            <p className="mt-2 text-white/80">Join the programme and start building your network today.</p>
            <Link
              href="/ambassador/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-semibold text-navy hover:bg-white/90 transition-colors shadow-lg"
            >
              Apply Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Container>
      </Section>
    </article>
  );
}