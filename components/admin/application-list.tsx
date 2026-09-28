"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  Globe,
  AlertCircle,
  Loader2,
  GitBranch,
  Share2,
  FileText,
  Award,
} from "lucide-react";
import { type AdminApplicationRecord } from "@/lib/admin-applications";
import { type ApplicationStageKey, STAGE_CONFIG } from "@/lib/applications";
import {
  advanceApplicationStageAction,
  rejectApplicationAction,
} from "@/app/actions/admin-applications";
import { Button } from "@/components/ui/button";

// Map each stage to the next actionable stage(s) that admin can trigger
const NEXT_STAGE_MAP: Record<
  ApplicationStageKey,
  { stage: ApplicationStageKey; label: string; color: string }[]
> = {
  APPLICATION_RECEIVED: [
    {
      stage: "ELIGIBILITY_CHECK",
      label: "Mark Eligibility Verified",
      color: "amber",
    },
  ],
  ELIGIBILITY_CHECK: [
    {
      stage: "SELECTION_DECISION",
      label: "Mark Shortlisted / Selected",
      color: "purple",
    },
  ],
  SELECTION_DECISION: [
    {
      stage: "OFFER_LETTER_ISSUED",
      label: "Issue Offer Letter",
      color: "emerald",
    },
  ],
  OFFER_LETTER_ISSUED: [],
  JOINING_CONFIRMATION: [],
  WITHDRAWN: [],
  REJECTED: [],
};

const STAGE_COLOR_MAP: Record<
  ApplicationStageKey,
  { bg: string; text: string; ring: string }
> = {
  APPLICATION_RECEIVED: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    ring: "ring-blue-200",
  },
  ELIGIBILITY_CHECK: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    ring: "ring-amber-200",
  },
  SELECTION_DECISION: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    ring: "ring-purple-200",
  },
  OFFER_LETTER_ISSUED: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
  },
  JOINING_CONFIRMATION: {
    bg: "bg-emerald-200",
    text: "text-emerald-900",
    ring: "ring-emerald-300",
  },
  WITHDRAWN: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    ring: "ring-gray-200",
  },
  REJECTED: {
    bg: "bg-red-100",
    text: "text-red-800",
    ring: "ring-red-200",
  },
};

