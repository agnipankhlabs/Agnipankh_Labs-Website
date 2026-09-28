"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CreditCard, ShieldCheck, ExternalLink } from "lucide-react";
import type { AdminVendorRecord } from "@/lib/admin-finance";

export function AdminVendorList({
  vendors,
  total,
  page,
  pageSize,
}: {
  vendors: AdminVendorRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  if (vendors.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <CreditCard className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Vendors Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No vendors match the selected filters. Try adjusting your search.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/finance/vendors/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Add Vendor</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-navy/10 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-navy/60">
              <th className="p-3">Vendor</th>
              <th className="p-3 hidden md:table-cell">Service</th>
              <th className="p-3 hidden lg:table-cell">Compliance</th>
              <th className="p-3 hidden lg:table-cell">Expenses</th>
              <th className="p-3 hidden lg:table-cell">Total Spend</th>
              <th className="p-3 hidden lg:table-cell">Last Reviewed</th>
              <th className="p-3">Created</th>
              <th className="p-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <Link
                    href={`/admin/finance/vendors/${vendor.id}`}
                    className="font-medium text-navy hover:text-brand-ink"
                  >
                    {vendor.name}
                  </Link>
                  {vendor.service && (
                    <p className="text-xs text-navy/60 mt-0.5">{vendor.service}</p>
                  )}
                </td>
                <td className="p-3 hidden md:table-cell text-xs text-navy/60">
                  {vendor.service ?? "—"}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${vendor.soc2 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                      <ShieldCheck className={`h-3 w-3 ${vendor.soc2 ? "text-emerald-600" : "text-red-600"}`} />
                      <span>SOC2</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${vendor.iso27001 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                      <ShieldCheck className={`h-3 w-3 ${vendor.iso27001 ? "text-emerald-600" : "text-red-600"}`} />
                      <span>ISO 27001</span>
                    </span>
                  </div>
                </td>
                <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                  {vendor.expenseCount} expense{vendor.expenseCount !== 1 ? "s" : ""}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="font-mono font-semibold text-navy">
                    ₹{(vendor.totalExpensePaise / 100).toLocaleString("en-IN")}
                  </div>
                </td>
                <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                  {vendor.lastReviewedAt ? format(new Date(vendor.lastReviewedAt), "MMM d, yyyy") : "—"}
                </td>
                <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                  {format(new Date(vendor.createdAt), "MMM d, yyyy")}
                </td>
                <td className="p-3 w-32">
                  <Link
                    href={`/admin/finance/vendors/${vendor.id}`}
                    className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-xs text-navy/60">
        <span>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} vendors
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