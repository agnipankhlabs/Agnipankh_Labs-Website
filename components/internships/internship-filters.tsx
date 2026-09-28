"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOMAIN_LABELS } from "@/content/internships";

export function InternshipFilters({
  activeDomain,
  activeMode,
}: {
  activeDomain: string;
  activeMode: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDomainChange = (domain: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (domain === "ALL") {
      params.delete("domain");
    } else {
      params.set("domain", domain);
    }
    router.push(`/internships?${params.toString()}`);
  };

  const handleModeChange = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "ALL") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }
    router.push(`/internships?${params.toString()}`);
  };

  const domainOptions: { key: string; label: string }[] = [
    { key: "ALL", label: "All Tracks" },
    ...Object.entries(DOMAIN_LABELS).map(([k, v]) => ({ key: k, label: v })),
  ];

  const modeOptions: { key: string; label: string }[] = [
    { key: "ALL", label: "All Formats" },
    { key: "ONLINE", label: "Online / Remote" },
    { key: "HYBRID", label: "Hybrid" },
    { key: "OFFLINE", label: "Onsite" },
  ];

  return (
    <div className="space-y-4">
      {/* Domain Filters */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-body">
          Filter by Track
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {domainOptions.map((opt) => {
            const isSelected = activeDomain === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleDomainChange(opt.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-navy text-white shadow-xs"
                    : "border border-navy/15 bg-white text-navy hover:border-navy/30 hover:bg-muted/40"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-body">Format:</span>
        {modeOptions.map((opt) => {
          const isSelected = activeMode === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleModeChange(opt.key)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-brand/15 font-semibold text-brand-ink"
                  : "text-body hover:bg-muted/50 hover:text-navy"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
