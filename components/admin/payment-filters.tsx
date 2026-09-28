"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_REFUNDED", label: "Partially Refunded" },
];

const REVENUE_STREAM_OPTIONS = [
  { value: "ALL", label: "All Streams" },
  { value: "INTERNSHIP_PROGRAMS", label: "Internship Programs" },
  { value: "TRAINING_PROGRAMS", label: "Training Programs" },
  { value: "CERTIFICATION_SERVICES", label: "Certification Services" },
  { value: "ACADEMIC_PARTNERSHIPS", label: "Academic Partnerships" },
  { value: "CORPORATE_SPONSORSHIPS", label: "Corporate Sponsorships" },
  { value: "EVENTS_AND_WORKSHOPS", label: "Events & Workshops" },
];

const MODE_OPTIONS = [
  { value: "ALL", label: "All Modes" },
  { value: "UPI", label: "UPI" },
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "CARD", label: "Card" },
  { value: "WALLET", label: "Wallet" },
  { value: "OTHER", label: "Other" },
];

export function AdminPaymentFilters({
  activeStatus = "ALL",
  activeStream = "ALL",
  activeMode = "ALL",
  searchQuery = "",
}: {
  activeStatus?: string;
  activeStream?: string;
  activeMode?: string;
  searchQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === "ALL" || value === "") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  const hasFilters =
    (activeStatus && activeStatus !== "ALL") ||
    (activeStream && activeStream !== "ALL") ||
    (activeMode && activeMode !== "ALL") ||
    Boolean(searchQuery);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5 shadow-xs">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          type="search"
          defaultValue={searchQuery}
          placeholder="Search by gateway order ID, payment ID, or user email…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
          onBlur={(e) => update("q", e.target.value.trim())}
          className="w-full rounded-xl border border-navy/15 bg-muted/20 pl-9 pr-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        />
      </div>

      {/* Status dropdown */}
      <div>
        <select
          value={activeStatus}
          onChange={(e) => update("status", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Revenue Stream dropdown */}
      <div>
        <select
          value={activeStream}
          onChange={(e) => update("stream", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {REVENUE_STREAM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mode dropdown */}
      <div>
        <select
          value={activeMode}
          onChange={(e) => update("mode", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="inline-flex items-center gap-1 rounded-xl border border-navy/10 px-3 py-2 text-xs font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}