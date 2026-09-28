"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Loader2,
  UserPlus,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import type { AdminExpenseRecord } from "@/lib/admin-finance";
import { updateExpenseApprovalAction } from "@/app/actions/admin-finance";

const CATEGORY_LABEL_MAP: Record<string, string> = {
  TECHNOLOGY: "Technology",
  MARKETING_AND_GROWTH: "Marketing & Growth",
  OPERATIONS: "Operations",
  HUMAN_RESOURCES: "Human Resources",
};

const TIER_LABEL_MAP: Record<string, string> = {
  TEAM_LEAD: "Team Lead",
  FOUNDER: "Founder",
  FOUNDER_JOINT: "Founder + Co-Founder",
};

export function AdminExpenseList({
  expenses,
  total,
  page,
  pageSize,
}: {
  expenses: AdminExpenseRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleApprove(expense: AdminExpenseRecord) {
    setUpdatingId(expense.id);
    startTransition(async () => {
      const res = await updateExpenseApprovalAction(expense.id, "APPROVE", "admin-user-id");
      if (res.success) {
        setToastMessage(res.message ?? "Expense approved.");
      } else {
        alert(res.message ?? "Failed to approve.");
      }
      setUpdatingId(null);
    });
  }

  function handleReject(expense: AdminExpenseRecord) {
    setUpdatingId(expense.id);
    startTransition(async () => {
      const res = await updateExpenseApprovalAction(expense.id, "REJECT", "admin-user-id");
      if (res.success) {
        setToastMessage(res.message ?? "Expense rejected.");
      } else {
        alert(res.message ?? "Failed to reject.");
      }
      setUpdatingId(null);
    });
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <CreditCard className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Expenses Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No expenses match the selected filters. Try adjusting your search or filters.
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
                <th className="p-3">Expense</th>
                <th className="p-3 hidden md:table-cell">Category</th>
                <th className="p-3 hidden lg:table-cell">Amount</th>
                <th className="p-3 hidden lg:table-cell">Department</th>
                <th className="p-3 hidden lg:table-cell">Vendor</th>
                <th className="p-3 hidden lg:table-cell">Tier</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {expenses.map((expense) => {
                const isApproved = expense.approvedAt !== null;
                const isPending = !isApproved;
                return (
                  <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/finance/expenses/${expense.id}`}
                        className="font-mono text-sm font-bold text-navy hover:text-brand-ink"
                      >
                        {expense.id.slice(0, 12)}…
                      </Link>
                      {expense.description && (
                        <p className="text-xs text-navy/60 line-clamp-1 mt-0.5">{expense.description}</p>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {CATEGORY_LABEL_MAP[expense.category] ?? expense.category}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="font-mono font-semibold text-navy">
                        ₹{(expense.amountPaise / 100).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {expense.departmentName ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {expense.vendorName ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {TIER_LABEL_MAP[expense.approvalTier] ?? expense.approvalTier}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(expense.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 w-32">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/finance/expenses/${expense.id}`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {isPending && (
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
                            <div className="absolute right-0 top-full mt-1 hidden z-10 w-36 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                              <div className="space-y-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(expense);
                                  }}
                                  disabled={updatingId === expense.id}
                                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                >
                                  <UserPlus className="h-3 w-3 inline mr-1" /> Approve
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(expense);
                                  }}
                                  disabled={updatingId === expense.id}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-xs text-navy/60">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} expenses
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

function Button({ children, variant = "primary", size = "md", disabled, onClick, className, type = "button" }: { children: React.ReactNode; variant?: "outline" | "primary"; size?: "sm" | "md" | "lg"; disabled?: boolean; onClick?: () => void; className?: string; type?: "button" | "submit" | "reset" }) {
  const base = "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    outline: "border border-navy/15 bg-white text-navy hover:bg-muted/40",
    primary: "bg-brand-ink text-white hover:bg-brand-hover",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className || ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}