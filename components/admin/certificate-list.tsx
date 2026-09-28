"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Ban,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Download,
} from "lucide-react";
import type { AdminCertificateRecord } from "@/lib/admin-certificates";
import { revokeCertificateAction, supersedeCertificateAction } from "@/app/actions/admin-certificates";
import { Button } from "@/components/ui/button";

const TYPE_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  INTERNSHIP: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200" },
  COURSE: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200" },
  EXCELLENCE: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200" },
  RECOGNITION: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200" },
  LEADERSHIP: { bg: "bg-teal-50", text: "text-teal-800", ring: "ring-teal-200" },
  CITATION: { bg: "bg-indigo-50", text: "text-indigo-800", ring: "ring-indigo-200" },
};

export function AdminCertificateList({
  certificates,
}: {
  certificates: AdminCertificateRecord[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingCert, setRevokingCert] = useState<AdminCertificateRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [supersedingCert, setSupersedingCert] = useState<AdminCertificateRecord | null>(null);
  const [supersessionNewCertId, setSupersessionNewCertId] = useState("");
  const [supersessionReason, setSupersessionReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleCopy(id: string) {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function handleRevoke() {
    if (!revokingCert) return;
    if (!revocationReason.trim()) {
      alert("Please provide an audit reason for revoking this credential.");
      return;
    }

    startTransition(async () => {
      const res = await revokeCertificateAction(
        revokingCert.certificateId,
        revocationReason.trim()
      );
      if (res.success) {
        setToastMessage(res.message ?? "Certificate revoked.");
        setRevokingCert(null);
        setRevocationReason("");
      } else {
        alert(res.message ?? "Failed to revoke certificate.");
      }
    });
  }

  function handleSupersede() {
    if (!supersedingCert || !supersessionNewCertId.trim() || !supersessionReason.trim()) {
      alert("Please select a replacement certificate and provide a reason.");
      return;
    }

    startTransition(async () => {
      const res = await supersedeCertificateAction(
        supersedingCert.certificateId,
        supersessionNewCertId.trim(),
        supersessionReason.trim()
      );
      if (res.success) {
        setToastMessage(res.message ?? "Certificate superseded.");
        setSupersedingCert(null);
        setSupersessionNewCertId("");
        setSupersessionReason("");
      } else {
        alert(res.message ?? "Failed to supersede certificate.");
      }
    });
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">
          No Certificates Found
        </h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No certificates match the selected filters. Use the &quot;Issue Certificate&quot;
          button to mint your first credential.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/certificates/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Issue New Certificate</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {certificates.map((c) => {
          const typeStyle = TYPE_COLOR_MAP[c.type] ?? {
            bg: "bg-navy/5",
            text: "text-navy",
            ring: "ring-navy/10",
          };

          const isRevoked = Boolean(c.revokedAt);
  const isSuperseded = Boolean(c.supersededById);
  const isSupersession = Boolean(c.supersedesId);

          return (
            <div
              key={c.certificateId}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-md ${
                isRevoked ? "border-red-200 bg-red-50/10" : "border-navy/10"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Certificate Details */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${typeStyle.bg} ${typeStyle.text} ${typeStyle.ring}`}
                    >
                      {c.type}
                    </span>

                    {/* Verification / Tamper status */}
                    {c.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        <span>HMAC-SHA256 Match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-inset ring-red-200">
                        <ShieldAlert className="h-3 w-3 text-red-600" />
                        <span>Hash Mismatch</span>
                      </span>
                    )}

                    {isRevoked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-inset ring-red-200">
                        <Ban className="h-3 w-3 text-red-600" />
                        <span>Revoked</span>
                      </span>
                    )}

                    {isSuperseded && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        <span>Superseded</span>
                      </span>
                    )}

                    {isSupersession && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800 ring-1 ring-inset ring-purple-200">
                        <ShieldCheck className="h-3 w-3 text-purple-600" />
                        <span>Replacement</span>
                      </span>
                    )}
                  </div>

                  {/* ID row with copy button */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-navy">
                      {c.certificateId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.certificateId)}
                      title="Copy Certificate ID"
                      className="rounded-md p-1 text-navy/40 hover:bg-muted/40 hover:text-navy transition-colors"
                    >
                      {copiedId === c.certificateId ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Recipient info */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-navy">
                      {c.recipientName}
                    </h3>
                    <p className="text-xs text-body">
                      Recipient Email: <span className="font-medium text-navy">{c.recipientEmail}</span>
                    </p>
                  </div>

                  {/* Program & Track */}
                  <div className="text-xs text-navy/80">
                    <p className="font-semibold text-navy">
                      {c.programName}
                      {c.trackName && (
                        <span className="font-normal text-body"> · {c.trackName}</span>
                      )}
                    </p>
                  </div>

                  {/* Dates metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-navy/60 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-navy/40" />
                      <span>
                        Issued:{" "}
                        <strong className="text-navy">
                          {new Date(c.issueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>

                    {(c.cohortStartDate || c.cohortEndDate) && (
                      <div>
                        Cohort:{" "}
                        <span className="font-medium text-navy">
                          {[
                            c.cohortStartDate
                              ? new Date(c.cohortStartDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : null,
                            c.cohortEndDate
                              ? new Date(c.cohortEndDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" – ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Revocation notice if revoked */}
                  {isRevoked && c.revokedReason && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 space-y-0.5">
                      <p className="font-semibold">Revocation Notice</p>
                      <p className="text-[11px] leading-relaxed">
                        Reason: {c.revokedReason} (Revoked on{" "}
                        {c.revokedAt ? new Date(c.revokedAt).toLocaleDateString("en-IN") : "—"}
                        )
                      </p>
                    </div>
                  )}

                  {/* Supersession notice if superseded */}
                  {isSuperseded && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-0.5">
                      <p className="font-semibold">Superseded</p>
                      <p className="text-[11px] leading-relaxed">
                        This certificate has been superseded by a replacement credential.
                      </p>
                    </div>
                  )}

                  {/* Replacement notice if this is a superseding certificate */}
                  {isSupersession && (
                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900 space-y-0.5">
                      <p className="font-semibold">Replacement Certificate</p>
                      <p className="text-[11px] leading-relaxed">
                        This certificate replaces a previously issued credential.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 border-t border-navy/5 pt-3 sm:border-none sm:pt-0">
                  <Link
                    href={`/verify/${c.certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 hover:border-navy/30 transition-colors shadow-2xs"
                  >
                    <span>Public Verify Page</span>
                    <ExternalLink className="h-3 w-3 text-navy/50" />
                  </Link>

                  <Link
                    href={`/api/certificates/${c.certificateId}/download`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 hover:border-navy/30 transition-colors shadow-2xs"
                  >
                    <Download className="h-3 w-3 text-navy/50" />
                    <span>Download PDF</span>
                  </Link>

                  {!isRevoked && !isSuperseded && (
                    <button
                      type="button"
                      onClick={() => {
                        setSupersedingCert(c);
                        setSupersessionNewCertId("");
                        setSupersessionReason("");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Supersede</span>
                    </button>
                  )}

                  {!isRevoked && !isSuperseded && !isSupersession && (
                    <button
                      type="button"
                      onClick={() => {
                        setRevokingCert(c);
                        setRevocationReason("");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revocation Modal */}
      {revokingCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-navy/15 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-navy">
                  Revoke Certificate
                </h4>
                <p className="text-xs text-body font-mono">
                  {revokingCert.certificateId}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-body">
              <p>
                Are you sure you want to revoke the credential issued to{" "}
                <strong className="text-navy">{revokingCert.recipientName}</strong>?
                The public verify page will permanently mark this credential as
                REVOKED with the audit reason below.
              </p>

              <div className="space-y-1">
                <label
                  htmlFor="revocationReason"
                  className="block font-semibold text-navy"
                >
                  Audit Reason for Revocation <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="revocationReason"
                  rows={3}
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="e.g. Identity discrepancy, issued in error, or ethical violation."
                  className="w-full rounded-xl border border-navy/20 p-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-navy/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setRevokingCert(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={isPending || !revocationReason.trim()}
                onClick={handleRevoke}
                className="gap-1.5 bg-red-700 hover:bg-red-800"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                <span>Confirm Revocation</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Supersession Modal */}
      {supersedingCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-navy/15 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-navy">
                  Supersede Certificate
                </h4>
                <p className="text-xs text-body font-mono">
                  {supersedingCert.certificateId}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-body">
              <p>
                Create a replacement certificate for the credential issued to{" "}
                <strong className="text-navy">{supersedingCert.recipientName}</strong>?
                The original certificate will be marked as superseded and linked to the new one.
              </p>

              <div className="space-y-1">
                <label
                  htmlFor="supersessionNewCertId"
                  className="block font-semibold text-navy"
                >
                  Replacement Certificate ID <span className="text-red-600">*</span>
                </label>
                <select
                  id="supersessionNewCertId"
                  value={supersessionNewCertId}
                  onChange={(e) => setSupersessionNewCertId(e.target.value)}
                  className="w-full rounded-xl border border-navy/20 p-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                >
                  <option value="">Select a replacement certificate...</option>
                  {certificates
                    .filter(
                      (cert) =>
                        cert.certificateId !== supersedingCert.certificateId &&
                        !cert.revokedAt &&
                        !cert.supersededById &&
                        !cert.supersedesId
                      )
                    .map((cert) => (
                      <option key={cert.certificateId} value={cert.certificateId}>
                        {cert.certificateId} — {cert.recipientName} ({cert.programName})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="supersessionReason"
                  className="block font-semibold text-navy"
                >
                  Supersession Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="supersessionReason"
                  rows={3}
                  value={supersessionReason}
                  onChange={(e) => setSupersessionReason(e.target.value)}
                  placeholder="e.g. Corrected legal name, updated program details, or re-issuance after error."
                  className="w-full rounded-xl border border-navy/20 p-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-navy/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setSupersedingCert(null);
                  setSupersessionNewCertId("");
                  setSupersessionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={isPending || !supersessionNewCertId.trim() || !supersessionReason.trim()}
                onClick={handleSupersede}
                className="gap-1.5 bg-purple-700 hover:bg-purple-800"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                <span>Confirm Supersession</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
