"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

interface CourseFiltersProps {
  activeLevel?: string;
  activeSearch?: string;
  availableLevels: string[];
}

export function PublicCourseFilters({
  activeLevel = "ALL",
  activeSearch = "",
  availableLevels = [],
}: CourseFiltersProps) {
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
    (activeLevel && activeLevel !== "ALL") || Boolean(activeSearch);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5 shadow-xs">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          type="search"
          defaultValue={activeSearch}
          placeholder="Search courses by title, description, or topic…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
          onBlur={(e) => update("q", e.target.value.trim())}
          className="w-full rounded-xl border border-navy/15 bg-muted/20 pl-9 pr-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
        />
      </div>

      {/* Level dropdown */}
      {availableLevels.length > 0 && (
        <div>
          <select
            value={activeLevel}
            onChange={(e) => update("level", e.target.value)}
            className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
          >
            <option value="ALL">All Levels</option>
            {availableLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      )}

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