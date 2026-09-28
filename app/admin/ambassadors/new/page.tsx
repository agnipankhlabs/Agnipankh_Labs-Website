import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Users,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Sparkles,
  Award,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { createAmbassadorAction } from "@/app/actions/admin-ambassadors";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Add Ambassador — Admin | Agnipankh Labs",
  description: "Add a new campus ambassador with referral code.",
};

export default async function NewAmbassadorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/ambassadors/new");
  }

  const userRoles =
    (session.user as unknown as { roles?: string[] }).roles ?? [];
  const isAdmin =
    userRoles.includes("admin") ||
    userRoles.includes("super_admin") ||
    userRoles.includes("trainer");

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md">
        <Container>
          <div className="flex h-14 items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <Link
                href="/admin/ambassadors"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Ambassadors</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Add Ambassador</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Sparkles className="h-3.5 w-3.5 text-brand-ink" />
                <span>Ambassador Editor</span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1 text-xs font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-8 sm:pt-10">
        <Container className="space-y-6">
          <div className="max-w-5xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ambassador Editor</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Add New Ambassador
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Create a new campus ambassador with referral tracking.
            </p>
          </div>

          <AmbassadorForm />
        </Container>
      </main>
    </div>
  );
}

function AmbassadorForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [tier, setTier] = useState("TIER_1");
  const [status, setStatus] = useState("PENDING");
  const [referralCode, setReferralCode] = useState("");
  const [isSenior, setIsSenior] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    const formData = new FormData();
    formData.set("userId", userId);
    if (collegeId) formData.set("collegeId", collegeId);
    formData.set("tier", tier);
    formData.set("status", status);
    if (referralCode) formData.set("referralCode", referralCode);
    if (isSenior) formData.set("isSenior", "on");

    startTransition(async () => {
      const res = await createAmbassadorAction(null, formData);
      if (res.success && res.ambassadorId) {
        router.push(`/admin/ambassadors/${res.ambassadorId}/edit`);
      } else {
        if (res.fieldErrors) setFormErrors(res.fieldErrors);
        setGeneralError(res.message ?? "Failed to create ambassador.");
      }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/ambassadors"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Ambassadors</span>
        </Link>
      </div>

      {/* Success/Error */}
      {generalError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <svg className="h-4 w-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Basic Information</h2>
            <p className="text-xs text-body mt-0.5">Required fields marked with *</p>
          </div>

          <div className="space-y-4">
            {/* User ID */}
            <div className="space-y-1.5">
              <label htmlFor="userId" className="block text-xs font-semibold text-navy">
                User ID <span className="text-red-600">*</span>
              </label>
              <input
                id="userId"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="cuid of the user (must exist in database)"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                  formErrors.userId ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                }`}
              />
              {formErrors.userId && (
                <p className="text-[11px] text-red-600">{formErrors.userId[0]}</p>
              )}
              <p className="text-[11px] text-navy/50">Must be an existing user&apos;s CUID from the User table.</p>
            </div>

            {/* College ID */}
            <div className="space-y-1.5">
              <label htmlFor="collegeId" className="block text-xs font-semibold text-navy">
                College ID
              </label>
              <input
                id="collegeId"
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Optional: cuid of college (if affiliated)"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              {formErrors.collegeId && (
                <p className="text-[11px] text-red-600">{formErrors.collegeId[0]}</p>
              )}
              <p className="text-[11px] text-navy/50">Optional. Must be an existing college&apos;s CUID.</p>
            </div>

            {/* Tier */}
            <div className="space-y-1.5">
              <label htmlFor="tier" className="block text-xs font-semibold text-navy">
                Tier <span className="text-red-600">*</span>
              </label>
              <select
                id="tier"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
              >
                <option value="TIER_1">Tier 1 (5+ referrals)</option>
                <option value="TIER_2">Tier 2 (10+ referrals)</option>
                <option value="TIER_3">Tier 3 (25+ referrals)</option>
                <option value="TIER_4">Tier 4 (50+ referrals)</option>
              </select>
              <p className="text-[11px] text-navy/50">Starting tier for the ambassador.</p>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="block text-xs font-semibold text-navy">
                Status <span className="text-red-600">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <p className="text-[11px] text-navy/50">Initial approval status.</p>
            </div>

            {/* Referral Code */}
            <div className="space-y-1.5">
              <label htmlFor="referralCode" className="block text-xs font-semibold text-navy">
                Referral Code
              </label>
              <input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Auto-generated if left empty (e.g. ABC123XY)"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs font-mono text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              {formErrors.referralCode && (
                <p className="text-[11px] text-red-600">{formErrors.referralCode[0]}</p>
              )}
              <p className="text-[11px] text-navy/50">Optional. Auto-generated if left empty. 8 characters, uppercase alphanumeric.</p>
            </div>

            {/* Senior */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSenior}
                  onChange={(e) => setIsSenior(e.target.checked)}
                  className="rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
                />
                <span className="text-xs font-medium text-navy">Senior Ambassador</span>
              </label>
              <p className="text-[11px] text-navy/50 ml-5">Senior ambassadors have additional privileges and higher reward rates.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/ambassadors"
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
              <Users className="h-4 w-4" />
            )}
            <span>Create Ambassador</span>
          </Button>
        </div>
      </form>
    </div>
  );
}