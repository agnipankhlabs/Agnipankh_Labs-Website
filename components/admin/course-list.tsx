"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import type { AdminCourseRecord } from "@/lib/admin-courses";
import { togglePublishCourseAction, deleteCourseAction } from "@/app/actions/admin-courses";
import { Button } from "@/components/ui/button";

export function AdminCourseList({
  courses,
}: {
  courses: AdminCourseRecord[];
}) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleTogglePublish(course: AdminCourseRecord) {
    setTogglingId(course.id);
    startTransition(async () => {
      const res = await togglePublishCourseAction(course.id, !course.isPublished);
      if (res.success) {
        setToastMessage(res.message ?? `Course ${!course.isPublished ? "published" : "unpublished"}.`);
      } else {
        alert(res.message ?? "Failed to toggle publish status.");
      }
      setTogglingId(null);
    });
  }

  function handleDelete(course: AdminCourseRecord) {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeletingId(course.id);
    startTransition(async () => {
      const res = await deleteCourseAction(course.id);
      if (res.success) {
        setToastMessage(res.message ?? "Course deleted.");
      } else {
        alert(res.message ?? "Failed to delete course.");
      }
      setDeletingId(null);
    });
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">
          No Courses Found
        </h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No courses match the selected filters. Use the &ldquo;Create Course&rdquo;
          button to add your first course.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Create Course</span>
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
        {courses.map((c) => (
          <div
            key={c.id}
            className={`rounded-2xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-md ${
              c.isPublished ? "border-emerald-200 bg-emerald-50/30" : "border-navy/10"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: Course Details */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                      c.isPublished
                        ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                        : "bg-navy/5 text-navy ring-navy/10"
                    }`}
                  >
                    {c.isPublished ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 mr-1" />
                        Published
                      </>
                    ) : (
                      <span>Draft</span>
                    )}
                  </span>

                  <span className="text-[11px] text-navy/50 font-mono">
                    {c.lessonCount} lesson{c.lessonCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[11px] text-navy/50 font-mono">
                    {c.enrollmentCount} enrollment{c.enrollmentCount !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* ID row */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-navy">
                    {c.slug}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-base font-bold text-navy">
                  {c.title}
                </h3>

                {c.summary && (
                  <p className="text-xs text-body line-clamp-2">{c.summary}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-navy/60 pt-1">
                  {c.level && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                      Level: {c.level}
                    </span>
                  )}
                  {c.pricePaise && c.pricePaise > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                      ₹{(c.pricePaise / 100).toLocaleString("en-IN")}
                    </span>
                  )}
                  <span>
                    Updated:{" "}
                    <strong className="text-navy">
                      {new Date(c.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 border-t border-navy/5 pt-3 sm:border-none sm:pt-0">
                <Link
                  href={`/courses/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 hover:border-navy/30 transition-colors shadow-2xs"
                >
                  <Eye className="h-3 w-3 text-navy/50" />
                  <span>Public View</span>
                </Link>

                <Link
                  href={`/admin/courses/${c.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 hover:border-navy/30 transition-colors shadow-2xs"
                >
                  <Edit className="h-3 w-3 text-navy/50" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleTogglePublish(c)}
                  disabled={isPending || togglingId === c.id}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    c.isPublished
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {togglingId === c.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : c.isPublished ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span>{c.isPublished ? "Unpublish" : "Publish"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c)}
                  disabled={isPending || deletingId === c.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                >
                  {deletingId === c.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}