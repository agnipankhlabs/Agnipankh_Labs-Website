import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Add Mentor — Admin Desk | Agnipankh Labs",
  description:
    "Create a new mentor profile with expertise, experience, and approval workflow.",
};

export default async function NewMentorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/mentors/new");
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
                href="/admin/mentors"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>Mentor Desk</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Add Mentor</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Sparkles className="h-3.5 w-3.5 text-brand-ink" />
                <span>Mentor Onboarding</span>
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
              <span>Mentor Onboarding</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Add New Mentor
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Create a new mentor profile. The mentor will need to be approved before they can be assigned to cohorts.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 text-xs text-amber-900 space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <span className="h-3.5 w-3.5">⚠</span>
              Coming Soon
            </p>
            <p>
              The mentor creation form is under development. This will include fields for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>User account linking (email, name)</li>
              <li>Domain experience and expertise areas</li>
              <li>Years of experience and current employer</li>
              <li>Approval workflow (Pending → Approved/Rejected)</li>
              <li>Cohort assignment after approval</li>
            </ul>
            <p className="mt-2">
              For now, mentors can be created directly in the database or through the mentor application form (MENTOR_APPLICATION lead type).
            </p>
          </div>

          <div className="flex items-center justify-center pt-8 border-t border-navy/10">
            <Link
              href="/admin/mentors"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Back to Mentor Desk</span>
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}