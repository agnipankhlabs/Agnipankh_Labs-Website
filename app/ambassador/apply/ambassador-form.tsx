"use client";

import { useActionState, useTransition } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { submitAmbassadorApplicationAction } from "@/app/actions/ambassador-application";
import { type FormState } from "@/lib/validation/forms";

export function AmbassadorApplicationForm() {
  const [state, formAction] = useActionState(submitAmbassadorApplicationAction, {
    status: "idle",
  } as FormState);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      formAction(formData);
    });
  }

  const fieldErrors: Record<string, string[]> | undefined =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={handleSubmit} className="space-y-6">
      {state.status === "success" && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 flex items-center gap-2 shadow-2xs"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <svg className="h-5 w-5 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-semibold text-navy">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              fieldErrors?.name ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {fieldErrors?.name && <p className="text-[11px] text-red-600">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-navy">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@college.edu"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              fieldErrors?.email ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {fieldErrors?.email && <p className="text-[11px] text-red-600">{fieldErrors.email[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-xs font-semibold text-navy">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              fieldErrors?.phone ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {fieldErrors?.phone && <p className="text-[11px] text-red-600">{fieldErrors.phone[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="college" className="block text-xs font-semibold text-navy">
            College/University Name <span className="text-red-600">*</span>
          </label>
          <input
            id="college"
            name="college"
            type="text"
            required
            placeholder="e.g. IIT Bombay, VIT Vellore, etc."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              fieldErrors?.college ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {fieldErrors?.college && <p className="text-[11px] text-red-600">{fieldErrors.college[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="course" className="block text-xs font-semibold text-navy">
            Course/Program <span className="text-red-600">*</span>
          </label>
          <input
            id="course"
            name="course"
            type="text"
            required
            placeholder="e.g. B.Tech CSE, MCA, MBA, etc."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
              fieldErrors?.course ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
            }`}
          />
          {fieldErrors?.course && <p className="text-[11px] text-red-600">{fieldErrors.course[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="year" className="block text-xs font-semibold text-navy">
            Current Year <span className="text-red-600">*</span>
          </label>
          <select
            id="year"
            name="year"
            required
            className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year / Postgraduate</option>
          </select>
          {fieldErrors?.year && <p className="text-[11px] text-red-600">{fieldErrors.year[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="linkedin" className="block text-xs font-semibold text-navy">
            LinkedIn Profile
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourname"
            className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="github" className="block text-xs font-semibold text-navy">
            GitHub Profile
          </label>
          <input
            id="github"
            name="github"
            type="url"
            placeholder="https://github.com/yourname"
            className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="motivation" className="block text-xs font-semibold text-navy">
          Why do you want to be a Campus Ambassador? <span className="text-red-600">*</span>
        </label>
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          required
          placeholder="Tell us about your leadership experience, campus involvement, and why you'd be a great ambassador..."
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 font-mono focus:border-brand-ink focus:outline-2 focus:outline-brand-ink ${
            fieldErrors?.motivation ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
          }`}
        />
        {fieldErrors?.motivation && <p className="text-[11px] text-red-600">{fieldErrors.motivation[0]}</p>}
        <p className="text-[11px] text-navy/50">Minimum 100 characters. Share your vision and ideas.</p>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            name="consent"
            type="checkbox"
            required
            value="on"
            className="mt-1 rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
          />
          <span className="text-sm text-body">
            I agree to the{" "}
            <Link href="/terms" className="underline hover:text-brand-ink">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-brand-ink">Privacy Policy</Link>.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full gap-2 py-3 text-sm font-semibold"
      >
        {isPending ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" strokeLinecap="round" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <ArrowRight className="h-5 w-5" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  );
}
