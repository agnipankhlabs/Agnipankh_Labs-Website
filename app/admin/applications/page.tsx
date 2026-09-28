import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import {
  getAdminApplications,
  getAdminApplicationStats,
} from "@/lib/admin-applications";
import { AdminApplicationFilters } from "@/components/admin/application-filters";
import { AdminApplicationList } from "@/components/admin/application-list";

export const metadata: Metadata = {
  title: "Application Review — Admin Desk | Agnipankh Labs",
  description:
    "Admissions operations dashboard for reviewing, advancing, and rejecting internship applications.",
};

interface PageProps {
  searchParams: Promise<{
    stage?: string;
    domain?: string;
    q?: string;
  }>;
}

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/applications");
  }

  const userRoles =
    (session.user as unknown as { roles?: string[] }).roles ?? [];
  const isAdmin =
    userRoles.includes("admin") || userRoles.includes("super_admin");

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const activeStage = params.stage ?? "ALL";
  const activeDomain = params.domain ?? "ALL";
  const searchQuery = params.q ?? "";

  const [applications, stats] = await Promise.all([
    getAdminApplications({
      stage: activeStage,
      domain: activeDomain,
      search: searchQuery,
    }),
    getAdminApplicationStats(),
  ]);

  const adminName = session.user.name ?? "Admin";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin Top Bar */}
      <div className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-body">
            <Link
              href="/admin"
              className="hover:text-navy hover:underline font-semibold text-navy/60"
            >
              Admin
            </Link>
            <ChevronRight className="h-3 w-3 text-navy/30" />
            <span className="font-semibold text-navy">Applications</span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <span>ADMIN</span>
              <span className="text-amber-600">·</span>
              <span>{adminName}</span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 px-3 py-1.5 text-xs font-medium text-navy hover:bg-muted/40 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Learner Dashboard</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 px-3 py-1.5 text-xs font-medium text-navy hover:border-red-300 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <Container className="max-w-7xl py-10 sm:py-14">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            Internship Applications — Review Desk
          </h1>
          <p className="mt-1 text-sm text-body">
            Advance candidates through the 5-stage admissions pipeline, issue
            offer letters, or reject ineligible applications.
          </p>
        </div>

        {/* KPI Stats Strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Total"
            value={stats.total}
            Icon={Users}
            color="navy"
          />
          <StatCard
            label="Received"
            value={stats.byStage?.APPLICATION_RECEIVED ?? 0}
            Icon={Clock}
            color="blue"
          />
          <StatCard
            label="Eligibility"
            value={stats.byStage?.ELIGIBILITY_CHECK ?? 0}
            Icon={Briefcase}
            color="amber"
          />
          <StatCard
            label="Selected"
            value={stats.byStage?.SELECTION_DECISION ?? 0}
            Icon={CheckCircle2}
            color="purple"
          />
          <StatCard
            label="Offer Issued"
            value={stats.byStage?.OFFER_LETTER_ISSUED ?? 0}
            Icon={FileCheck}
            color="emerald"
          />
          <StatCard
            label="Joined"
            value={stats.byStage?.JOINING_CONFIRMATION ?? 0}
            Icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-16 rounded-2xl bg-white animate-pulse" />}>
            <AdminApplicationFilters
              activeStage={activeStage}
              activeDomain={activeDomain}
              searchQuery={searchQuery}
            />
          </Suspense>
        </div>

        {/* Applications List */}
        <AdminApplicationList applications={applications} />
      </Container>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: "navy" | "blue" | "amber" | "purple" | "emerald";
}) {
  const colorMap: Record<
    string,
    { bg: string; icon: string; text: string }
  > = {
    navy: { bg: "bg-navy/5", icon: "text-navy", text: "text-navy" },
    blue: { bg: "bg-blue-50", icon: "text-blue-700", text: "text-blue-900" },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-700",
      text: "text-amber-900",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-700",
      text: "text-purple-900",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-700",
      text: "text-emerald-900",
    },
  };
  const c = colorMap[color] ?? colorMap.navy;

  return (
    <div
      className={`rounded-2xl border border-navy/8 ${c.bg} p-4 shadow-xs flex flex-col gap-2`}
    >
      <Icon className={`h-5 w-5 ${c.icon}`} />
      <p className={`font-heading text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-[11px] font-medium text-body">{label}</p>
    </div>
  );
}
