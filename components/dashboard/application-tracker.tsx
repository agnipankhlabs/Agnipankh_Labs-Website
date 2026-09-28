"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { type StudentApplicationRecord } from "@/lib/applications";
import {
  withdrawApplicationAction,
  acceptAgreementAction,
} from "@/app/actions/application";
import { Button } from "@/components/ui/button";

const PIPELINE_STEPS = [
  { step: 1, key: "APPLICATION_RECEIVED", label: "Received" },
  { step: 2, key: "ELIGIBILITY_CHECK", label: "Eligibility" },
  { step: 3, key: "SELECTION_DECISION", label: "Selection" },
  { step: 4, key: "OFFER_LETTER_ISSUED", label: "Offer Letter" },
  { step: 5, key: "JOINING_CONFIRMATION", label: "Confirmed" },
];

export function ApplicationTracker({
  applications,
}: {
  applications: StudentApplicationRecord[];
}) {
  const [selectedOfferApp, setSelectedOfferApp] =
    useState<StudentApplicationRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-ink">
          <Briefcase className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-bold text-navy sm:text-2xl">
          No Active Internship Applications
        </h2>
        <p className="mt-2 text-sm text-body max-w-md mx-auto leading-relaxed">
          You haven&apos;t enrolled or applied to any cohort tracks yet. Choose from our 6 industry-backed programs and start building verifiable project experience.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
          >
            <span>Explore Internship Tracks</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-5 py-2.5 text-sm font-medium text-navy hover:bg-muted/30 transition-colors"
          >
            <span>View All Programs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy sm:text-2xl">
            My Applications & Cohort Tracker
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-body">
            Real-time status updates across the 5-stage admissions pipeline.
          </p>
        </div>
        <Link
          href="/internships"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink hover:underline"
        >
          <span>Apply to Another Track</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {actionMessage && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center justify-between"
        >
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-6">
        {applications.map((app) => {
          const currentStage = app.stage;
          const currentStep = app.stageInfo.step;
          const isTerminal = currentStage === "WITHDRAWN" || currentStage === "REJECTED";

          return (
            <div
              key={app.id}
              className="rounded-3xl border border-navy/10 bg-white p-6 shadow-xs sm:p-8"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/5 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                      {app.internshipDomain.replace("_", " ")}
                    </span>
                    <span className="text-xs text-body">
                      Applied on{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="mt-2 font-heading text-lg sm:text-xl font-bold text-navy">
                    {app.internshipTitle}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-body">
                    <span>Role: {app.roleTitle}</span>
                    <span>•</span>
                    <span>Duration: {app.durationMonths} Months</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      currentStage === "JOINING_CONFIRMATION"
                        ? "bg-emerald-100 text-emerald-800"
                        : currentStage === "OFFER_LETTER_ISSUED"
                        ? "bg-emerald-100 text-emerald-800 animate-pulse"
                        : currentStage === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : currentStage === "WITHDRAWN"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.stageInfo.badge}
                  </span>
                </div>
              </div>

              {/* 5-Stage Stepper (if not terminal) */}
              {!isTerminal ? (
                <div className="mt-8">
                  <div className="relative">
                    {/* Background line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-navy/10 sm:left-6 sm:right-6" />
                    {/* Completed progress line */}
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-emerald-600 transition-all duration-500 sm:left-6"
                      style={{
                        width: `${((Math.min(currentStep, 5) - 1) / 4) * 85}%`,
                      }}
                    />

                    {/* Step nodes */}
                    <div className="relative flex justify-between">
                      {PIPELINE_STEPS.map((item) => {
                        const isCompleted = item.step < currentStep;
                        const isCurrent = item.step === currentStep;

                        return (
                          <div
                            key={item.step}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : isCurrent
                                  ? "bg-brand-ink text-white ring-4 ring-brand/20 shadow-xs"
                                  : "border-2 border-navy/20 bg-white text-navy/40"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span>{item.step}</span>
                              )}
                            </div>
                            <span
                              className={`mt-2 text-[11px] sm:text-xs font-medium max-w-[60px] sm:max-w-none ${
                                isCurrent
                                  ? "font-bold text-navy"
                                  : isCompleted
                                  ? "text-navy/80"
                                  : "text-navy/40"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-muted/20 p-4 text-xs text-body flex items-center gap-3">
                  {currentStage === "REJECTED" ? (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600 shrink-0" />
                  )}
                  <span>
                    This application is marked as{" "}
                    <strong>{app.stageInfo.title}</strong>. You can browse and apply to other open tracks.
                  </span>
                </div>
              )}

              {/* Current Stage Status Callout */}
              <div className="mt-8 rounded-2xl border border-navy/5 bg-muted/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                      <Clock className="h-3.5 w-3.5 text-brand-ink" />
                      <span>Current Status: {app.stageInfo.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-body leading-relaxed max-w-xl">
                      {app.stageInfo.description}
                    </p>
                  </div>

                  {/* Actions depending on stage */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {currentStage === "OFFER_LETTER_ISSUED" && (
                      <Link
                        href={`/dashboard/offer/${app.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
                      >
                        <FileCheck className="h-4 w-4" />
                        <span>Review & Sign Offer</span>
                      </Link>
                    )}

                    {currentStage === "JOINING_CONFIRMATION" && (
                      <>
                        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                          <ShieldCheck className="h-4 w-4 text-emerald-700" />
                          <span>Onboarding Active</span>
                        </div>
                        <Link
                          href={`/dashboard/offer/${app.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-700" />
                          <span>View Offer Document</span>
                        </Link>
                      </>
                    )}

                    <Link
                      href={`/internships/${app.internshipSlug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-muted/40 transition-colors"
                    >
                      <span>Track Info</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    {(currentStage === "APPLICATION_RECEIVED" ||
                      currentStage === "ELIGIBILITY_CHECK") && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to withdraw this application?"
                            )
                          ) {
                            startTransition(async () => {
                              const res = await withdrawApplicationAction(app.id);
                              setActionMessage(res.message || "Application withdrawn.");
                            });
                          }
                        }}
                        disabled={isPending}
                        className="text-xs text-red-600 hover:text-red-800 hover:underline px-2 py-1"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offer Letter & Agreement Acceptance Modal */}
      {selectedOfferApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-xl rounded-3xl border border-navy/15 bg-white p-6 shadow-2xl sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-navy/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-ink" />
                <h3 className="font-heading text-lg font-bold text-navy">
                  Internship Offer Agreement
                </h3>
              </div>
              <button
                onClick={() => setSelectedOfferApp(null)}
                className="rounded-lg p-1 text-navy/60 hover:text-navy hover:bg-muted/50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-body leading-relaxed">
              <p>
                Agnipankh Labs is pleased to extend an offer for the{" "}
                <strong>{selectedOfferApp.internshipTitle}</strong> cohort.
              </p>
              <div className="rounded-xl border border-navy/10 bg-muted/20 p-4 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-navy">Role Title:</span>
                  <span>{selectedOfferApp.roleTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-navy">Duration:</span>
                  <span>{selectedOfferApp.durationMonths} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-navy">Terms Version:</span>
                  <span>v1.0-AL-LEGAL</span>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-[11px] text-emerald-950">
                <p className="font-semibold text-emerald-900">Key Commitments:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Regular attendance in weekly mentor-led review checkpoints.</li>
                  <li>Confidentiality regarding internal project repositories and mentor feedback.</li>
                  <li>Timely submission of the capstone project milestones.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOfferApp(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await acceptAgreementAction(selectedOfferApp.id);
                    setSelectedOfferApp(null);
                    setActionMessage(res.message || "Offer agreement accepted!");
                  });
                }}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Accept Terms & Confirm Joining</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
