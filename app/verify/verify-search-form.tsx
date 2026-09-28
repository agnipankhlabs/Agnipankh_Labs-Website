// Client component — certificate ID search form
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export function VerifySearchForm() {
  const [certId, setCertId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sanitized = certId.trim().toUpperCase();
    if (!sanitized) {
      setError("Please enter a valid Certificate ID.");
      return;
    }
    setError("");
    router.push(`/verify/${encodeURIComponent(sanitized)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-body/50">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={certId}
            onChange={(e) => {
              setCertId(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. AL-INT26-8F92A1B"
            className="w-full rounded-xl border border-navy/20 bg-white py-3.5 pl-11 pr-4 font-mono text-sm uppercase tracking-wide text-navy placeholder:normal-case placeholder:tracking-normal placeholder:text-body/40 shadow-xs focus:border-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-ink/20 transition-all"
            aria-label="Certificate ID"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition-all focus:outline-hidden focus:ring-2 focus:ring-brand/40"
        >
          <span>Verify Credential</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && <p className="mt-2 text-left text-xs font-semibold text-rose-600">{error}</p>}
    </form>
  );
}
