import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileCheck2, HelpCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Review the terms, conditions, user responsibilities, certificate issuance criteria, and acceptable use policies governing Agnipankh Labs.",
};

export default function TermsPage() {
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
              Terms & Conditions
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
          {/* 1. Acceptance of Terms */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing, browsing, or utilizing {SITE.name} (&ldquo;the Platform&rdquo;),
              or registering for any internship, training, or certification track, you agree
              to be bound by these Terms and Conditions and our Privacy Policy.
            </p>
            <p className="leading-relaxed">
              If you do not agree with any part of these terms, you must refrain from
              accessing our services and participating in our programs.
            </p>
          </section>

          {/* 2. User Responsibilities */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              2. User Responsibilities
            </h2>
            <p className="leading-relaxed">
              As a user or registered participant, you agree to:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Provide accurate, current, and complete personal and academic information.</li>
              <li>Maintain the confidentiality of any platform credentials assigned to you.</li>
              <li>Use all educational platforms, repos, and communication channels lawfully.</li>
              <li>Respect the intellectual property rights of {SITE.name} and fellow learners.</li>
              <li>Submit original work for project tasks and milestone evaluations.</li>
            </ul>
          </section>

          {/* 3. Prohibited Activities */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              3. Prohibited Activities
            </h2>
            <p className="leading-relaxed">
              Users of the platform are strictly prohibited from:
            </p>
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 text-sm text-navy space-y-2">
              <div className="flex items-center gap-2 font-semibold text-red-800">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Strict Compliance Restrictions</span>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-xs text-navy/90 sm:text-sm">
                <li>Sharing or transferring login accounts, tokens, or assessment credentials.</li>
                <li>Uploading malicious scripts, automated spiders, or harmful content.</li>
                <li>Attempting unauthorized access to system databases, server actions, or APIs.</li>
                <li>Plagiarizing project code, forging assessment logs, or misrepresenting credentials.</li>
                <li>Engaging in harassment, abusive language, or disruptive conduct within cohorts.</li>
              </ul>
            </div>
          </section>

          {/* 4. Intellectual Property Rights */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              4. Intellectual Property
            </h2>
            <p className="leading-relaxed">
              All website content, curriculum frameworks, training documents, logos, brand marks,
              design tokens, certificate templates, and educational assets remain the exclusive
              intellectual property of {SITE.name}, unless explicitly marked otherwise.
            </p>
            <p className="leading-relaxed">
              Learners retain ownership of their original personal code implementations and
              capstone projects built during programs, subject to the open-source license
              agreements applicable to respective project templates.
            </p>
          </section>

          {/* 5. Certificate Policy */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              5. Certificate Issuance & Verification Policy
            </h2>
            <p className="leading-relaxed">
              Certificates of completion or excellence are issued solely based on the verifiable
              fulfillment of required tasks, capstone projects, and evaluation benchmarks
              determined by {SITE.name}.
            </p>
            <div className="rounded-xl border border-navy/10 bg-muted/20 p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-navy">
                <FileCheck2 className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                <span>Credential Integrity Safeguards</span>
              </div>
              <p>
                Every credential features a unique institutional ID and cryptographic hash that
                is verifiable on our public portal at{" "}
                <Link href="/verify" className="text-brand-ink underline">
                  agnipankhlabs.com/verify
                </Link>
                .
              </p>
              <p className="text-xs text-body/80">
                {SITE.name} reserves the right to revoke or supersede any certificate issued
                under false pretenses, academic dishonesty, or subsequent discovery of code plagiarism.
              </p>
            </div>
          </section>

          {/* 6. Account Termination */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              6. Suspension & Termination
            </h2>
            <p className="leading-relaxed">
              {SITE.name} reserves the right to suspend, restrict, or terminate platform access
              and cohort participation immediately, without prior notice, in the event of
              terms violation, fraud, or conduct detrimental to the learning community.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              7. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, {SITE.name} shall not be liable for
              any indirect, incidental, consequential, or punitive damages arising from
              participation in our programs or reliance on website materials.
            </p>
            <p className="leading-relaxed font-medium text-navy">
              {NO_GUARANTEE_DISCLAIMER}
            </p>
          </section>

          {/* 8. Contact & Legal Enquiries */}
          <section className="rounded-2xl border border-navy/10 bg-muted/30 p-6 sm:p-7 space-y-2">
            <h2 className="font-heading text-lg font-bold text-navy">
              Legal Desk Contact
            </h2>
            <p className="text-sm">
              For questions regarding these terms and conditions, contact our operations desk:
            </p>
            <p className="text-sm">
              <strong>Email:</strong>{" "}
              <a href={`mailto:${SITE.email.support}`} className="text-brand-ink hover:underline">
                {SITE.email.support}
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
            <Link href="/refund" className="text-brand-ink hover:underline">
              Refund Policy
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
