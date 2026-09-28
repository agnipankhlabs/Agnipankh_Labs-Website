"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Certificate Types" },
  { value: "INTERNSHIP", label: "Internship (IN)" },
  { value: "COURSE", label: "Course Completion (CO)" },
  { value: "EXCELLENCE", label: "Excellence (EX)" },
  { value: "RECOGNITION", label: "Recognition (RE)" },
  { value: "LEADERSHIP", label: "Leadership (LE)" },
  { value: "CITATION", label: "Citation (CI)" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active / Valid" },
  { value: "REVOKED", label: "Revoked" },
];

export function AdminCertificateFilters({
  activeType = "ALL",
  activeStatus = "ALL",
  searchQuery = "",
}: {
  activeType?: string;
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
    (activeType && activeType !== "ALL") ||
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
          placeholder="Search by certificate ID (AL-IN26-...), student name, or email…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
          onBlur={(e) => update("q", e.target.value.trim())}
          className="w-full rounded-xl border border-navy/15 bg-muted/20 pl-9 pr-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        />
      </div>

      {/* Type dropdown */}
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-navy/50 shrink-0" />
        <select
          value={activeType}
          onChange={(e) => update("type", e.target.value)}
          className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        >
          {TYPE_OPTIONS.map((opt) => (
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
