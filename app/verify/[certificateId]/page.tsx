import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Award, ShieldCheck, ShieldAlert, AlertCircle, Calendar, Building2, ExternalLink, QrCode, Download, Copy } from "lucide-react";
import { getCertificateByCertificateId } from "@/lib/public-certificates";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const cert = await getCertificateByCertificateId(certificateId);
  
  if (!cert) {
    return {
      title: "Certificate Not Found — Verify | Agnipankh Labs",
      description: "The requested certificate could not be found in the Agnipankh Labs registry.",
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `Verify ${cert.certificateId} — ${cert.recipientName} | Agnipankh Labs`,
    description: `Official verification for ${cert.certificateId} issued to ${cert.recipientName} for ${cert.programName}. Tamper-evident HMAC-SHA256 validated.`,
    openGraph: {
      title: `Verify ${cert.certificateId} — ${cert.recipientName}`,
      description: `Official certificate verification for ${cert.programName}`,
      type: "website",
      siteName: "Agnipankh Labs",
    },
    twitter: {
      card: "summary_large_image",
      title: `Verify ${cert.certificateId} — ${cert.recipientName}`,
      description: `Official certificate verification for ${cert.programName}`,
    },
    robots: "index, follow",
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const { certificateId: rawId } = await params;
  const certificate = await getCertificateByCertificateId(rawId);

  if (!certificate) {
    notFound();
  }

  const isRevoked = Boolean(certificate.revokedAt);
  const isSuperseded = Boolean(certificate.supersededById);
  const isSupersession = Boolean(certificate.supersedesId);
  const isVerified = certificate.isVerified;
  const verifyUrl = certificate.qrCodeUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://agnipankhlabs.com"}/verify/${certificate.certificateId}`;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero / Header */}
      <header className="border-b border-navy/10 bg-white">
        <Container className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-ink">
              <Award className="h-3.5 w-3.5" />
              <span>Official Certificate Verification Registry</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Credential Verification
            </h1>
            <p className="text-sm text-body max-w-2xl mx-auto">
              Enter a certificate ID to verify its authenticity, view recipient details, and confirm
              the cryptographic integrity of this credential issued by Agnipankh Labs.
            </p>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12">
        <Container className="space-y-8 max-w-4xl">
          {/* Certificate Status Banner */}
          <div className="rounded-3xl border-2 p-6 shadow-md space-y-4">
            {isRevoked ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                    <ShieldAlert className="h-7 w-7 text-red-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-red-900">
                      CERTIFICATE REVOKED
                    </h2>
                    <p className="text-sm text-red-700">
                      This credential has been permanently revoked and is no longer valid.
                    </p>
                  </div>
                </div>
                {certificate.revokedReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    <p className="font-semibold">Revocation Reason:</p>
                    <p className="mt-1">{certificate.revokedReason}</p>
                    <p className="mt-2 text-xs text-red-600">
                      Revoked on {certificate.revokedAt
                        ? format(new Date(certificate.revokedAt), "MMM d, yyyy")
                        : "&mdash;"}
                    </p>
                  </div>
                )}
              </div>
            ) : isSuperseded ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                    <AlertCircle className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-amber-900">
                      CERTIFICATE SUPERSEDED
                    </h2>
                    <p className="text-sm text-amber-700">
                      This credential has been superseded by a replacement certificate.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Status: Superseded</p>
                  <p className="mt-1 text-xs text-amber-700">
                    A corrected or updated version of this certificate has been issued.
                    The replacement certificate should be used for verification.
                  </p>
                </div>
              </div>
            ) : isSupersession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
                    <ShieldCheck className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-purple-900">
                      REPLACEMENT CERTIFICATE
                    </h2>
                    <p className="text-sm text-purple-700">
                      This certificate replaces a previously issued credential.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
                  <p className="font-semibold">Status: Replacement</p>
                  <p className="mt-1 text-xs text-purple-700">
                    This certificate was issued as a replacement for a previously issued certificate.
                    The original certificate has been marked as superseded.
                  </p>
                </div>
              </div>
            ) : isVerified ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                    <ShieldCheck className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-emerald-900">
                      VERIFIED & VALID
                    </h2>
                    <p className="text-sm text-emerald-700">
                      This certificate is authentic and its cryptographic integrity is confirmed.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">HMAC-SHA256 Integrity Check: PASSED</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    The certificate data matches the tamper-evident digest stored at issuance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                    <ShieldAlert className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-amber-900">
                      INTEGRITY CHECK FAILED
                    </h2>
                    <p className="text-sm text-amber-700">
                      The certificate data does not match its cryptographic signature.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">HMAC-SHA256 Integrity Check: FAILED</p>
                  <p className="mt-1 text-xs text-amber-700">
                    This record may have been tampered with. Contact certificates@agnipankhlabs.com immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Certificate ID */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-navy/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-body">
                Certificate ID
              </p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg font-bold text-navy bg-muted/40 px-4 py-2 rounded-xl border border-navy/10 select-all">
                  {certificate.certificateId}
                </code>
                <CopyButton
                  textToCopy={certificate.certificateId}
                  label="Copy Certificate ID"
                />
              </div>
              <p className="text-xs text-navy/50">
                Format: AL-&#123;TYPE&#125;&#123;YY&#125;-&#123;10 Crockford Base32 chars&#125; - non-sequential, tamper-resistant
              </p>
            </div>
          </div>

          {/* Certificate Credential Card */}
          <Card className="bg-gradient-to-br from-white via-surface to-muted/20 border-2 border-navy/20 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-navy/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center rounded-xl bg-white p-1 ring-1 ring-navy/10">
                  <Image
                    src="/images/logo-full.png"
                    alt="Agnipankh Labs Logo"
                    width={100}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="font-heading text-sm font-bold tracking-tight text-navy">
                  AGNIPANKH LABS
                </span>
              </div>
              <span className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-ink uppercase">
                {certificate.type}
              </span>
            </div>

            <div className="space-y-2 text-center py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-navy/50">
                Official Credential
              </p>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-navy">
                {certificate.recipientName}
              </h3>
              <p className="text-sm text-body">
                for successful completion of
              </p>
              <p className="text-sm font-bold text-brand-ink">
                {certificate.programName}
              </p>
              {certificate.trackName && (
                <p className="text-sm text-body">Track: {certificate.trackName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-navy/10 bg-white/80 p-5 text-sm space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Issue Date</p>
                <p className="font-medium text-navy">
                  {format(new Date(certificate.issueDate), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Authorized Signatory</p>
                <p className="font-medium text-navy">
                  {certificate.signatureAuthority ?? "Director — Agnipankh Labs"}
                </p>
              </div>
              {certificate.cohortStartDate && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Cohort Start</p>
                  <p className="font-medium text-navy">
                    {format(new Date(certificate.cohortStartDate), "MMMM yyyy")}
                  </p>
                </div>
              )}
              {certificate.cohortEndDate && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Cohort End</p>
                  <p className="font-medium text-navy">
                    {format(new Date(certificate.cohortEndDate), "MMMM yyyy")}
                  </p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Retention Classification</p>
                <p className="font-medium text-emerald-800">PERMANENT &mdash; Never purged (Cybersecurity Framework AL-SEC-001)</p>
              </div>
              {certificate.signatureRef && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Signature Reference</p>
                  <p className="font-mono text-sm text-navy">{certificate.signatureRef}</p>
                </div>
              )}
            </div>

            {/* QR Code Section */}
            <div className="border-t border-navy/10 pt-6 space-y-4">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">
                    Verification QR Code
                  </p>
                  <p className="mt-1 text-sm text-body">
                    Scan to open this verification page instantly
                  </p>
                </div>
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white border border-navy/10 p-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(verifyUrl)}`}
                      alt={`QR code for certificate ${certificate.certificateId}`}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-ink text-white shadow-md">
                    <QrCode className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-navy/10 bg-white p-3 text-xs text-navy/70 font-mono break-all text-center sm:text-left">
                {verifyUrl}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink
              href={verifyUrl}
              variant="primary"
              className="gap-2 text-sm py-3 px-6 font-semibold"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Verification URL</span>
            </ButtonLink>
            <ButtonLink
              href={`/api/certificates/${certificate.certificateId}/download`}
              variant="outline"
              className="gap-2 text-sm py-3 px-6 font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>Download Certificate PDF</span>
            </ButtonLink>
          </div>

          {/* Integrity & Security Details */}
          <Section>
            <SectionHeading
              eyebrow="Cryptographic Integrity"
              title="Tamper-Evident Verification"
              description="How this certificate proves its authenticity"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-5 space-y-3 border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                  <h4 className="font-heading font-bold text-sm">HMAC-SHA256 Digest</h4>
                </div>
                <p className="text-xs text-body">
                  A keyed HMAC-SHA256 hash binds the certificate ID, recipient legal name, program,
                  track, cohort dates, and issuance timestamp. Only Agnipankh Labs holds the secret key.
                </p>
                <code className="font-mono text-[10px] bg-muted/40 px-2 py-1 rounded block break-all">
                  {certificate.sha256Hash.slice(0, 48)}&hellip;
                </code>
              </Card>

              <Card className="p-5 space-y-3 border-blue-200">
                <div className="flex items-center gap-2 text-blue-800">
                  <Award className="h-5 w-5" />
                  <h4 className="font-heading font-bold text-sm">Non-Sequential ID</h4>
                </div>
                <p className="text-xs text-body">
                  Certificate IDs use Crockford Base32 (excludes I, L, O, U) with a type prefix and
                  year. Random generation prevents volume enumeration and transcription errors.
                </p>
                <code className="font-mono text-[10px] bg-muted/40 px-2 py-1 rounded block break-all">
                  {certificate.certificateId}
                </code>
              </Card>

              <Card className="p-5 space-y-3 border-purple-200">
                <div className="flex items-center gap-2 text-purple-800">
                  <Calendar className="h-5 w-5" />
                  <h4 className="font-heading font-bold text-sm">Permanent Retention</h4>
                </div>
                <p className="text-xs text-body">
                  Certificates are classified as PERMANENT retention per AL-SEC-001. They are never
                  purged and the integrity hash remains verifiable indefinitely.
                </p>
                <p className="text-xs text-navy/60">Retention Class: PERMANENT</p>
              </Card>
            </div>
          </Section>

          {/* Verification Instructions */}
          <Section>
            <SectionHeading
              eyebrow="For Employers & Verifiers"
              title="How to Verify"
              description="Steps to confirm this credential is genuine"
            />
            <div className="space-y-3">
              <div className="flex gap-3 rounded-xl border border-navy/10 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-ink/10 text-brand-ink font-bold text-sm">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-navy">Match the Certificate ID</p>
                  <p className="text-xs text-body">
                    Confirm the ID on the candidate&apos;s certificate matches <code className="font-mono bg-muted/40 px-1.5 py-0.5 rounded">{certificate.certificateId}</code>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-navy/10 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-ink/10 text-brand-ink font-bold text-sm">
                  2
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-navy">Scan the QR Code</p>
                  <p className="text-xs text-body">
                    Use any smartphone camera to scan the QR code on the certificate &mdash; it opens this exact verification page.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-navy/10 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-ink/10 text-brand-ink font-bold text-sm">
                  3
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-navy">Confirm the Status Badge</p>
                  <p className="text-xs text-body">
                    A green <span className="font-semibold text-emerald-700">VERIFIED & VALID</span> badge confirms cryptographic integrity.
                    A red <span className="font-semibold text-red-700">REVOKED</span> badge means the credential is invalid.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-navy/10 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-ink/10 text-brand-ink font-bold text-sm">
                  4
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-navy">Verify Recipient Details</p>
                  <p className="text-xs text-body">
                    Cross-reference the recipient name, program, and dates with the candidate&apos;s claims.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-xs text-amber-900 space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Important Notice
            </p>
            <p>
              This verification portal confirms the cryptographic integrity of the certificate record
              held by Agnipankh Labs. It does not constitute an employment guarantee, job offer, or
              warranty of any professional outcome. Agnipankh Labs programs are structured training
              and not employment. For official transcript requests, contact certificates@agnipankhlabs.com.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center pt-8 border-t border-navy/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Back to Agnipankh Labs</span>
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
            >
              <Award className="h-4 w-4" />
              <span>Verify Another Certificate</span>
            </Link>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy/10 bg-navy text-surface/90">
        <Container className="py-6 text-center">
          <p className="text-xs text-surface/60">
            &copy; {new Date().getFullYear()} Agnipankh Labs. All rights reserved.
          </p>
          <p className="mt-1 text-[11px] text-surface/50">
            Certificate Verification Registry &mdash; HMAC-SHA256 Secured
          </p>
        </Container>
      </footer>
    </div>
  );
}