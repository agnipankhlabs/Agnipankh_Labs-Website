"use client";

import { useActionState } from "react";
import {
  User,
  GraduationCap,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { updateProfile, type ProfileActionResult } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

interface InitialProfileData {
  fullName: string;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  skills?: string[] | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

interface ProfileFormProps {
  initialData: InitialProfileData;
  userEmail: string;
}

export function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    updateProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-10">
      {/* Alert Banner */}
      {state?.message && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl p-4 text-sm ${
            state.success
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <div>
            <p className="font-semibold">{state.success ? "Success" : "Update Failed"}</p>
            <p className="mt-0.5">{state.message}</p>
          </div>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-brand-ink">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-navy">Personal Details</h2>
            <p className="text-xs text-body">Basic identity and contact information.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-navy">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={initialData.fullName}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.fullName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.fullName[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              disabled
              value={userEmail}
              className="mt-1.5 block w-full cursor-not-allowed rounded-xl border border-navy/10 bg-muted/40 px-3.5 py-2.5 text-sm text-body/80 shadow-xs"
            />
            <p className="mt-1 text-xs text-body/70">Email cannot be changed directly.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-navy">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+919876543210"
              defaultValue={initialData.phone ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-navy">
              Professional Headline
            </label>
            <input
              id="headline"
              name="headline"
              type="text"
              placeholder="e.g. Aspiring Full-Stack Developer | Final Year BCA"
              defaultValue={initialData.headline ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.headline && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.headline[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-navy">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={initialData.city ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-navy">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              defaultValue={initialData.state ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-navy">
              Short Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Tell us about your learning goals and engineering interests..."
              defaultValue={initialData.bio ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.bio && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.bio[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Academic Background */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-royal-ink">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-navy">Academic Background</h2>
            <p className="text-xs text-body">College and degree credentials for internship eligibility.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="college" className="block text-sm font-medium text-navy">
              College / University / Institution
            </label>
            <input
              id="college"
              name="college"
              type="text"
              placeholder="e.g. Pune Institute of Computer Technology"
              defaultValue={initialData.college ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>

          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-navy">
              Degree Program
            </label>
            <input
              id="degree"
              name="degree"
              type="text"
              placeholder="e.g. B.Tech / BE / BCA / MCA / BSc CS"
              defaultValue={initialData.degree ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-navy">
              Branch / Specialization
            </label>
            <input
              id="branch"
              name="branch"
              type="text"
              placeholder="e.g. Computer Engineering / Information Tech"
              defaultValue={initialData.branch ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>

          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-navy">
              Graduation Year
            </label>
            <input
              id="graduationYear"
              name="graduationYear"
              type="number"
              min={2000}
              max={2035}
              placeholder="2026"
              defaultValue={initialData.graduationYear ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Skills & Technology */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-brand-ink">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-navy">Skills & Technical Stack</h2>
            <p className="text-xs text-body">Comma-separated technologies you have worked with or are learning.</p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="skills" className="block text-sm font-medium text-navy">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Git"
            defaultValue={initialData.skills ? initialData.skills.join(", ") : ""}
            className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
          />
          <p className="mt-2 text-xs text-body/80">
            These will be displayed on your profile and matched with internship domain prerequisites.
          </p>
        </div>
      </section>

      {/* Section 4: Social & Portfolio Links */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-navy">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-navy">Online Presence & Portfolios</h2>
            <p className="text-xs text-body">Public links to evaluate your code, repositories, and experience.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-navy">
              GitHub Profile URL
            </label>
            <input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/username"
              defaultValue={initialData.githubUrl ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.githubUrl && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.githubUrl[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-navy">
              LinkedIn Profile URL
            </label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/username"
              defaultValue={initialData.linkedinUrl ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
            {state?.fieldErrors?.linkedinUrl && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.linkedinUrl[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="portfolioUrl" className="block text-sm font-medium text-navy">
              Personal Portfolio / Website
            </label>
            <input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              placeholder="https://yourportfolio.dev"
              defaultValue={initialData.portfolioUrl ?? ""}
              className="mt-1.5 block w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
            />
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="min-w-40"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
}
