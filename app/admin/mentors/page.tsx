import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  User,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  LayoutDashboard,
  ChevronRight,
  LogOut,
  Plus,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import {
  getAdminMentors,
  getAdminMentorStats,
} from "@/lib/admin-mentors";
import { AdminMentorFilters } from "@/components/admin/mentor-filters";
import { AdminMentorList } from "@/components/admin/mentor-list";

export const metadata: Metadata = {
  title: "Mentor Management — Admin | Agnipankh Labs",
  description:
    "Manage mentor profiles, approvals, evaluations, and cohort assignments.",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminMentorsPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/mentors");
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

  const params = await searchParams;
  const activeStatus = params.status ?? "ALL";
  const searchQuery = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 20;

  const [stats, { mentors, total }] = await Promise.all([
    getAdminMentorStats(),
    getAdminMentors({
      approvalStatus: activeStatus,
      search: searchQuery,
      page,
      pageSize,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Admin Operations Top Bar */}
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
              <span className="font-semibold text-navy">
                Mentor Management
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <User className="h-3.5 w-3.5 text-brand-ink" />
                <span>Mentor Desk</span>
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
        <Container className="space-y-8">
          {/* Header Title + Create CTA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink mb-1">
                <User className="h-3.5 w-3.5" />
                <span>Mentor Management & Evaluation</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                Mentor Management Desk
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-body max-w-2xl">
                Manage mentor profiles, approvals, evaluations, and cohort assignments.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/mentors/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Mentor</span>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-body">
                Total Mentors
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-navy">
                {stats.total}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                Pending Approval
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-amber-950">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Approved
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">
                {stats.approved}
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-800">
                Rejected
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-red-950">
                {stats.rejected}
              </p>
            </div>
          </div>

          {/* Additional stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                Active Cohorts
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-blue-950">
                {stats.totalCohorts}
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-800">
                Total Reviews
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-purple-950">
                {stats.totalReviews}
              </p>
            </div>
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-yellow-800">
                Total Reviews Submitted
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-yellow-950">
                {stats.totalReviews}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                Avg Evaluation Score
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-indigo-950">
                {stats.avgScore !== null ? `${stats.avgScore}/100` : "—"}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
            <AdminMentorFilters
              activeStatus={activeStatus}
              searchQuery={searchQuery}
            />
          </Suspense>

          {/* Mentors List */}
          <AdminMentorList mentors={mentors} />
        </Container>
      </main>
    </div>
  );
}