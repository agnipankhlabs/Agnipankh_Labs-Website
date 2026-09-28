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
  RefreshCw,
  ExternalLink,
  MoreVertical,
  Loader2,
} from "lucide-react";
import type { AdminPaymentRecord } from "@/lib/admin-finance";
import { updatePaymentAction } from "@/app/actions/admin-finance";

const STATUS_STYLE_MAP: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <Clock className="h-3 w-3 text-amber-600" />, label: "Pending" },
  PAID: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />, label: "Paid" },
  FAILED: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200", icon: <XCircle className="h-3 w-3 text-red-600" />, label: "Failed" },
  CANCELLED: { bg: "bg-navy/5", text: "text-navy", ring: "ring-navy/10", icon: <XCircle className="h-3 w-3 text-navy/50" />, label: "Cancelled" },
  REFUNDED: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200", icon: <RefreshCw className="h-3 w-3 text-purple-600" />, label: "Refunded" },
  PARTIALLY_REFUNDED: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200", icon: <RefreshCw className="h-3 w-3 text-blue-600" />, label: "Partially Refunded" },
};

const MODE_LABEL_MAP: Record<string, string> = {
  UPI: "UPI",
  NET_BANKING: "Net Banking",
  CARD: "Card",
  WALLET: "Wallet",
  OTHER: "Other",
};

export function AdminPaymentList({
  payments,
  total,
  page,
  pageSize,
}: {
  payments: AdminPaymentRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleStatusChange(payment: AdminPaymentRecord, newStatus: string) {
    setUpdatingId(payment.id);
    startTransition(async () => {
      const res = await updatePaymentAction(payment.id, { status: newStatus });
      if (res.success) {
        setToastMessage(res.message ?? "Status updated.");
      } else {
        alert(res.message ?? "Failed to update status.");
      }
      setUpdatingId(null);
    });
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <CreditCard className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Payments Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No payments match the selected filters. Try adjusting your search or filters.
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
                <th className="p-3">Payment</th>
                <th className="p-3 hidden md:table-cell">Customer</th>
                <th className="p-3 hidden lg:table-cell">Amount</th>
                <th className="p-3 hidden lg:table-cell">Stream</th>
                <th className="p-3 hidden lg:table-cell">Mode</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Gateway</th>
                <th className="p-3">Date</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {payments.map((payment) => {
                const statusStyle = STATUS_STYLE_MAP[payment.status] ?? STATUS_STYLE_MAP.PENDING;
                return (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/finance/payments/${payment.id}`}
                        className="font-mono text-sm font-bold text-navy hover:text-brand-ink"
                      >
                        {payment.id.slice(0, 12)}…
                      </Link>
                      {payment.gatewayOrderId && (
                        <p className="text-xs text-navy/60 font-mono mt-0.5">{payment.gatewayOrderId}</p>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell text-xs text-navy/60">
                      {payment.userId ? (
                        <>
                          <p>User: {payment.userId.slice(0, 8)}…</p>
                          <p>via {payment.gatewayName ?? "—"}</p>
                        </>
                      ) : (
                        "Guest"
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="font-mono font-semibold text-navy">
                        ₹{(payment.amountPaise / 100).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {payment.revenueStream.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {MODE_LABEL_MAP[payment.mode ?? "OTHER"]}
                      </span>
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
                      {payment.gatewayName ?? "—"}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(payment.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 w-32">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/finance/payments/${payment.id}`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* Status dropdown */}
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
                              {["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(payment, status);
                                  }}
                                  disabled={updatingId === payment.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    payment.status === status
                                      ? "bg-brand-ink/10 text-brand-ink font-semibold"
                                      : "text-navy/70 hover:bg-muted/50"
                                  }`}
                                >
                                  {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                                </button>
                              ))}
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
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} payments
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