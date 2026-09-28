"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
  Building2,
  ExternalLink,
} from "lucide-react";
import {
  issueCertificateAction,
  type CertificateActionResult,
} from "@/app/actions/admin-certificates";
import { Button } from "@/components/ui/button";

interface CertificateIssueFormProps {
  initialValues?: {
    userId?: string;
    recipientEmail?: string;
    verifiedFullLegalName?: string;
    type?: string;
    programName?: string;
    trackName?: string;
    cohortStartDate?: string;
    cohortEndDate?: string;
  };
}

export function CertificateIssueForm({
  initialValues,
}: CertificateIssueFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [userId, setUserId] = useState(initialValues?.userId ?? "usr-student-01");
  const [recipientEmail, setRecipientEmail] = useState(
    initialValues?.recipientEmail ?? ""
  );
  const [fullName, setFullName] = useState(
    initialValues?.verifiedFullLegalName ?? ""
  );
  const [type, setType] = useState(initialValues?.type ?? "INTERNSHIP");
  const [programName, setProgramName] = useState(
    initialValues?.programName ?? "Full-Stack Web Development Track"
  );
  const [trackName, setTrackName] = useState(
    initialValues?.trackName ?? "Web Development"
  );
  const [cohortStartDate, setCohortStartDate] = useState(
    initialValues?.cohortStartDate ?? ""
  );
  const [cohortEndDate, setCohortEndDate] = useState(
    initialValues?.cohortEndDate ?? ""
  );
  const [signatureAuthority, setSignatureAuthority] = useState(
    "Director — Agnipankh Labs"
  );
  const [signatureRef, setSignatureRef] = useState(
    `SIG-AL-${new Date().getFullYear()}`
  );

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("recipientEmail", recipientEmail);
    formData.set("verifiedFullLegalName", fullName);
    formData.set("type", type);
    formData.set("programName", programName);
    formData.set("trackName", trackName);
    formData.set("cohortStartDate", cohortStartDate);
    formData.set("cohortEndDate", cohortEndDate);
    formData.set("signatureAuthority", signatureAuthority);
    formData.set("signatureRef", signatureRef);

    startTransition(async () => {
      const res: CertificateActionResult = await issueCertificateAction(
        null,
        formData
      );

      if (res.success && res.certificateId) {
        setIssuedId(res.certificateId);
      } else {
        if (res.fieldErrors) {
          setFormErrors(res.fieldErrors);
        }
        setGeneralError(res.message ?? "Failed to issue certificate.");
      }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Certificate Desk</span>
        </Link>

        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
        >
          <span>Select from Completed Cohort</span>
        </Link>
      </div>

      {/* Success banner if issued */}
      {issuedId && (
        <div
          role="alert"
          className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-6 sm:p-8 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-emerald-950">
                Certificate Minted Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Cryptographic credential issued with tamper-evident HMAC-SHA256 signature.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-body">Issued Certificate ID:</span>
              <span className="font-mono text-sm font-bold text-navy">
                {issuedId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body">Recipient:</span>
              <span className="font-bold text-navy">{fullName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/verify/${issuedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <span>View Public Verification Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => router.push("/admin/certificates")}
              className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              Return to Certificate Desk
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {generalError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Issuance Form (7 cols) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 space-y-6 rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs"
        >
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
              Mint Official Credential
            </h2>
            <p className="text-xs text-body mt-0.5">
              Enter the student&apos;s verified legal credentials. All inputs are hashed into the permanent cryptographic digest.
            </p>
          </div>

          <div className="space-y-4">
            {/* Recipient Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-navy"
              >
                Verified Full Legal Name <span className="text-red-600">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sayali Sandip Kale"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                  formErrors.verifiedFullLegalName
                    ? "border-red-500 bg-red-50/20"
                    : "border-navy/15 bg-white"
                }`}
              />
              {formErrors.verifiedFullLegalName && (
                <p className="text-[11px] text-red-600">
                  {formErrors.verifiedFullLegalName[0]}
                </p>
              )}
            </div>

            {/* Recipient Email & User ID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="recipientEmail"
                  className="block text-xs font-semibold text-navy"
                >
                  Recipient Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="student@example.com"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.recipientEmail
                      ? "border-red-500 bg-red-50/20"
                      : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.recipientEmail && (
                  <p className="text-[11px] text-red-600">
                    {formErrors.recipientEmail[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="userId"
                  className="block text-xs font-semibold text-navy"
                >
                  Recipient User ID <span className="text-red-600">*</span>
                </label>
                <input
                  id="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="usr-student-01"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-mono text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>
            </div>

            {/* Certificate Type */}
            <div className="space-y-1.5">
              <label
                htmlFor="type"
                className="block text-xs font-semibold text-navy"
              >
                Credential Type <span className="text-red-600">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              >
                <option value="INTERNSHIP">Internship Certificate (AL-IN...)</option>
                <option value="COURSE">Course Certificate (AL-CO...)</option>
                <option value="EXCELLENCE">Certificate of Excellence (AL-EX...)</option>
                <option value="RECOGNITION">Certificate of Recognition (AL-RE...)</option>
                <option value="LEADERSHIP">Leadership Award (AL-LE...)</option>
                <option value="CITATION">Honorary Citation (AL-CI...)</option>
              </select>
            </div>

            {/* Program Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="programName"
                className="block text-xs font-semibold text-navy"
              >
                Program Title <span className="text-red-600">*</span>
              </label>
              <input
                id="programName"
                type="text"
                required
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g. Full-Stack Web Development Track"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                  formErrors.programName
                    ? "border-red-500 bg-red-50/20"
                    : "border-navy/15 bg-white"
                }`}
              />
              {formErrors.programName && (
                <p className="text-[11px] text-red-600">
                  {formErrors.programName[0]}
                </p>
              )}
            </div>

            {/* Track Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="trackName"
                className="block text-xs font-semibold text-navy"
              >
                Track Specialization
              </label>
              <input
                id="trackName"
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="e.g. Full-Stack JavaScript & Next.js"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>

            {/* Cohort Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="cohortStartDate"
                  className="block text-xs font-semibold text-navy"
                >
                  Cohort Start Date
                </label>
                <input
                  id="cohortStartDate"
                  type="date"
                  value={cohortStartDate}
                  onChange={(e) => setCohortStartDate(e.target.value)}
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cohortEndDate"
                  className="block text-xs font-semibold text-navy"
                >
                  Cohort End Date
                </label>
                <input
                  id="cohortEndDate"
                  type="date"
                  value={cohortEndDate}
                  onChange={(e) => setCohortEndDate(e.target.value)}
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>
            </div>

            {/* Signatory Authority */}
            <div className="space-y-1.5">
              <label
                htmlFor="signatureAuthority"
                className="block text-xs font-semibold text-navy"
              >
                Authorized Signatory <span className="text-red-600">*</span>
              </label>
              <input
                id="signatureAuthority"
                type="text"
                required
                value={signatureAuthority}
                onChange={(e) => setSignatureAuthority(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy/10">
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || Boolean(issuedId)}
              className="gap-2 text-xs py-2.5 px-6 font-semibold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              <span>Mint & Issue Certificate</span>
            </Button>
          </div>
        </form>

        {/* Right: Live Preview & Integrity Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Certificate Credential Card Preview */}
          <div className="rounded-3xl border-2 border-navy/20 bg-gradient-to-br from-white via-surface to-muted/20 p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-navy/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
                  <Building2 className="h-4 w-4 text-brand" />
                </div>
                <span className="font-heading text-xs font-bold tracking-tight text-navy">
                  AGNIPANKH LABS
                </span>
              </div>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand-ink uppercase">
                {type}
              </span>
            </div>

            <div className="space-y-1 text-center py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                Official Credential
              </p>
              <h4 className="font-heading text-lg font-bold text-navy">
                {fullName || "Candidate Legal Name"}
              </h4>
              <p className="text-xs text-body pt-1">
                for successful completion of
              </p>
              <p className="text-xs font-bold text-brand-ink">
                {programName || "Program Name"}
              </p>
              {trackName && (
                <p className="text-[11px] text-body">Track: {trackName}</p>
              )}
            </div>

            <div className="rounded-2xl border border-navy/10 bg-white/80 p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-body">Projected ID:</span>
                <span className="font-mono font-bold text-navy">
                  AL-{type.slice(0, 2)}26-XXXXXXXXXX
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">Signatory:</span>
                <span className="font-medium text-navy">{signatureAuthority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">Retention:</span>
                <span className="font-medium text-emerald-800">PERMANENT</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-900 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                HMAC-SHA256 digest keyed with server secret will be computed on mint.
              </span>
            </div>
          </div>

          {/* Frozen Architecture Card */}
          <div className="rounded-3xl border border-navy/10 bg-white p-5 text-xs text-body space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-navy">
              <Lock className="h-3.5 w-3.5 text-brand-ink" />
              <span>Frozen Cryptographic Contract</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Certificate IDs are non-sequential Crockford Base32 strings ensuring
              no volume enumeration. The canonical hash digest combines the ID,
              legal name, program, dates, and timestamp under AL-SEC-001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
