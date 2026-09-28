import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  Mail,
  Users,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import {
  getAdminLeads,
  getAdminLeadStats,
} from "@/lib/admin-leads";
import { AdminLeadFilters } from "@/components/admin/lead-filters";
import { AdminLeadList } from "@/components/admin/lead-list";

export const metadata: Metadata = {
  title: "Lead Management — Admin | Agnipankh Labs",
  description:
    "Manage and track all inbound leads from contact forms, newsletter signups, partnerships, and career enquiries.",
};

interface PageProps {
  searchParams: Promise<{
    kind?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminLeadsPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/leads");
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
  const activeKind = params.kind ?? "ALL";
  const activeStatus = params.status ?? "ALL";
  const searchQuery = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 20;

  const [stats, { leads, total }] = await Promise.all([
    getAdminLeadStats(),
    getAdminLeads({
      kind: activeKind,
      status: activeStatus,
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
              <span className="font-semibold text-navy">Lead Management CRM</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Mail className="h-3.5 w-3.5 text-brand-ink" />
                <span>Lead CRM</span>
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
          {/* Header Title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink mb-1">
                <Mail className="h-3.5 w-3.5" />
                <span>Inbound Lead Management</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                Lead Management CRM
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-body max-w-2xl">
                Track, qualify, and convert inbound leads from all channels — contact forms,
                newsletter signups, partnership enquiries, and career applications.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-body">Total Leads</p>
              <p className="mt-1 font-heading text-2xl font-bold text-navy">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">New</p>
              <p className="mt-1 font-heading text-2xl font-bold text-blue-950">{stats.new}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Contacted</p>
              <p className="mt-1 font-heading text-2xl font-bold text-amber-950">{stats.contacted}</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-800">Qualified</p>
              <p className="mt-1 font-heading text-2xl font-bold text-purple-950">{stats.qualified}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Converted</p>
              <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">{stats.converted}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-800">Closed Lost</p>
              <p className="mt-1 font-heading text-2xl font-bold text-red-950">{stats.closedLost}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
            <AdminLeadFilters
              activeKind={activeKind}
              activeStatus={activeStatus}
              searchQuery={searchQuery}
            />
          </Suspense>

          {/* Leads List */}
          <AdminLeadList
            leads={leads}
            total={total}
            page={page}
            pageSize={pageSize}
          />
        </Container>
      </main>
    </div>
  );
}