function ApplicationCard({
  app,
  onUpdate,
}: {
  app: AdminApplicationRecord;
  onUpdate: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const nextStages = NEXT_STAGE_MAP[app.stage] ?? [];
  const isTerminal =
    app.stage === "WITHDRAWN" ||
    app.stage === "REJECTED" ||
    app.stage === "JOINING_CONFIRMATION";
  const stageColors = STAGE_COLOR_MAP[app.stage];

  function handleAdvance(targetStage: ApplicationStageKey) {
    startTransition(async () => {
      const res = await advanceApplicationStageAction(app.id, targetStage);
      if (res.success) {
        onUpdate(res.message ?? "Stage updated.");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectApplicationAction(
        app.id,
        rejectReason.trim() ||
          "Did not meet the cohort selection criteria for this cycle."
      );
      if (res.success) {
        setRejectMode(false);
        onUpdate(res.message ?? "Application rejected.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white shadow-xs overflow-hidden">
      {/* Card Header Row */}
      <div
        className="flex flex-col gap-3 p-5 cursor-pointer sm:flex-row sm:items-start sm:justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Left: identity */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand-hover/10 font-heading text-base font-bold text-brand-ink">
            {(app.userName ?? app.userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-[15px] font-bold text-navy truncate max-w-[200px] sm:max-w-none">
                {app.userName ?? "—"}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${stageColors.bg} ${stageColors.text} ${stageColors.ring}`}
              >
                {STAGE_CONFIG[app.stage]?.shortTitle ?? app.stage}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-body truncate">{app.userEmail}</p>
            <p className="mt-0.5 text-[11px] font-medium text-brand-ink truncate">
              {app.internshipTitle} · {app.roleTitle}
            </p>
          </div>
        </div>

        {/* Right: meta + expand arrow */}
        <div className="flex items-center gap-3 sm:shrink-0">
          <span className="text-xs text-body whitespace-nowrap">
            {new Date(app.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-navy/50 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="border-t border-navy/5 bg-muted/20 p-5 space-y-6">
          {/* Academic snapshot */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/50">
                College
              </p>
              <p className="text-xs font-medium text-navy">
                {app.college ?? "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/50">
                Degree / Branch
              </p>
              <p className="text-xs font-medium text-navy">
                {[app.degree, app.branch].filter(Boolean).join(" – ") || "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/50">
                Graduation Year
              </p>
              <p className="text-xs font-medium text-navy">
                {app.graduationYear ?? "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/50">
                Mobile
              </p>
              <p className="text-xs font-medium text-navy">
                {app.phone ?? "—"}
              </p>
            </div>
          </div>

          {/* Social / Portfolio links */}
          <div className="flex flex-wrap gap-3">
            {app.githubUrl && (
              <a
                href={app.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-ink hover:text-brand-ink transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {app.linkedinUrl && (
              <a
                href={app.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-ink hover:text-brand-ink transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            {app.portfolioUrl && (
              <a
                href={app.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-ink hover:text-brand-ink transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Portfolio</span>
              </a>
            )}
            {!app.githubUrl && !app.linkedinUrl && !app.portfolioUrl && (
              <span className="text-xs text-body italic">
                No portfolio links provided.
              </span>
            )}
          </div>

          {/* Rejection reason (if rejected) */}
          {app.stage === "REJECTED" && app.rejectionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <strong>Rejection Reason:</strong> {app.rejectionReason}
            </div>
          )}

          {/* Offer letter info (if issued) */}
          {app.offerLetter && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Offer Letter Issued</p>
                <Link
                  href={`/admin/applications/${app.id}/offer`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-700" />
                  <span>View Formal Document</span>
                </Link>
              </div>
              <p>
                Issued:{" "}
                {new Date(app.offerLetter.issuedAt).toLocaleDateString("en-IN")}
              </p>
              {app.offerLetter.startDate && (
                <p>
                  Start Date:{" "}
                  {new Date(app.offerLetter.startDate).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              )}
              <p>Signatory: {app.offerLetter.signatory ?? "—"}</p>
            </div>
          )}

          {/* Draft preview for shortlisted candidates */}
          {app.stage === "SELECTION_DECISION" && !app.offerLetter && (
            <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-950">
              <span className="font-medium">Candidate shortlisted for offer issuance.</span>
              <Link
                href={`/admin/applications/${app.id}/offer`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-950 underline"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Preview Draft Offer</span>
              </Link>
            </div>
          )}

          {/* Actions */}
          {!isTerminal && !rejectMode && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-navy/5">
              {nextStages.map((ns) => (
                <Button
                  key={ns.stage}
                  size="sm"
                  variant="primary"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvance(ns.stage);
                  }}
                  className="gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{ns.label}</span>
                </Button>
              ))}

              {(app.stage === "APPLICATION_RECEIVED" ||
                app.stage === "ELIGIBILITY_CHECK" ||
                app.stage === "SELECTION_DECISION") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectMode(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject Application</span>
                </button>
              )}
            </div>
          )}

          {/* Reject mode UI */}
          {rejectMode && (
            <div
              className="space-y-3 pt-2 border-t border-navy/5"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-red-700">
                Provide a rejection reason (optional):
              </p>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Graduation year does not match cohort intake window."
                className="w-full rounded-lg border border-navy/20 px-3 py-2 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isPending}
                  onClick={handleReject}
                  className="gap-1.5 bg-red-700 hover:bg-red-800"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  <span>Confirm Rejection</span>
                </Button>
                <button
                  onClick={() => setRejectMode(false)}
                  className="text-xs text-body hover:text-navy"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isTerminal && !rejectMode && (
            <div className="pt-2 border-t border-navy/5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-body italic">
                This application is in a terminal state ({STAGE_CONFIG[app.stage]?.title}).
              </p>
              {app.stage === "JOINING_CONFIRMATION" && (
                <Link
                  href={`/admin/certificates/new?userId=${app.userId}&email=${encodeURIComponent(app.userEmail)}&name=${encodeURIComponent(app.userName ?? "")}&program=${encodeURIComponent(app.internshipTitle)}&track=${encodeURIComponent(app.roleTitle)}&type=INTERNSHIP`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-hover transition-colors"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Issue Completion Certificate</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminApplicationList({
  applications,
}: {
  applications: AdminApplicationRecord[];
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-10 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-ink">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-bold text-navy">
          No Applications Found
        </h2>
        <p className="mt-2 text-sm text-body max-w-sm mx-auto">
          No applications match the current filter criteria. Try clearing filters
          or wait for new submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast notification */}
      {toastMessage && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-900"
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary */}
      <p className="text-xs text-body font-medium">
        Showing <strong>{applications.length}</strong> application
        {applications.length !== 1 ? "s" : ""}
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onUpdate={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 4000);
            }}
          />
        ))}
      </div>
    </div>
  );
}
