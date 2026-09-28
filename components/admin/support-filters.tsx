"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All Categories" },
  { value: "GENERAL", label: "General" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "URGENT", label: "Urgent" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "ACADEMIC", label: "Academic" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_ON_USER", label: "Waiting on User" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export function AdminSupportFilters({
  activeCategory = "ALL",
  activePriority = "ALL",
  activeStatus = "ALL",
  searchQuery = "",
}: {
  activeCategory?: string;
  activePriority?: string;
  activeStatus?: string;
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
    (activeCategory && activeCategory !== "ALL") ||
    (activePriority && activePriority !== "ALL") ||
    (activeStatus && activeStatus !== "ALL") ||
    Boolean(searchQuery);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5 shadow-xs">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          type="search"
          defaultValue={searchQuery}
          placeholder="Search by subject, body, requester email/name…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
          onBlur={(e) => update("q", e.target.value.trim())}
          className="w-full rounded-xl border border-navy/15 bg-muted/20 pl-9 pr-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        />
      </div>

      {/* Category dropdown */}
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-navy/50 shrink-0" />
        <select
          value={activeCategory}
          onChange={(e) => update("category", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority dropdown */}
      <div>
        <select
          value={activePriority}
          onChange={(e) => update("priority", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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