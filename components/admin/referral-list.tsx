"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Users,
  Gift,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { AdminReferralRecord } from "@/lib/admin-referrals";
import { updateReferralAction, deleteReferralAction } from "@/app/actions/referral";
import { Button } from "@/components/ui/button";

const REWARD_STATUS_STYLE_MAP = {
  true: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />, label: "Rewarded" },
  false: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <Clock className="h-3 w-3 text-amber-600" />, label: "Pending" },
};

export function AdminReferralList({
  referrals,
  total,
  page,
  pageSize,
}: {
  referrals: AdminReferralRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleUpdateReward(referral: AdminReferralRecord, rewardGranted: boolean) {
    setUpdatingId(referral.id);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("rewardGranted", String(rewardGranted));
      const res = await updateReferralAction(referral.id, null, formData);
      if (res.success) {
        setToastMessage(res.message ?? "Referral updated.");
      } else {
        alert(res.message ?? "Failed to update referral.");
      }
      setUpdatingId(null);
    });
  }

  function handleDelete(referral: AdminReferralRecord) {
    if (!confirm(`Delete referral "${referral.code}"? This cannot be undone.`)) return;
    setDeletingId(referral.id);
    startTransition(async () => {
      const res = await deleteReferralAction(referral.id);
      if (res.success) {
        setToastMessage(res.message ?? "Referral deleted.");
      } else {
        alert(res.message ?? "Failed to delete referral.");
      }
      setDeletingId(null);
    });
  }

  if (referrals.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Referrals Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No referrals match the selected filters.
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
                <th className="p-3">Referrer</th>
                <th className="p-3 hidden md:table-cell">Referred</th>
                <th className="p-3 hidden lg:table-cell">Code</th>
                <th className="p-3 hidden lg:table-cell">Reward</th>
                <th className="p-3">Created</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {referrals.map((referral) => {
                const rewardStyle = REWARD_STATUS_STYLE_MAP[String(referral.rewardGranted) as keyof typeof REWARD_STATUS_STYLE_MAP];
                return (
                  <tr key={referral.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${referral.referrerUserId}`}
                        className="font-medium text-navy hover:text-brand-ink"
                      >
                        {referral.referrerName ?? referral.referrerEmail ?? referral.referrerUserId}
                      </Link>
                      {referral.referrerEmail && (
                        <p className="text-xs text-navy/60">{referral.referrerEmail}</p>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {referral.referredUserId ? (
                        <Link
                          href={`/admin/users/${referral.referredUserId}`}
                          className="font-medium text-navy hover:text-brand-ink"
                        >
                          {referral.referredName ?? referral.referredEmail ?? referral.referredUserId}
                        </Link>
                      ) : (
                        <span className="text-xs text-navy/50">—</span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-mono font-medium text-navy">
                        <Gift className="h-2.5 w-2.5" />
                        {referral.code}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${rewardStyle.bg} ${rewardStyle.text} ${rewardStyle.ring}`}>
                        {rewardStyle.icon}
                        <span>{rewardStyle.label}</span>
                      </span>
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(referral.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 w-40">
                      <div className="flex flex-col gap-1">
                        <div className="relative">
                          <button
                            className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling as HTMLElement;
                              if (menu) menu.classList.toggle("hidden");
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden z-10 w-40 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                            <div className="space-y-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateReward(referral, !referral.rewardGranted);
                                }}
                                disabled={isPending || updatingId === referral.id}
                                className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-brand-ink hover:bg-brand-ink/10 transition-colors"
                              >
                                {referral.rewardGranted ? "Mark Pending" : "Mark Rewarded"}
                              </button>
                              <hr className="my-1 border-navy/10" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(referral);
                                }}
                                disabled={isPending || deletingId === referral.id}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-xs text-navy/60">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} referrals
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => window.location.href = `${window.location.pathname}?${new URLSearchParams(window.location.search).set("page", String(page - 1))}`}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= total}
              onClick={() => window.location.href = `${window.location.pathname}?${new URLSearchParams(window.location.search).set("page", String(page + 1))}`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}