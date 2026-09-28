"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { STAGE_CONFIG } from "@/lib/applications";
import { DOMAIN_LABELS } from "@/content/internships";

const STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Stages" },
  ...Object.entries(STAGE_CONFIG).map(([key, info]) => ({
    value: key,
    label: info.shortTitle,
  })),
];

const DOMAIN_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Domains" },
  ...Object.entries(DOMAIN_LABELS).map(([key, label]) => ({
    value: key,
    label,
  })),
];

export function AdminApplicationFilters({
  activeStage,
  activeDomain,
  searchQuery,
}: {
  activeStage?: string;
  activeDomain?: string;
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
    (activeStage && activeStage !== "ALL") ||
    (activeDomain && activeDomain !== "ALL") ||
    searchQuery;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          type="search"
          defaultValue={searchQuery ?? ""}
          placeholder="Search by name, email, college, or track…"
          onChange={(e) => update("q", e.target.value)}
          className="h-9 w-full rounded-lg border border-navy/20 bg-white pl-9 pr-4 text-sm text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-offset-2 focus:outline-brand-ink"
        />
      </div>

      {/* Stage filter */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-navy/50" />
        <select
          value={activeStage ?? "ALL"}
          onChange={(e) => update("stage", e.target.value)}
          className="h-9 rounded-lg border border-navy/20 bg-white px-3 text-sm text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
        >
          {STAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Domain filter */}
      <div>
        <select
          value={activeDomain ?? "ALL"}
          onChange={(e) => update("domain", e.target.value)}
          className="h-9 rounded-lg border border-navy/20 bg-white px-3 text-sm text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
        >
          {DOMAIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
        >
          <X className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}
