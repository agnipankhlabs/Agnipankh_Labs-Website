"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  Clock,
  Laptop,
  Users,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { AdminInternshipRecord } from "@/lib/admin-internships";
import { togglePublishInternshipAction } from "@/app/actions/admin-internships";
import { Button } from "@/components/ui/button";

const DOMAIN_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  WEB_DEVELOPMENT: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200" },
  AI_ML: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200" },
  DATA_SCIENCE: { bg: "bg-teal-50", text: "text-teal-800", ring: "ring-teal-200" },
  CYBERSECURITY: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200" },
  MARKETING: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200" },
  HR: { bg: "bg-pink-50", text: "text-pink-800", ring: "ring-pink-200" },
};

export function AdminInternshipList({
  internships,
}: {
  internships: AdminInternshipRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleTogglePublish(id: string) {
    startTransition(async () => {
      const res = await togglePublishInternshipAction(id);
      if (res.success) {
        setToastMessage(res.message ?? "Status updated.");
      } else {
        setToastMessage(res.message ?? "Failed to update status.");
      }
    });
  }

  if (internships.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">
          No Internship Tracks Found
        </h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No tracks matched your active filter or search query. Try clearing
          filters or create a new track.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/internships/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <span>Create New Track</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {internships.map((track) => {
          const domainStyle = DOMAIN_COLOR_MAP[track.domain] ?? {
            bg: "bg-navy/5",
            text: "text-navy",
            ring: "ring-navy/10",
          };

          return (
            <div
              key={track.id}
              className="rounded-2xl border border-navy/10 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Track Information */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${domainStyle.bg} ${domainStyle.text} ${domainStyle.ring}`}
                    >
                      {track.domainLabel}
                    </span>

                    {track.isPublished ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                        <EyeOff className="h-3 w-3 text-gray-500" />
                        <span>Draft</span>
                      </span>
                    )}

                    <span className="text-[11px] text-body">
                      Slug: <code className="font-mono text-navy font-semibold">{track.slug}</code>
                    </span>
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-bold text-navy">
                    {track.title}
                  </h3>

                  <p className="text-xs text-brand-ink font-semibold">
                    Role: {track.roleTitle}
                  </p>

                  <p className="text-xs text-body line-clamp-2 max-w-2xl leading-relaxed">
                    {track.summary}
                  </p>

                  {/* Badges / Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-navy/70 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-navy/40" />
                      <span>{track.durationMonths} Months</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-navy/40" />
                      <span>{track.mode}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-navy/40" />
                      <span>
                        <strong className="text-navy">{track.applicationsCount}</strong> Applications
                      </span>
                    </div>
                    <div>
                      <span>
                        Fee:{" "}
                        <strong className="text-navy">
                          {track.feePaise === 0
                            ? "Zero Tuition"
                            : `₹${(track.feePaise / 100).toLocaleString("en-IN")}`}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 border-t border-navy/5 pt-3 sm:border-none sm:pt-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/internships/${track.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 hover:border-navy/30 transition-colors shadow-2xs"
                    >
                      <Edit className="h-3.5 w-3.5 text-navy/60" />
                      <span>Edit Track</span>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleTogglePublish(track.id)}
                      className="gap-1.5 text-xs h-8"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : track.isPublished ? (
                        <EyeOff className="h-3.5 w-3.5 text-navy/60" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      <span>{track.isPublished ? "Unpublish" : "Publish"}</span>
                    </Button>
                  </div>

                  <Link
                    href={`/internships/${track.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-ink hover:underline pt-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
