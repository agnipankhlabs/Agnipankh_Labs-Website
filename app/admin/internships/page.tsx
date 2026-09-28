import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Briefcase,
  Plus,
  BarChart3,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import {
  getAdminInternships,
  getAdminInternshipStats,
} from "@/lib/admin-internships";
import { AdminInternshipFilters } from "@/components/admin/internship-filters";
import { AdminInternshipList } from "@/components/admin/internship-list";

export const metadata: Metadata = {
  title: "Internship Management Desk — Admin | Agnipankh Labs",
  description:
    "Create, configure, publish, and manage domain tracks, syllabi, prerequisites, and intake capacity.",
};

interface PageProps {
  searchParams: Promise<{
    domain?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function AdminInternshipsPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/internships");
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
  const activeDomain = params.domain ?? "ALL";
  const activeStatus = params.status ?? "ALL";
  const searchQuery = params.q ?? "";

  const [stats, internships] = await Promise.all([
    getAdminInternshipStats(),
    getAdminInternships({
      domain: activeDomain,
      status: activeStatus,
      search: searchQuery,
    }),
  ]);

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
                Internship Management Desk
              </span>
            </div>

            {/* Right: Role badge + Sign out */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-ink" />
                <span>Curriculum Operations</span>
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
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Program Curriculum & Taxonomy</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                Internship Tracks & Cohorts
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-body max-w-2xl">
                Configure syllabus masteries, prerequisites, delivery format,
                and publish status across all 6 verified engineering and business domains.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/applications"
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Review Applications</span>
              </Link>
              <Link
                href="/admin/internships/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Track</span>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-body">
                Total Tracks
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-navy">
                {stats.total}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Published & Active
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">
                {stats.published}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                Drafts
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-amber-950">
                {stats.drafts}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                Total Applications
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-blue-950">
                {stats.totalApplications}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
            <AdminInternshipFilters
              activeDomain={activeDomain}
              activeStatus={activeStatus}
              searchQuery={searchQuery}
            />
          </Suspense>

          {/* Tracks List */}
          <AdminInternshipList internships={internships} />
        </Container>
      </main>
    </div>
  );
}
