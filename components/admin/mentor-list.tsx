"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  User,
  Award,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Loader2,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import type { AdminMentorRecord } from "@/lib/admin-mentors";
import { approveMentorAction } from "@/app/actions/admin-mentors";
import { Button } from "@/components/ui/button";

const STATUS_STYLE_MAP: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <Clock className="h-3 w-3 text-amber-600" />, label: "Pending" },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />, label: "Approved" },
  REJECTED: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200", icon: <XCircle className="h-3 w-3 text-red-600" />, label: "Rejected" },
};

function StarIcon({ score }: { score: number | null }) {
  if (score === null) return <Star className="h-3.5 w-3.5 text-navy/20" />;
  const filled = Math.round(score / 20);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= filled ? "text-amber-500 fill-current" : "text-navy/20"}`} />
      ))}
    </span>
  );
}

export function AdminMentorList({
  mentors,
}: {
  mentors: AdminMentorRecord[];
}) {
  const [pendingAction, setPendingAction] = useState<{ mentor: AdminMentorRecord; action: "APPROVE" | "REJECT" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleApprove(mentor: AdminMentorRecord) {
    if (mentor.approvalStatus !== "PENDING") return;
    setPendingAction({ mentor, action: "APPROVE" });
  }

  function handleReject(mentor: AdminMentorRecord) {
    if (mentor.approvalStatus !== "PENDING") return;
    setPendingAction({ mentor, action: "REJECT" });
    setRejectionReason("");
  }

  function confirmAction() {
    if (!pendingAction) return;
    const { mentor, action } = pendingAction;
    const reason = action === "REJECT" ? prompt("Enter rejection reason (optional):") : undefined;

    startTransition(async () => {
      const res = await approveMentorAction(
        mentor.id,
        action,
        "admin-user-id",
        action === "REJECT" ? rejectionReason : undefined
      );
      if (res.success) {
        setToastMessage(res.message ?? `Mentor ${action === "APPROVE" ? "approved" : "rejected"}.`);
      } else {
        alert(res.message ?? "Failed to update mentor status.");
      }
      setPendingAction(null);
      setRejectionReason("");
    });
  }

  if (mentors.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <User className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Mentors Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No mentors match the selected filters. Use the &ldquo;Add Mentor&rdquo; button
          to create a new mentor profile (feature coming soon).
        </p>
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
            <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
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

      <div className="rounded-2xl border border-navy/10 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-navy/10 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-navy/60">
                <th className="p-3">Mentor</th>
                <th className="p-3 hidden md:table-cell">Expertise</th>
                <th className="p-3 hidden lg:table-cell">Experience</th>
                <th className="p-3 hidden lg:table-cell">Employer</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Cohorts</th>
                <th className="p-3 hidden lg:table-cell">Avg Rating</th>
                <th className="p-3">Joined</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {mentors.map((mentor) => {
                const statusStyle = STATUS_STYLE_MAP[mentor.approvalStatus] ?? STATUS_STYLE_MAP.PENDING;
                return (
                  <tr key={mentor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/mentors/${mentor.id}`}
                        className="font-medium text-navy hover:text-brand-ink"
                      >
                        {mentor.userName ?? "Unknown"}
                      </Link>
                      <p className="text-xs text-navy/60">{mentor.userEmail}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell text-xs text-navy/60 max-w-xs truncate">
                      {mentor.expertise.slice(0, 3).join(", ")}
                      {mentor.expertise.length > 3 && ` +${mentor.expertise.length - 3} more`}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {mentor.yearsExperience ? `${mentor.yearsExperience} years` : "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {mentor.currentEmployer ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}
                      >
                        {statusStyle.icon}
                        <span>{statusStyle.label}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {mentor.cohortCount}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {mentor.averageScore !== null ? (
                        <>
                          <span className="font-mono font-semibold text-navy">{mentor.averageScore}</span>
                          <span className="text-[10px] text-navy/50 ml-1">/ 100</span>
                        </>
                      ) : (
                        <span className="text-xs text-navy/50">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(mentor.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 w-32">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/mentors/${mentor.id}`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {mentor.approvalStatus === "PENDING" && (
                          <div className="relative">
                            <button
                              className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                                if (menu) menu.classList.toggle("hidden");
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 hidden z-10 w-40 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                              <div className="space-y-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove({ ...mentor, approvalStatus: "PENDING" });
                                  }}
                                  disabled={mentor.approvalStatus !== "PENDING"}
                                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                >
                                  <CheckCircle2 className="h-3 w-3 inline mr-1" /> Approve
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject({ ...mentor, approvalStatus: "PENDING" });
                                  }}
                                  disabled={mentor.approvalStatus !== "PENDING"}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <XCircle className="h-3 w-3 inline mr-1" /> Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}