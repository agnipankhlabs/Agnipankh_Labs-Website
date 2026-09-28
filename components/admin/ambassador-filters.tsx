"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const TIER_OPTIONS = [
  { value: "TIER_1", label: "Tier 1 (5+)" },
  { value: "TIER_2", label: "Tier 2 (10+)" },
  { value: "TIER_3", label: "Tier 3 (25+)" },
  { value: "TIER_4", label: "Tier 4 (50+)" },
];

export function AdminAmbassadorFilters({
  activeStatus = "ALL",
  activeTier = "ALL",
  activeSenior = "ALL",
  searchQuery = "",
}: {
  activeStatus?: string;
  activeTier?: string;
  activeSenior?: string;
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
    (activeTier && activeTier !== "ALL") ||
    (activeSenior && activeSenior !== "ALL") ||
    Boolean(searchQuery);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5 shadow-xs">
      {/* Search Bar */}
      <div className="relative flex-1">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          defaultValue={searchQuery}
          placeholder="Search by name, email, referral code, college…"
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
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tier dropdown */}
      <div>
        <select
          value={activeTier}
          onChange={(e) => update("tier", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          <option value="ALL">All Tiers</option>
          {TIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Senior filter */}
      <div>
        <select
          value={activeSenior}
          onChange={(e) => update("isSenior", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          <option value="ALL">All</option>
          <option value="true">Senior Only</option>
          <option value="false">Non-Senior</option>
        </select>
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="inline-flex items-center gap-1 rounded-xl border border-navy/10 px-3 py-2 text-xs font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors shrink-0"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}