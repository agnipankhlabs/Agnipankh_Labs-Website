"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { AdminInternshipRecord } from "@/lib/admin-internships";
import {
  createInternshipAction,
  updateInternshipAction,
  type InternshipActionResult,
} from "@/app/actions/admin-internships";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS, type InternshipDomain } from "@/content/internships";

interface InternshipFormProps {
  initialData?: Partial<AdminInternshipRecord>;
  mode: "create" | "edit";
  trackId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function InternshipForm({
  initialData,
  mode,
  trackId,
}: InternshipFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [domain, setDomain] = useState(initialData?.domain ?? "WEB_DEVELOPMENT");
  const [roleTitle, setRoleTitle] = useState(initialData?.roleTitle ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [durationMonths, setDurationMonths] = useState(
    initialData?.durationMonths ?? 2
  );
  const [deliveryMode, setDeliveryMode] = useState(initialData?.mode ?? "ONLINE");
  const [feeRupees, setFeeRupees] = useState(
    initialData?.feePaise ? Math.floor(initialData.feePaise / 100) : 0
  );
  const [learningObjectives, setLearningObjectives] = useState(
    initialData?.learningObjectives?.join("\n") ?? ""
  );
  const [skillRequirements, setSkillRequirements] = useState(
    initialData?.skillRequirements?.join("\n") ?? ""
  );
  const [completionCriteria, setCompletionCriteria] = useState(
    initialData?.completionCriteria ?? ""
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ?? false
  );

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleAutoSlug() {
    if (title.trim()) {
      setSlug(slugify(title));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("domain", domain);
    formData.set("roleTitle", roleTitle);
    formData.set("summary", summary);
    formData.set("description", description);
    formData.set("durationMonths", String(durationMonths));
    formData.set("mode", deliveryMode);
    formData.set("feePaise", String(feeRupees * 100));
    formData.set("learningObjectives", learningObjectives);
    formData.set("skillRequirements", skillRequirements);
    formData.set("completionCriteria", completionCriteria);
    formData.set("isPublished", isPublished ? "true" : "false");

    startTransition(async () => {
      let res: InternshipActionResult;
      if (mode === "create") {
        res = await createInternshipAction(null, formData);
      } else if (trackId) {
        res = await updateInternshipAction(trackId, null, formData);
      } else {
        setGeneralError("Track ID missing.");
        return;
      }

      if (res.success) {
        setSuccessMessage(res.message ?? "Internship saved successfully!");
        setTimeout(() => {
          router.push("/admin/internships");
          router.refresh();
        }, 1200);
      } else {
        if (res.fieldErrors) {
          setFormErrors(res.fieldErrors);
        }
        setGeneralError(res.message ?? "Please fix the validation errors.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header / Return link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/internships"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Internship Tracks Desk</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/internships"
            className="rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-medium text-navy hover:bg-muted/40 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="gap-2 text-xs py-2 px-5 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{mode === "create" ? "Create Track" : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center gap-2 shadow-2xs"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage} Redirecting to tracks catalog…</span>
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

      {/* Basic Program Identity Card */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-navy/10 pb-4">
          <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
            1. Basic Program Identity
          </h2>
          <p className="text-xs text-body mt-0.5">
            Core track metadata, URL endpoint slug, and domain taxonomy classification.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-navy"
            >
              Program Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack Web Development Track"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                formErrors.title ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.title && (
              <p className="text-[11px] text-red-600">{formErrors.title[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="slug"
                className="block text-xs font-semibold text-navy"
              >
                URL Slug <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-ink hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                <span>Auto-generate from Title</span>
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-navy/15 bg-muted/20 px-3 text-xs text-body focus-within:border-brand-ink focus-within:bg-white focus-within:outline-2 focus-within:outline-brand-ink">
              <span className="text-navy/50 shrink-0 select-none">
                /internships/
              </span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="full-stack-web-development"
                className="w-full bg-transparent px-1.5 py-2.5 text-xs font-mono font-medium text-navy placeholder:text-navy/40 focus:outline-none"
              />
            </div>
            {formErrors.slug && (
              <p className="text-[11px] text-red-600">{formErrors.slug[0]}</p>
            )}
          </div>

          {/* Domain Track */}
          <div className="space-y-1.5">
            <label
              htmlFor="domain"
              className="block text-xs font-semibold text-navy"
            >
              Domain Track <span className="text-red-600">*</span>
            </label>
            <select
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value as InternshipDomain)}
              className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
            >
              {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Role Designation */}
          <div className="space-y-1.5">
            <label
              htmlFor="roleTitle"
              className="block text-xs font-semibold text-navy"
            >
              Candidate Role Title <span className="text-red-600">*</span>
            </label>
            <input
              id="roleTitle"
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Junior Full-Stack Engineering Intern"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                formErrors.roleTitle ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.roleTitle && (
              <p className="text-[11px] text-red-600">{formErrors.roleTitle[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery & Schedule Settings */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-navy/10 pb-4">
          <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
            2. Delivery & Schedule Configuration
          </h2>
          <p className="text-xs text-body mt-0.5">
            Configure delivery format, cohort duration, and pricing structure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Delivery Mode */}
          <div className="space-y-1.5">
            <label
              htmlFor="mode"
              className="block text-xs font-semibold text-navy"
            >
              Delivery Mode <span className="text-red-600">*</span>
            </label>
            <select
              id="mode"
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value as "ONLINE" | "OFFLINE" | "HYBRID")}
              className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
            >
              <option value="ONLINE">Remote / Online</option>
              <option value="HYBRID">Hybrid</option>
              <option value="OFFLINE">In-Person / Onsite</option>
            </select>
          </div>

          {/* Duration Months */}
          <div className="space-y-1.5">
            <label
              htmlFor="durationMonths"
              className="block text-xs font-semibold text-navy"
            >
              Duration (Months) <span className="text-red-600">*</span>
            </label>
            <input
              id="durationMonths"
              type="number"
              min={1}
              max={12}
              required
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy focus:outline-2 focus:outline-brand-ink ${
                formErrors.durationMonths ? "border-red-500" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.durationMonths && (
              <p className="text-[11px] text-red-600">{formErrors.durationMonths[0]}</p>
            )}
          </div>

          {/* Fee in Rupees */}
          <div className="space-y-1.5">
            <label
              htmlFor="feeRupees"
              className="block text-xs font-semibold text-navy"
            >
              Program Fee (INR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy/50">
                ₹
              </span>
              <input
                id="feeRupees"
                type="number"
                min={0}
                value={feeRupees}
                onChange={(e) => setFeeRupees(Number(e.target.value))}
                placeholder="0 for zero tuition"
                className="w-full rounded-xl border border-navy/15 bg-white pl-8 pr-3.5 py-2.5 text-xs text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
            </div>
            <p className="text-[10px] text-body">
              {feeRupees === 0 ? "Zero tuition fee (Free training)" : "Paid tuition track"}
            </p>
          </div>
        </div>
      </div>

      {/* Program Summary & Description */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-navy/10 pb-4">
          <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
            3. Program Description & Marketing Summary
          </h2>
          <p className="text-xs text-body mt-0.5">
            Displayed on public catalog cards and track detail pages.
          </p>
        </div>

        {/* Short Summary */}
        <div className="space-y-1.5">
          <label
            htmlFor="summary"
            className="block text-xs font-semibold text-navy"
          >
            Catalog Summary (Short Overview) <span className="text-red-600">*</span>
          </label>
          <textarea
            id="summary"
            rows={2}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief 1-2 sentence description displayed on internship track cards…"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              formErrors.summary ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {formErrors.summary && (
            <p className="text-[11px] text-red-600">{formErrors.summary[0]}</p>
          )}
        </div>

        {/* Full Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-navy"
          >
            Detailed Track Narrative & Overview <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Full paragraph breakdown explaining cohort sprints, mentor code reviews, project architecture, and capstone deployment…"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              formErrors.description ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {formErrors.description && (
            <p className="text-[11px] text-red-600">{formErrors.description[0]}</p>
          )}
        </div>
      </div>

      {/* Curriculum & Prerequisites */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-navy/10 pb-4">
          <h2 className="font-heading text-base sm:text-lg font-bold text-navy">
            4. Curriculum Masteries & Prerequisites
          </h2>
          <p className="text-xs text-body mt-0.5">
            Enter each learning objective and skill prerequisite on a new line.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Learning Objectives */}
          <div className="space-y-1.5">
            <label
              htmlFor="learningObjectives"
              className="block text-xs font-semibold text-navy"
            >
              Key Learning Objectives (One per line) <span className="text-red-600">*</span>
            </label>
            <textarea
              id="learningObjectives"
              rows={6}
              required
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              placeholder={`Master component architecture in React & Next.js\nDesign RESTful APIs and Prisma ORM schemas\nImplement CI/CD automated deployment pipelines`}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 font-mono focus:outline-2 focus:outline-brand-ink ${
                formErrors.learningObjectives ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.learningObjectives && (
              <p className="text-[11px] text-red-600">{formErrors.learningObjectives[0]}</p>
            )}
          </div>

          {/* Skill Requirements */}
          <div className="space-y-1.5">
            <label
              htmlFor="skillRequirements"
              className="block text-xs font-semibold text-navy"
            >
              Skill Prerequisites (One per line) <span className="text-red-600">*</span>
            </label>
            <textarea
              id="skillRequirements"
              rows={6}
              required
              value={skillRequirements}
              onChange={(e) => setSkillRequirements(e.target.value)}
              placeholder={`Basic programming fundamentals in JavaScript/TypeScript\nFamiliarity with Git and terminal commands\nUnderstanding of HTML5 and CSS box model`}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 font-mono focus:outline-2 focus:outline-brand-ink ${
                formErrors.skillRequirements ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.skillRequirements && (
              <p className="text-[11px] text-red-600">{formErrors.skillRequirements[0]}</p>
            )}
          </div>

          {/* Completion Criteria */}
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="completionCriteria"
              className="block text-xs font-semibold text-navy"
            >
              Completion & Certification Criteria <span className="text-red-600">*</span>
            </label>
            <textarea
              id="completionCriteria"
              rows={3}
              required
              value={completionCriteria}
              onChange={(e) => setCompletionCriteria(e.target.value)}
              placeholder="e.g. 100% attendance in milestone checkpoints, approved Git PR code review by mentor, and live production deployment of the capstone project."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                formErrors.completionCriteria ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
              }`}
            />
            {formErrors.completionCriteria && (
              <p className="text-[11px] text-red-600">{formErrors.completionCriteria[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Publication State & Confirmation */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
          />
          <div>
            <span className="text-xs font-bold text-navy">
              Publish Track to Public Catalog Immediately
            </span>
            <p className="text-[11px] text-body mt-0.5 leading-relaxed">
              When checked, this track will immediately appear on <code>/internships</code> for student applications. If unchecked, it will be saved as a draft visible only to administrators.
            </p>
          </div>
        </label>
      </div>

      {/* Bottom Submit Row */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/internships"
          className="rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-xs font-medium text-navy hover:bg-muted/40 transition-colors"
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
            <Save className="h-4 w-4" />
          )}
          <span>{mode === "create" ? "Create & Publish Track" : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
}
