"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  submitApplicationAction,
  type ApplicationActionResult,
} from "@/app/actions/application";
import type { InternshipTrack } from "@/content/internships";
import { MODE_LABELS } from "@/content/internships";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Label, Input, Textarea, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function InternshipApplyForm({
  track,
  defaultValues,
}: {
  track: InternshipTrack;
  defaultValues?: {
    fullName?: string;
    phone?: string;
    college?: string;
    degree?: string;
    branch?: string;
    graduationYear?: number | null;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<
    ApplicationActionResult | null,
    FormData
  >(submitApplicationAction, null);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-bold text-emerald-950">
          Application Successfully Received!
        </h2>
        <p className="mt-2 text-sm text-emerald-900/80 max-w-md mx-auto">
          Your application for the <strong>{track.title}</strong> cohort is registered. Our admissions desk will review your academic qualifications.
        </p>

        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
          >
            <span>Track Application on Dashboard</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-50 transition-colors"
          >
            <span>Browse More Tracks</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <input type="hidden" name="internshipSlug" value={track.slug} />

      {/* Cohort Brief Card */}
      <div className="rounded-2xl border border-navy/10 bg-muted/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-ink">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cohort Track</span>
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
            Zero Tuition Lock-In
          </span>
        </div>
        <h2 className="mt-3 font-heading text-xl font-bold text-navy">
          {track.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-navy/80">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-ink" />
            <span>{track.durationMonths} Months Duration</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Laptop className="h-4 w-4 text-royal-ink" />
            <span>{MODE_LABELS[track.mode]} Delivery</span>
          </span>
          <span className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-emerald-700" />
            <span>Designation: {track.roleTitle}</span>
          </span>
        </div>
      </div>

      {/* Top error alert */}
      {state && !state.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Application Submission Error</p>
            <p className="mt-0.5 text-xs text-red-700">{state.message}</p>
          </div>
        </div>
      )}

      {/* Section 1: Candidate Information */}
      <div className="space-y-5">
        <h3 className="font-heading text-base font-bold text-navy border-b border-navy/10 pb-2">
          1. Candidate Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName" required>
              Full Legal Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={defaultValues?.fullName ?? ""}
              placeholder="e.g. Priya Sharma"
              required
              aria-invalid={Boolean(state?.fieldErrors?.fullName)}
              className="mt-1.5"
            />
            <FieldError id="fullName-error" errors={state?.fieldErrors?.fullName} />
          </div>

          <div>
            <Label htmlFor="phone" required>
              Mobile / WhatsApp Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaultValues?.phone ?? ""}
              placeholder="10-digit mobile number (e.g. 9876543210)"
              required
              aria-invalid={Boolean(state?.fieldErrors?.phone)}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-body">Used strictly for cohort alerts & onboarding notices.</p>
            <FieldError id="phone-error" errors={state?.fieldErrors?.phone} />
          </div>
        </div>
      </div>

      {/* Section 2: Educational Background */}
      <div className="space-y-5">
        <h3 className="font-heading text-base font-bold text-navy border-b border-navy/10 pb-2">
          2. Educational Background
        </h3>

        <div>
          <Label htmlFor="college" required>
            College / University Name
          </Label>
          <Input
            id="college"
            name="college"
            defaultValue={defaultValues?.college ?? ""}
            placeholder="e.g. Delhi Technological University, NIT Trichy, etc."
            required
            aria-invalid={Boolean(state?.fieldErrors?.college)}
            className="mt-1.5"
          />
          <FieldError id="college-error" errors={state?.fieldErrors?.college} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="degree" required>
              Degree / Program
            </Label>
            <Input
              id="degree"
              name="degree"
              defaultValue={defaultValues?.degree ?? ""}
              placeholder="e.g. B.Tech / BCA / MCA"
              required
              aria-invalid={Boolean(state?.fieldErrors?.degree)}
              className="mt-1.5"
            />
            <FieldError id="degree-error" errors={state?.fieldErrors?.degree} />
          </div>

          <div>
            <Label htmlFor="branch" required>
              Branch / Specialization
            </Label>
            <Input
              id="branch"
              name="branch"
              defaultValue={defaultValues?.branch ?? ""}
              placeholder="e.g. Computer Science"
              required
              aria-invalid={Boolean(state?.fieldErrors?.branch)}
              className="mt-1.5"
            />
            <FieldError id="branch-error" errors={state?.fieldErrors?.branch} />
          </div>

          <div>
            <Label htmlFor="graduationYear" required>
              Graduation Year
            </Label>
            <Input
              id="graduationYear"
              name="graduationYear"
              type="number"
              min={2020}
              max={2032}
              defaultValue={defaultValues?.graduationYear ?? 2026}
              placeholder="2026"
              required
              aria-invalid={Boolean(state?.fieldErrors?.graduationYear)}
              className="mt-1.5"
            />
            <FieldError id="graduationYear-error" errors={state?.fieldErrors?.graduationYear} />
          </div>
        </div>
      </div>

      {/* Section 3: Technical Background & Links */}
      <div className="space-y-5">
        <h3 className="font-heading text-base font-bold text-navy border-b border-navy/10 pb-2">
          3. Technical Profile & Repository Links (Optional)
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="githubUrl">GitHub Profile URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              defaultValue={defaultValues?.githubUrl ?? ""}
              placeholder="https://github.com/yourhandle"
              className="mt-1.5"
            />
            <FieldError id="githubUrl-error" errors={state?.fieldErrors?.githubUrl} />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              defaultValue={defaultValues?.linkedinUrl ?? ""}
              placeholder="https://linkedin.com/in/yourhandle"
              className="mt-1.5"
            />
            <FieldError id="linkedinUrl-error" errors={state?.fieldErrors?.linkedinUrl} />
          </div>

          <div>
            <Label htmlFor="portfolioUrl">Portfolio or Project Link</Label>
            <Input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              defaultValue={defaultValues?.portfolioUrl ?? ""}
              placeholder="https://yourwork.dev"
              className="mt-1.5"
            />
            <FieldError id="portfolioUrl-error" errors={state?.fieldErrors?.portfolioUrl} />
          </div>
        </div>

        <div>
          <Label htmlFor="statementOfPurpose" required>
            Statement of Purpose / Why do you want to join this track?
          </Label>
          <p className="mt-0.5 text-xs text-body">
            Describe your interest in {track.title}, any prior projects or coursework, and what skills you wish to build during this internship.
          </p>
          <Textarea
            id="statementOfPurpose"
            name="statementOfPurpose"
            placeholder="I am applying to this cohort because..."
            required
            rows={4}
            aria-invalid={Boolean(state?.fieldErrors?.statementOfPurpose)}
            className="mt-2"
          />
          <FieldError id="statementOfPurpose-error" errors={state?.fieldErrors?.statementOfPurpose} />
        </div>
      </div>

      {/* Section 4: Mandatory Acknowledgements */}
      <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-5">
        <h3 className="font-heading text-sm font-bold text-navy">
          4. Statutory Declarations & Code of Conduct
        </h3>

        {/* Checkbox 1: Code of Conduct */}
        <div className="flex items-start gap-3">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
          />
          <label htmlFor="agreeTerms" className="text-xs text-body leading-relaxed">
            I agree to actively participate in cohort reviews, adhere to the{" "}
            <Link href="/terms" className="font-medium text-brand-ink underline" target="_blank">
              Terms of Service
            </Link>
            , and submit capstone milestone tasks honestly without plagiarism.
          </label>
        </div>
        <FieldError id="agreeTerms-error" errors={state?.fieldErrors?.agreeTerms} />

        {/* Checkbox 2: Statutory No-Guarantee Disclaimer */}
        <div className="flex items-start gap-3">
          <input
            id="agreeDisclaimer"
            name="agreeDisclaimer"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-navy/30 text-brand-ink focus:ring-brand-ink"
          />
          <label htmlFor="agreeDisclaimer" className="text-xs text-body leading-relaxed">
            <strong>Mandatory Consumer Protection Notice:</strong> {NO_GUARANTEE_DISCLAIMER}
          </label>
        </div>
        <FieldError id="agreeDisclaimer-error" errors={state?.fieldErrors?.agreeDisclaimer} />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-navy/10">
        <p className="text-xs text-body">
          <ShieldCheck className="inline h-4 w-4 text-emerald-700 mr-1" />
          Encrypted & protected per Digital Personal Data Protection (DPDP) Act, 2023.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full sm:w-auto gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Submit Internship Application</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
