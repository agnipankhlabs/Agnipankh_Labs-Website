import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileText, Mail, HelpCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Agnipankh Labs collects, uses, stores, and protects your personal information and student data in accordance with applicable data protection standards.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-body">
              Effective Date: {effectiveDate} • Last reviewed: {new Date().getFullYear()}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Policy Content */}
      <Section className="bg-surface">
        <div className="mx-auto max-w-3xl space-y-10 text-body">
          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Welcome to {SITE.name}. We respect your privacy and are committed to protecting
              the personal information you share with us.
            </p>
            <p className="leading-relaxed">
              This Privacy Policy explains how {SITE.name} collects, uses, stores, and
              protects your personal information when you use our website, services,
              internships, training programs, and related digital platforms.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-navy">
              2. Information We Collect
            </h2>
            <p className="leading-relaxed">
              We collect information to deliver effective training programs, evaluate
              internship applications, and issue verifiable certificates:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-navy/10 bg-muted/20 p-5">
                <div className="flex items-center gap-2 font-heading font-semibold text-navy">
                  <FileText className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  <span>Personal Information</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li>• Full Name and contact details</li>
                  <li>• Email Address and Mobile Number</li>
                  <li>• Educational Institution and degree</li>
                  <li>• Resume / CV and project links</li>
                  <li>• Profile credentials and portfolio work</li>
                </ul>
              </div>

              <div className="rounded-xl border border-navy/10 bg-muted/20 p-5">
                <div className="flex items-center gap-2 font-heading font-semibold text-navy">
                  <Eye className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  <span>Technical Information</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li>• IP Address and network context</li>
                  <li>• Device and operating system details</li>
                  <li>• Browser type and version</li>
                  <li>• Platform interaction and usage statistics</li>
                  <li>• Authentication and security logs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              3. How We Use Your Data
            </h2>
            <p className="leading-relaxed">
              Your personal information is processed strictly for legitimate educational
              and administrative purposes, including:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Creating and managing your learner and applicant accounts.</li>
              <li>Processing internship applications and domain cohort assignments.</li>
              <li>Delivering training materials, mentorship reviews, and code evaluations.</li>
              <li>Generating and verifying cryptographic completion certificates.</li>
              <li>Providing responsive technical and learner support services.</li>
              <li>Sending essential transactional updates and administrative notifications.</li>
            </ul>
          </section>

          {/* Data Protection & Security */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              4. Data Protection & Security
            </h2>
            <p className="leading-relaxed">
              We implement industry-standard administrative, physical, and technical security
              measures to safeguard your personal data from unauthorized access, loss,
              misuse, or disclosure.
            </p>
            <p className="leading-relaxed">
              All credential hashes and verification digests are stored securely using
              cryptographic one-way hashing algorithms that prevent unauthorized manipulation
              or tampering.
            </p>
          </section>

          {/* Third-Party Service Providers */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              5. Third-Party Services
            </h2>
            <p className="leading-relaxed">
              We may utilize trusted, privacy-compliant third-party service providers to
              facilitate our operational capabilities:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Transactional email gateways for delivery of notifications.</li>
              <li>Secure cloud databases and infrastructure hosting providers.</li>
              <li>Privacy-focused web performance and telemetry tools.</li>
              <li>Authorized payment processing partners when applicable.</li>
            </ul>
          </section>

          {/* Cookie Policy */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              6. Cookie Policy
            </h2>
            <p className="leading-relaxed">
              Cookies are small data files stored on your device that assist with website
              navigation, session integrity, and user preference retention.
            </p>
            <div className="space-y-2 rounded-xl border border-navy/10 bg-muted/20 p-5 text-sm">
              <p>
                <strong className="text-navy">Essential Cookies:</strong> Required for secure
                platform access, session authentication, and CSRF protection.
              </p>
              <p>
                <strong className="text-navy">Performance Cookies:</strong> Assist in measuring
                load times and platform responsiveness without collecting identifiable personal profiles.
              </p>
              <p className="text-xs text-body/80 pt-1">
                You can configure your browser to reject cookies, though certain interactive features
                may function with reduced capability.
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-bold text-navy">
              7. Your Rights
            </h2>
            <p className="leading-relaxed">
              Under applicable Indian data protection frameworks, you have the right to:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Request access to the personal data we maintain about you.</li>
              <li>Request correction or updating of inaccurate personal records.</li>
              <li>Request deletion of your account and personal data, subject to statutory retention limits.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
          </section>

          {/* Contact & Inquiries */}
          <section className="rounded-2xl border border-navy/10 bg-muted/30 p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-2 font-heading text-lg font-bold text-navy">
              <Mail className="h-5 w-5 text-brand-ink" aria-hidden="true" />
              <span>Contact Privacy Officer</span>
            </div>
            <p className="text-sm leading-relaxed">
              If you have any questions regarding this Privacy Policy or wish to exercise
              your data protection rights, please contact our support desk:
            </p>
            <div className="pt-1 text-sm">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${SITE.email.support}`}
                  className="text-brand-ink hover:underline"
                >
                  {SITE.email.support}
                </a>
              </p>
              <p className="mt-1">
                <strong>Postal Region:</strong> {SITE.location.display}
              </p>
            </div>
          </section>

          {/* Quick Legal Links */}
          <div className="flex flex-wrap gap-4 border-t border-navy/10 pt-6 text-xs text-body">
            <span>Related Policies:</span>
            <Link href="/terms" className="text-brand-ink hover:underline">
              Terms & Conditions
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

      {/* Mandatory Disclaimer Notice */}
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
