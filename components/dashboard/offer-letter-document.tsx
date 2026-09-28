"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileCheck,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";
import type { OfferLetterData } from "@/lib/offer-letter";
import {
  AGREEMENT_CLAUSES,
  AGREEMENT_TERMS_VERSION,
  buildOfferLetterDocument,
} from "@/lib/offer-letter-content";
import { acceptAgreementAction } from "@/app/actions/application";
import { Button } from "@/components/ui/button";

interface OfferLetterDocumentProps {
  data: OfferLetterData;
  isAdminPreview?: boolean;
  adminReturnHref?: string;
  studentReturnHref?: string;
}

export function OfferLetterDocument({
  data,
  isAdminPreview = false,
  adminReturnHref = "/admin/applications",
  studentReturnHref = "/dashboard",
}: OfferLetterDocumentProps) {
  const doc = buildOfferLetterDocument(data);
  const [isPending, startTransition] = useTransition();

  // Signature state
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedConfidentiality, setAgreedConfidentiality] = useState(false);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExecutedLocally, setIsExecutedLocally] = useState(
    Boolean(data.agreementAcceptedAt || data.stage === "JOINING_CONFIRMATION")
  );

  const isExecuted = isExecutedLocally || Boolean(data.agreementAcceptedAt);
  const canSign =
    agreedTerms &&
    agreedConfidentiality &&
    agreedDisclaimer &&
    typedSignature.trim().length >= 3;

  function handleSign() {
    setErrorMessage(null);
    if (!canSign) {
      setErrorMessage(
        "Please accept all three mandatory clauses and enter your full name as digital signature."
      );
      return;
    }

    startTransition(async () => {
      const res = await acceptAgreementAction(data.applicationId);
      if (res.success) {
        setIsExecutedLocally(true);
        setSuccessMessage(
          res.message ??
            "Offer agreement successfully executed! Welcome to Agnipankh Labs."
        );
      } else {
        setErrorMessage(
          res.message ?? "Failed to execute agreement. Please try again."
        );
      }
    });
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Action Bar — Hidden when printing */}
      <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={isAdminPreview ? adminReturnHref : studentReturnHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 px-3 py-1.5 text-xs font-medium text-navy hover:bg-muted/40 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {isAdminPreview ? "Back to Applications Desk" : "Back to Dashboard"}
            </span>
          </Link>
          <span className="text-xs text-body">
            Ref: <strong className="text-navy">{doc.refNumber}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {isExecuted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>Agreement Executed</span>
            </span>
          ) : data.isDraftPreview ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
              <Clock className="h-3.5 w-3.5 text-purple-700" />
              <span>Draft Preview</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 animate-pulse">
              <Clock className="h-3.5 w-3.5 text-amber-700" />
              <span>Pending Digital Signature</span>
            </span>
          )}

          {/* Print button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </div>

      {/* Admin Review Banner */}
      {isAdminPreview && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-900 print:hidden flex items-start gap-3">
          <FileText className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Administrator Document Preview</p>
            <p>
              You are inspecting the formal document view for candidate{" "}
              <strong>{data.candidateName}</strong> ({data.candidateEmail}). This
              mirrors the exact legal document, clauses, and digital signature
              form presented to the student.
            </p>
          </div>
        </div>
      )}

      {/* Status alerts */}
      {successMessage && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center justify-between print:hidden"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center justify-between print:hidden"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-950 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE FORMAL OFFER LETTER DOCUMENT (Crisp Institutional Sheet)              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-navy/15 bg-white p-8 shadow-md sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-navy/15 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-xs">
                <Building2 className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight text-navy sm:text-2xl">
                  AGNIPANKH LABS
                </h1>
                <p className="text-[11px] font-medium tracking-wide uppercase text-brand-ink">
                  Innovation, Research & Industry Training Division
                </p>
              </div>
            </div>
            <p className="text-[11px] text-body max-w-sm pt-1">
              Empowering innovators through structured project execution,
              industry mentorship, and verifiable digital credentials.
            </p>
          </div>

          <div className="space-y-1 sm:text-right text-xs">
            <p className="font-semibold text-navy">
              Reference: <span className="font-mono">{doc.refNumber}</span>
            </p>
            <p className="text-body">
              Date of Issuance:{" "}
              <strong className="text-navy">{doc.issuedDate}</strong>
            </p>
            <p className="text-body text-[11px]">
              Document Code: AL-OFFER-{AGREEMENT_TERMS_VERSION}
            </p>
          </div>
        </div>

        {/* Candidate Recipient Details */}
        <div className="rounded-2xl border border-navy/10 bg-muted/20 p-5 space-y-1.5 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50">
            Issued To
          </p>
          <p className="text-base font-bold text-navy">{data.candidateName}</p>
          {data.college && (
            <p className="text-body">
              Institution: <span className="font-medium text-navy">{data.college}</span>
            </p>
          )}
          {(data.degree || data.branch) && (
            <p className="text-body">
              Program / Branch:{" "}
              <span className="font-medium text-navy">
                {[data.degree, data.branch].filter(Boolean).join(" · ")}
              </span>
            </p>
          )}
          <p className="text-body">
            Email: <span className="font-medium text-navy">{data.candidateEmail}</span>
          </p>
        </div>

        {/* Subject Heading */}
        <div className="border-l-4 border-brand-ink pl-4 py-1">
          <h2 className="font-heading text-sm sm:text-base font-bold text-navy uppercase tracking-wide">
            Subject: Official Offer of Internship Engagement —{" "}
            <span className="text-brand-ink">{data.internshipTitle}</span>
          </h2>
          <p className="text-xs text-body mt-0.5">
            Role: <strong>{data.roleTitle}</strong> · Track: {doc.roleDetails.find(r => r.label === "Domain Track")?.value}
          </p>
        </div>

        {/* Formal Opening & Salutation */}
        <div className="space-y-4 text-xs sm:text-sm text-body leading-relaxed">
          <p className="font-semibold text-navy">{doc.salutation}</p>
          {doc.bodyParagraphs.map((para, i) => (
            <p
              key={i}
              dangerouslySetInnerHTML={{ __html: para }}
              className="leading-relaxed"
            />
          ))}
        </div>

        {/* Engagement Parameters Table */}
        <div className="space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-navy">
            Summary of Internship Engagement Parameters
          </h3>
          <div className="overflow-hidden rounded-2xl border border-navy/15">
            <table className="w-full text-left text-xs">
              <tbody>
                {doc.roleDetails.map((item, idx) => (
                  <tr
                    key={item.label}
                    className={`border-b border-navy/10 last:border-none ${
                      idx % 2 === 0 ? "bg-white" : "bg-muted/30"
                    }`}
                  >
                    <td className="w-1/3 px-4 py-2.5 font-semibold text-navy">
                      {item.label}
                    </td>
                    <td className="px-4 py-2.5 text-body font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Disclosure Callout */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Statutory Training Disclosure & No-Placement Declaration</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            This internship engagement is a project-based learning and practical
            training initiative. Agnipankh Labs does not offer or promise guaranteed
            placements, employment, or job appointments upon completion. Successful
            interns receive a verifiable digital certificate based solely on merit,
            capstone submission, and active participation.
          </p>
        </div>

        {/* Signatory Block */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-navy/10">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-navy">
              Sincerely,
            </p>
            <div className="pt-2">
              <div className="inline-block rounded-lg border border-navy/20 bg-muted/20 px-4 py-2 text-center">
                <span className="font-serif italic font-semibold text-navy text-sm">
                  {doc.signatory}
                </span>
                <p className="text-[10px] text-body uppercase tracking-wider">
                  Authorized Signatory · Agnipankh Labs
                </p>
              </div>
            </div>
            <p className="text-xs text-body">{doc.orgLine}</p>
          </div>

          <div className="text-right text-[11px] text-body sm:max-w-xs">
            <p>
              Electronically generated by the Agnipankh Labs Admissions & Operations
              Desk. Valid without physical ink seal when verified on portal.
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ANNEXURE A: INTERNSHIP TRAINING & CONFIDENTIALITY AGREEMENT           */}
        {/* ===================================================================== */}
        <div className="pt-8 border-t-2 border-navy/15 space-y-6">
          <div className="space-y-1">
            <span className="rounded-md bg-navy/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
              Annexure A
            </span>
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
              Internship Training Agreement & Confidentiality Terms
            </h2>
            <p className="text-xs text-body">
              Terms Version: <strong className="text-navy">{AGREEMENT_TERMS_VERSION}</strong> · Governing Law: Republic of India
            </p>
          </div>

          <div className="space-y-4">
            {AGREEMENT_CLAUSES.map((clause, index) => (
              <div
                key={clause.id}
                className="rounded-xl border border-navy/10 bg-white p-4 space-y-1 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy/10 text-[10px] font-bold text-navy">
                    {index + 1}
                  </span>
                  <h4 className="font-heading font-bold text-navy">
                    {clause.heading}
                  </h4>
                </div>
                <p className="text-body leading-relaxed pl-7 text-[11px] sm:text-xs">
                  {clause.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* EXECUTION & ACCEPTANCE SECTION                                        */}
        {/* ===================================================================== */}
        <div className="pt-6 border-t-2 border-navy/15 space-y-6">
          <h3 className="font-heading text-sm sm:text-base font-bold text-navy">
            Execution & Digital Acceptance
          </h3>

          {/* Already Executed Stamp */}
          {isExecuted ? (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-emerald-950">
                    Digitally Executed & Confirmed
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Binding Internship Agreement legally confirmed under Indian
                    Information Technology Act, 2000.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-white/80 p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-900/60">
                    Signatory Intern
                  </span>
                  <p className="font-bold text-navy">{data.candidateName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-900/60">
                    Registered Email
                  </span>
                  <p className="font-medium text-navy">{data.candidateEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-900/60">
                    Execution Date
                  </span>
                  <p className="font-medium text-navy">
                    {data.agreementAcceptedAt
                      ? new Date(data.agreementAcceptedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Verified upon admission"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-900/60">
                    Terms Version
                  </span>
                  <p className="font-mono font-bold text-emerald-900">
                    {data.termsVersion ?? AGREEMENT_TERMS_VERSION}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Onboarding active. You are enrolled in the cohort. Look out for
                  session invitations and curriculum materials.
                </span>
              </div>
            </div>
          ) : isAdminPreview ? (
            /* Admin view when not yet executed */
            <div className="rounded-2xl border border-navy/10 bg-muted/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                <Clock className="h-4 w-4 text-brand-ink" />
                <span>Candidate Signature Pending</span>
              </div>
              <p className="text-xs text-body leading-relaxed">
                Candidate <strong>{data.candidateName}</strong> has been issued
                this offer letter and must accept the terms on their learner
                dashboard to advance to <em>Stage 5: Joining Confirmation</em>.
              </p>
            </div>
          ) : (
            /* Student Interactive Acceptance Form */
            <div className="rounded-2xl border border-navy/15 bg-muted/10 p-6 sm:p-8 space-y-6 print:hidden">
              <div className="space-y-1">
                <h4 className="font-heading text-sm sm:text-base font-bold text-navy">
                  Digital Acceptance Checklist
                </h4>
                <p className="text-xs text-body">
                  Please review and check each clause below to confirm your
                  acceptance of the offer and agreement.
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-3.5 text-xs text-navy cursor-pointer hover:bg-muted/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="leading-relaxed">
                    I have read, understood, and agree to the <strong>Offer Letter Terms</strong> and the <strong>Internship Training Agreement ({AGREEMENT_TERMS_VERSION})</strong>.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-3.5 text-xs text-navy cursor-pointer hover:bg-muted/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedConfidentiality}
                    onChange={(e) => setAgreedConfidentiality(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="leading-relaxed">
                    I agree to the strict <strong>Confidentiality & Intellectual Property</strong> clause. I will not disclose internal repositories, mentor feedback, or company materials.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-3.5 text-xs text-navy cursor-pointer hover:bg-muted/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedDisclaimer}
                    onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="leading-relaxed">
                    I acknowledge that this is a <strong>practical skill-training program</strong> and that completion does not guarantee employment or placement (statutory disclaimer).
                  </span>
                </label>
              </div>

              {/* Typed digital signature input */}
              <div className="space-y-2 pt-2">
                <label
                  htmlFor="typedSignature"
                  className="block text-xs font-semibold text-navy"
                >
                  Digital Signature (Type your full legal name to sign)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="typedSignature"
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder={`e.g. ${data.candidateName}`}
                    className="flex-1 rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-xs font-medium text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!canSign || isPending}
                    onClick={handleSign}
                    className="gap-2 shrink-0 py-2.5 px-6 font-semibold"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileCheck className="h-4 w-4" />
                    )}
                    <span>Execute Agreement & Confirm Joining</span>
                  </Button>
                </div>
                <p className="text-[11px] text-body">
                  By clicking Execute, you electronically execute this agreement with
                  timestamp and email verification pursuant to the Information
                  Technology Act, 2000.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
