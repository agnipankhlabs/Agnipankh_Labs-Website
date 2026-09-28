"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  createCourseAction,
  updateCourseAction,
  type CourseActionResult,
} from "@/app/actions/admin-courses";
import { Button } from "@/components/ui/button";

const LESSON_KINDS = [
  { value: "READING", label: "Reading" },
  { value: "VIDEO", label: "Video" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "CODE_LAB", label: "Code Lab" },
] as const;

interface CourseFormProps {
  initialValues?: {
    title?: string;
    slug?: string;
    summary?: string;
    description?: string;
    level?: string;
    prerequisites?: string;
    pricePaise?: number;
    isPublished?: boolean;
    lessons?: Array<{
      title: string;
      ordinal: number;
      kind: string;
      content?: string;
      videoUrl?: string;
      durationMinutes?: number;
    }>;
  };
  courseId?: string;
  isEditing?: boolean;
}

export function CourseForm({
  initialValues,
  courseId,
  isEditing = false,
}: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [summary, setSummary] = useState(initialValues?.summary ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [level, setLevel] = useState(initialValues?.level ?? "");
  const [prerequisites, setPrerequisites] = useState(initialValues?.prerequisites ?? "");
  const [pricePaise, setPricePaise] = useState(initialValues?.pricePaise ?? "");
  const [isPublished, setIsPublished] = useState(initialValues?.isPublished ?? false);

  const [lessons, setLessons] = useState(
    initialValues?.lessons?.length
      ? initialValues.lessons
      : [{ title: "", ordinal: 1, kind: "READING", content: "", videoUrl: "", durationMinutes: undefined }]
  );

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function generateSlug() {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    setSlug(generated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    if (summary) formData.set("summary", summary);
    if (description) formData.set("description", description);
    if (level) formData.set("level", level);
    if (prerequisites) formData.set("prerequisites", prerequisites);
    if (pricePaise) formData.set("pricePaise", String(pricePaise));
    if (isPublished) formData.set("isPublished", "on");

    formData.set("lessonCount", String(lessons.length));
    lessons.forEach((lesson, i) => {
      formData.set(`lessons[${i}].title`, lesson.title);
      formData.set(`lessons[${i}].ordinal`, String(lesson.ordinal));
      formData.set(`lessons[${i}].kind`, lesson.kind);
      if (lesson.content) formData.set(`lessons[${i}].content`, lesson.content);
      if (lesson.videoUrl) formData.set(`lessons[${i}].videoUrl`, lesson.videoUrl);
      if (lesson.durationMinutes !== undefined) formData.set(`lessons[${i}].durationMinutes`, String(lesson.durationMinutes));
    });

    startTransition(async () => {
      const res: CourseActionResult = isEditing
        ? await updateCourseAction(courseId!, null, formData)
        : await createCourseAction(null, formData);

      if (res.success && res.courseId) {
        router.push("/admin/courses");
      } else {
        if (res.fieldErrors) {
          setFormErrors(res.fieldErrors);
        }
        setGeneralError(res.message ?? "Failed to save course.");
      }
    });
  }

  function addLesson() {
    setLessons([
      ...lessons,
      { title: "", ordinal: lessons.length + 1, kind: "READING", content: "", videoUrl: "", durationMinutes: undefined },
    ]);
  }

  function removeLesson(index: number) {
    if (lessons.length <= 1) return;
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, ordinal: i + 1 })));
  }

  function updateLesson(index: number, field: string, value: string | number | undefined) {
    setLessons(lessons.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Course Desk</span>
        </Link>

        <Link
          href="/courses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
        >
          <span>View Public Catalog</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Success banner */}
      {false && (
        <div
          role="alert"
          className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-6 sm:p-8 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-emerald-950">
                Course Saved Successfully!
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {generalError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
              Basic Information
            </h2>
            <p className="text-xs text-body mt-0.5">
              Core course details displayed in the catalog and on the course page.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-navy">
                  Course Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)) {
                      generateSlug();
                    }
                  }}
                  placeholder="e.g. Full-Stack Web Development"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.title ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-red-600">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="block text-xs font-semibold text-navy">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. full-stack-web-development"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.slug ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.slug && (
                  <p className="text-[11px] text-red-600">{formErrors.slug[0]}</p>
                )}
                <p className="text-[11px] text-navy/50">Lowercase, numbers, hyphens only</p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label htmlFor="summary" className="block text-xs font-semibold text-navy">
                Summary (Catalog Card)
              </label>
              <textarea
                id="summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description shown on course cards (max 300 chars)"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold text-navy">
                Full Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed course description shown on the course page (markdown supported)"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>

            {/* Level, Price, Publish */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="level" className="block text-xs font-semibold text-navy">
                  Difficulty Level
                </label>
                <input
                  id="level"
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g. Beginner, Intermediate, Advanced"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pricePaise" className="block text-xs font-semibold text-navy">
                  Price (INR)
                </label>
                <input
                  id="pricePaise"
                  type="number"
                  min="0"
                  step="1"
                  value={pricePaise}
                  onChange={(e) => setPricePaise(e.target.valueAsNumber || 0)}
                  placeholder="0 for free"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
                <p className="text-[11px] text-navy/50">Stored in paise (₹1 = 100 paise)</p>
              </div>

              <div className="space-y-1.5 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="text-xs font-medium text-navy">Publish immediately</span>
                </label>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-1.5">
              <label htmlFor="prerequisites" className="block text-xs font-semibold text-navy">
                Prerequisites (one per line)
              </label>
              <textarea
                id="prerequisites"
                rows={3}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="e.g.
Basic JavaScript knowledge
Familiarity with React
Node.js installed"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 font-mono focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 pb-4">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
                Lessons & Curriculum
              </h2>
              <p className="text-xs text-body mt-0.5">
                Add lessons in sequence. Each lesson can be reading, video, quiz, assignment, or code lab.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLesson} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Lesson</span>
            </Button>
          </div>

          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div
                key={`${lesson.title}-${index}`}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy/50 font-mono text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor={`lesson-${index}-title`} className="block text-xs font-semibold text-navy">
                          Lesson Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`lesson-${index}-title`}
                          type="text"
                          required
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, "title", e.target.value)}
                          placeholder="e.g. Introduction to React Hooks"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                            formErrors[`lessons[${index}].title`] ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                          }`}
                        />
                        {formErrors[`lessons[${index}].title`] && (
                          <p className="text-[11px] text-red-600">{formErrors[`lessons[${index}].title`][0]}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={`lesson-${index}-kind`} className="block text-xs font-semibold text-navy">
                          Type
                        </label>
                        <select
                          id={`lesson-${index}-kind`}
                          value={lesson.kind}
                          onChange={(e) => updateLesson(index, "kind", e.target.value)}
                          className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
                        >
                          {LESSON_KINDS.map((k) => (
                            <option key={k.value} value={k.value}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor={`lesson-${index}-content`} className="block text-xs font-semibold text-navy">
                          Content (Markdown)
                        </label>
                        <textarea
                          id={`lesson-${index}-content`}
                          rows={3}
                          value={lesson.content ?? ""}
                          onChange={(e) => updateLesson(index, "content", e.target.value)}
                          placeholder="Lesson content in markdown format..."
                          className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 font-mono focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                        />
                      </div>

                      {lesson.kind === "VIDEO" && (
                        <div className="space-y-1.5">
                          <label htmlFor={`lesson-${index}-videoUrl`} className="block text-xs font-semibold text-navy">
                            Video URL
                          </label>
                          <input
                            id={`lesson-${index}-videoUrl`}
                            type="url"
                            value={lesson.videoUrl ?? ""}
                            onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor={`lesson-${index}-duration`} className="block text-xs font-semibold text-navy">
                          Duration (min)
                        </label>
                        <input
                          id={`lesson-${index}-duration`}
                          type="number"
                          min="1"
                          value={lesson.durationMinutes ?? ""}
                          onChange={(e) => {
                            const val = e.target.valueAsNumber;
                            updateLesson(index, "durationMinutes", isNaN(val) ? undefined : val);
                          }}
                          placeholder="e.g. 30"
                          className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy/10">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(index)}
                        disabled={lessons.length <= 1}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/courses"
            className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="gap-2 text-xs py-2.5 px-6 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            <span>{isEditing ? "Update Course" : "Create Course"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}