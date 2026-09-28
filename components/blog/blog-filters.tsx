"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

interface BlogFiltersProps {
  activeCategory?: string;
  activeTag?: string;
  activeSearch?: string;
  availableCategories: string[];
  availableTags: string[];
}

export function PublicBlogFilters({
  activeCategory = "ALL",
  activeTag = "",
  activeSearch = "",
  availableCategories = [],
  availableTags = [],
}: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const sp = new URLSearchParams(params ? params.toString() : "");
    if (value === "ALL" || value === "") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters =
    (activeCategory && activeCategory !== "ALL") ||
    Boolean(activeTag) ||
    Boolean(activeSearch);

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            type="search"
            defaultValue={activeSearch}
            placeholder="Search articles by title, excerpt, or topic…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("q", (e.target as HTMLInputElement).value.trim());
              }
            }}
            onBlur={(e) => update("q", e.target.value.trim())}
            className="w-full rounded-xl border border-navy/15 bg-muted/20 pl-9 pr-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
          />
        </div>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <select
            value={activeCategory}
            onChange={(e) => update("category", e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-navy/15 bg-muted/20 px-3 py-2.5 text-sm font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <select
            value={activeTag}
            onChange={(e) => update("tag", e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-navy/15 bg-muted/20 px-3 py-2.5 text-sm font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
