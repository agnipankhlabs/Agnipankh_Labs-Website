import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, HelpCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Legal Disclaimer",
  description:
    "Official Educational Disclaimer and Limitation of Liability for Agnipankh Labs. Outlines employment non-guarantee and platform terms.",
};

export default function DisclaimerPage() {
  const effectiveDate = SITE.entity.policiesEffectiveDate ?? "2026";

  return (
    <>
      {/* Header */}
      <section className="border-b border-navy/10 bg-gradient-to-b from-surface to-muted/30 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              LEGAL & COMPLIANCE
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Legal Disclaimer
            </h1>
            <p className="mt-3 text-sm text-body">
              Effective Date: {effectiveDate} • Last reviewed: {new Date().getFullYear()}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Section className="bg-surface">
        <div className="mx-auto max-w-3xl space-y-10 text-body">
          {/* Prominent Educational Notice Alert */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 sm:p-8 text-navy">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy">
                  Important Educational Notice
                </h2>
                <p className="mt-2 text-base font-semibold leading-relaxed text-navy/90">
                  {NO_GUARANTEE_DISCLAIMER}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-navy/80">
                  {SITE.name} is dedicated exclusively to skill training, practical project
                  exposure, and career development guidance. We do not act as an employment
                  agency, recruitment consultancy, or job guarantee provider.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Educational & Training Nature */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              1. Nature of Programs & Internships
            </h2>
            <p className="leading-relaxed">
              {SITE.name} provides structured educational training, virtual internship
              cohorts, mentorship reviews, and practical project simulations designed to
              bridge the gap between academic theory and practical industry competence.
            </p>
            <p className="leading-relaxed">
              Participation in or completion of any internship, coursework, training track, or
              mentorship session does not constitute an offer of permanent employment, a
              contract of service, or an assurance of third-party job placement.
            </p>
          </section>

          {/* 2. Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              2. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by applicable Indian laws, {SITE.name}, its
              founders, mentors, and partners shall not be held liable or responsible for:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Hiring & Placement Outcomes:</strong> Hiring decisions made by third-party
                employers, companies, or recruiters evaluating program participants.
              </li>
              <li>
                <strong>Career & Financial Decisions:</strong> Individual career choices, job
                transitions, or educational investments undertaken by users.
              </li>
              <li>
                <strong>Third-Party Service Interruptions:</strong> Downtime, data outages, or
                service failures originating from third-party hosting, payment, or cloud providers.
              </li>
              <li>
                <strong>External Links:</strong> Content, policies, or practices of external
                websites linked from our platform.
              </li>
            </ul>
          </section>

          {/* 3. Website Content & Informational Purpose */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              3. Content & Informational Use
            </h2>
            <p className="leading-relaxed">
              All information, articles, guides, syllabus breakdowns, and career resources
              published across this website are provided solely for general educational and
              informational purposes.
            </p>
            <p className="leading-relaxed">
              While we strive to ensure technical accuracy and currency, {SITE.name} makes no
              warranties, express or implied, regarding the completeness, reliability, or
              fitness for a specific purpose of any website material.
            </p>
          </section>

          {/* 4. Credentials & Verification */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              4. Certificate Authenticity & Validation
            </h2>
            <p className="leading-relaxed">
              Certificates issued by {SITE.name} validate only that a participant completed
              the prescribed evaluation criteria and project requirements for a specific cohort.
            </p>
            <p className="leading-relaxed">
              Verification is publicly accessible at{" "}
              <Link href="/verify" className="text-brand-ink underline">
                agnipankhlabs.com/verify
              </Link>
              . Third-party employers are encouraged to verify credential hashes directly through
              our portal before making hiring decisions.
            </p>
          </section>

          {/* Contact Details */}
          <section className="rounded-2xl border border-navy/10 bg-muted/30 p-6 sm:p-7 space-y-2">
            <h2 className="font-heading text-lg font-bold text-navy">
              Contact Regarding Policies
            </h2>
            <p className="text-sm">
              If you have any questions or require clarification on our disclaimer policies:
            </p>
            <p className="text-sm">
              <strong>Email:</strong>{" "}
              <a href={`mailto:${SITE.email.info}`} className="text-brand-ink hover:underline">
                {SITE.email.info}
              </a>
            </p>
          </section>

          {/* Quick Legal Links */}
          <div className="flex flex-wrap gap-4 border-t border-navy/10 pt-6 text-xs text-body">
            <span>Related Policies:</span>
            <Link href="/privacy" className="text-brand-ink hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-brand-ink hover:underline">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/refund" className="text-brand-ink hover:underline">
              Refund Policy
            </Link>
          </div>
        </div>
      </Section>

      {/* Mandatory Disclaimer Note */}
      <section className="border-t border-navy/10 bg-muted/20 py-8">
        <Container>
          <div className="flex items-center gap-3 text-center text-xs text-body sm:text-left">
            <HelpCircle className="h-4 w-4 shrink-0 text-navy/40" aria-hidden="true" />
            <p>{NO_GUARANTEE_DISCLAIMER}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
