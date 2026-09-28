import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Award,
  QrCode,
  Lock,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { VerifySearchForm } from "./verify-search-form";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Verify Certificate & Credentials | Agnipankh Labs",
  description:
    "Official Credential Verification Portal for Agnipankh Labs. Instantly validate tamper-proof certificates using unique frozen IDs or SHA-256 digests.",
  openGraph: {
    title: "Verify Certificate | Agnipankh Labs",
    description:
      "Instantly validate official certificates and credentials issued by Agnipankh Labs.",
    type: "website",
  },
};

export default function RootVerifyPage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f9fc] to-surface py-[2cm]">
        {/* Subtle decorative background blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-[300px] w-[300px] rounded-full bg-royal/5 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Brand Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/logo-full.png"
                alt="Agnipankh Labs Logo"
                width={220}
                height={80}
                className="h-16 w-auto object-contain sm:h-20"
                priority
              />
            </div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-ink/20 bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Official Verification Portal</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl text-balance">
              Credential & Certificate Verification
            </h1>

            {/* Sub-headline */}
            <p className="mt-4 text-lg leading-relaxed text-body sm:text-xl text-pretty">
              Instantly validate authentic certificates issued by Agnipankh Labs. Enter a unique
              Certificate ID below to verify recipient details and cryptographic integrity.
            </p>

            {/* Interactive Search Box */}
            <div className="mx-auto mt-10 max-w-xl">
              <VerifySearchForm />
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VERIFICATION FEATURES — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <Section className="bg-white">
        <SectionHeading
          eyebrow="SECURITY GUARANTEES"
          title="Tamper-Proof Credential Architecture"
          description="Every certificate issued by Agnipankh Labs incorporates multi-layer cryptographic safeguards."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "Cryptographic SHA-256 Digest",
              body: "Every credential features an immutable HMAC-SHA256 digest generated at issuance to guarantee data integrity.",
            },
            {
              icon: QrCode,
              title: "Direct QR Code Scanning",
              body: "Scan the QR code printed on physical or PDF certificates to open this portal and verify authentic records instantly.",
            },
            {
              icon: Award,
              title: "Permanent Institutional Registry",
              body: "Verified student milestones are stored in our permanent institutional database for lifetime employer validation.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-[#f8f9fc] p-7 shadow-xs ring-1 ring-navy/5 transition-all hover:border-brand-ink/30 hover:shadow-md"
              >
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-ink">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          FORMAT & GUIDE SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <Section className="bg-[#f8f9fc]">
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2">
            {/* Left: Certificate ID Formats */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-xs">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-brand-ink">
                    <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-navy">
                    Certificate ID Formats
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  Agnipankh Labs certificate IDs follow structured institutional formats for easy identification:
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-navy/10 bg-[#f8f9fc] p-4 text-xs">
                    <span className="font-semibold text-navy">Internships:</span>{" "}
                    <code className="rounded bg-navy/5 px-2 py-0.5 font-mono font-bold text-brand-ink">
                      AL-INT26-XXXXXXXXXX
                    </code>
                    <p className="mt-1 text-body/80">Issued for completed domain internship tracks.</p>
                  </div>

                  <div className="rounded-xl border border-navy/10 bg-[#f8f9fc] p-4 text-xs">
                    <span className="font-semibold text-navy">Training Programs:</span>{" "}
                    <code className="rounded bg-navy/5 px-2 py-0.5 font-mono font-bold text-brand-ink">
                      AL-TRN26-XXXXXXXXXX
                    </code>
                    <p className="mt-1 text-body/80">Issued for hands-on skill training cohorts.</p>
                  </div>

                  <div className="rounded-xl border border-navy/10 bg-[#f8f9fc] p-4 text-xs">
                    <span className="font-semibold text-navy">Special Commendations:</span>{" "}
                    <code className="rounded bg-navy/5 px-2 py-0.5 font-mono font-bold text-brand-ink">
                      AL-EXC26-XXXXXXXXXX
                    </code>
                    <p className="mt-1 text-body/80">Issued for top project performers and ambassadors.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Employer Audit Notice */}
            <div className="flex h-full flex-col justify-between rounded-2xl border border-navy/15 bg-navy p-8 text-white shadow-xl">
              <div>
                <span className="inline-block rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Employers & Recruiters
                </span>
                <h2 className="mt-4 font-heading text-2xl font-bold text-white">
                  Institutional Audit Desk
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  Are you a hiring manager or university administrator requesting formal candidate verification or bulk background checks?
                </p>
                <ul className="mt-6 space-y-3 text-xs text-white/85">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>Instant online verification for candidate resume links.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>Direct email verification via certificates@agnipankhlabs.com.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>Zero cost employer verification services available 24/7.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/15">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-navy hover:bg-white/90 transition-colors"
                >
                  Contact Verification Desk →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Mandatory Disclaimer */}
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
