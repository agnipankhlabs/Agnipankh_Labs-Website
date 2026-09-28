"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * useTableFilter — shared URL-driven filter state for every admin data table.
 *
 * Problem it solves: every admin *-filters.tsx component duplicated the same
 * pattern of reading searchParams, calling useRouter, constructing URLSearchParams,
 * and pushing the new URL. This hook centralises that logic so each filter
 * component only declares its own filter shape.
 *
 * Usage:
 *   const { setFilter, clearFilters, isPending } = useTableFilter();
 *
 *   // Update a single filter key
 *   setFilter("status", "ACTIVE");
 *
 *   // Remove a filter key (treated as "ALL"/cleared)
 *   setFilter("status", "");
 *
 *   // Reset all filters except page
 *   clearFilters();
 */
export function useTableFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "ALL") {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
      // Reset to page 1 whenever a filter changes
      sp.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${sp.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  return { setFilter, clearFilters, isPending };
}
