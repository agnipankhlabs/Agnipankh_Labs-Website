import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Clock, HelpCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Review the refund, return, and cancellation policies for Agnipankh Labs internship enrollments, training programs, and coursework.",
};

export default function RefundPolicyPage() {
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
              Refund & Cancellation Policy
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
          {/* Policy Overview */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              Overview
            </h2>
            <p className="leading-relaxed">
              At {SITE.name}, we are dedicated to providing high-quality, practical learning
              experiences. Because our programs involve cohort planning, dedicated mentor
              allocation, and digital infrastructure setup, the following terms govern
              cancellations and refund requests.
            </p>
          </section>

          {/* 1. Internship Programs */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-navy">
                1. Internship Programs
              </h2>
            </div>
            <p className="leading-relaxed">
              Unless explicitly stated otherwise in the specific program onboarding documentation:
            </p>
            <div className="rounded-xl border border-navy/10 bg-muted/20 p-5 space-y-2 text-sm">
              <p>
                <strong>Non-Refundable Upon Onboarding:</strong> Registration, assessment, or
                onboarding fees associated with internship programs are generally non-refundable
                once enrollment is confirmed and cohort resources have been assigned.
              </p>
              <p>
                <strong>Pre-Cohort Withdrawals:</strong> If an enrolled participant requests a
                cancellation in writing before cohort credentials or learning materials have been
                dispatched, a partial refund or cohort deferral may be granted at the sole
                discretion of the admissions team.
              </p>
            </div>
          </section>

          {/* 2. Course & Training Programs */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-navy">
                2. Course & Training Programs
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Prior to Material Access:</strong> Refund requests submitted prior to
                accessing the course management portal or learning modules will be evaluated for
                a full refund, minus third-party payment gateway processing charges.
              </li>
              <li>
                <strong>After Material Access:</strong> Once a learner accesses course materials,
                starts guided modules, or downloads project templates, fees become non-refundable.
              </li>
            </ul>
          </section>

          {/* 3. Cancellation Process */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              3. How to Submit a Cancellation Request
            </h2>
            <p className="leading-relaxed">
              All cancellation and refund requests must be formally submitted through our
              official support desk from the email address used during initial enrollment:
            </p>
            <div className="rounded-xl border border-navy/10 bg-white p-5 shadow-xs text-sm space-y-2">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${SITE.email.support}`}
                  className="font-semibold text-brand-ink hover:underline"
                >
                  {SITE.email.support}
                </a>
              </p>
              <p>
                <strong>Subject Line Format:</strong>{" "}
                <code className="rounded bg-navy/5 px-2 py-0.5 font-mono text-xs">
                  Refund Request - [Your Full Name] - [Program / Cohort ID]
                </code>
              </p>
              <p className="text-xs text-body/80 pt-1">
                Please attach your enrollment confirmation and clearly specify the reason
                for your cancellation request.
              </p>
            </div>
          </section>

          {/* 4. Exceptional Circumstances */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              4. Exceptional Circumstances
            </h2>
            <p className="leading-relaxed">
              {SITE.name} recognizes that unexpected life circumstances can occur. We reserve the
              right to evaluate, on a compassionate and case-by-case basis, requests arising
              from medical emergencies or severe technical impediments attributable directly
              to platform failures.
            </p>
            <p className="leading-relaxed">
              In approved exceptional cases, refunds are processed to the original payment method
              within 7–10 business days.
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
            <Link href="/disclaimer" className="text-brand-ink hover:underline">
              Legal Disclaimer
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
