import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  CreditCard,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  ChevronRight,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { Container } from "@/components/ui/layout";
import {
  getAdminFinanceStats,
  getAdminPayments,
  getAdminInvoices,
  getAdminExpenses,
  getAdminVendors,
  getRevenueByStream,
  getExpensesByCategory,
} from "@/lib/admin-finance";
import { AdminPaymentFilters } from "@/components/admin/payment-filters";
import { AdminPaymentList } from "@/components/admin/payment-list";
import { AdminInvoiceFilters } from "@/components/admin/invoice-filters";
import { AdminInvoiceList } from "@/components/admin/invoice-list";
import { AdminExpenseFilters } from "@/components/admin/expense-filters";
import { AdminExpenseList } from "@/components/admin/expense-list";
import { AdminVendorFilters } from "@/components/admin/vendor-filters";
import { AdminVendorList } from "@/components/admin/vendor-list";

export const metadata: Metadata = {
  title: "Financial Operations — Admin | Agnipankh Labs",
  description:
    "Manage payments, invoices, expenses, and vendors with approval workflows and GST compliance.",
};

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    revenueStream?: string;
    mode?: string;
    q?: string;
    category?: string;
    approvalTier?: string;
    page?: string;
  }>;
}

export default async function AdminFinancePage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/finance");
  }

  const userRoles =
    (session.user as unknown as { roles?: string[] }).roles ?? [];
  const isAdmin =
    userRoles.includes("admin") ||
    userRoles.includes("super_admin") ||
    userRoles.includes("finance");

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const activeTab = params.tab ?? "payments";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 20;

  const [stats, paymentsData, invoicesData, expensesData, vendorsData, revenueByStream, expensesByCategory] = await Promise.all([
    getAdminFinanceStats(),
    getAdminPayments({
      status: params.status,
      revenueStream: params.revenueStream,
      mode: params.mode,
      search: params.q,
      page,
      pageSize,
    }),
    getAdminInvoices({
      search: params.q,
      page,
      pageSize,
    }),
    getAdminExpenses({
      category: params.category,
      approvalTier: params.approvalTier,
      status: params.status,
      search: params.q,
      page,
      pageSize,
    }),
    getAdminVendors({
      search: params.q,
      page,
      pageSize,
    }),
    getRevenueByStream(),
    getExpensesByCategory(),
  ]);

  const revenueINR = (stats.totalRevenuePaise / 100).toLocaleString("en-IN");
  const pendingINR = (stats.pendingPaymentsPaise / 100).toLocaleString("en-IN");
  const refundedINR = (stats.refundedPaise / 100).toLocaleString("en-IN");
  const expensesINR = (stats.totalExpensesPaise / 100).toLocaleString("en-IN");
  const pendingExpINR = (stats.pendingExpensesPaise / 100).toLocaleString("en-IN");

  // Revenue stream breakdown for chart
  const streamLabels = Object.keys(revenueByStream);
  const streamData = Object.values(revenueByStream);
  const expenseLabels = Object.keys(expensesByCategory);
  const expenseData = Object.values(expensesByCategory);

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
              <span className="font-semibold text-navy">Financial Operations</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <DollarSign className="h-3.5 w-3.5 text-brand-ink" />
                <span>Finance Desk</span>
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
                <DollarSign className="h-3.5 w-3.5" />
                <span>Financial Operations</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                Financial Operations Desk
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-body max-w-2xl">
                Manage payments, invoices, expenses, and vendors with approval workflows and GST compliance.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/finance/payments/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Record Payment</span>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Total Revenue</p>
              <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">₹{revenueINR}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Pending Payments</p>
              <p className="mt-1 font-heading text-2xl font-bold text-amber-950">₹{pendingINR}</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-800">Refunded</p>
              <p className="mt-1 font-heading text-2xl font-bold text-purple-950">₹{refundedINR}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">Total Invoices</p>
              <p className="mt-1 font-heading text-2xl font-bold text-blue-950">{stats.totalInvoices}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-800">Total Expenses</p>
              <p className="mt-1 font-heading text-2xl font-bold text-red-950">₹{expensesINR}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Pending Approval</p>
              <p className="mt-1 font-heading text-2xl font-bold text-amber-950">₹{pendingExpINR}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Approved Expenses</p>
              <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">₹{(stats.approvedExpensesPaise / 100).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-800">Active Vendors</p>
              <p className="mt-1 font-heading text-2xl font-bold text-purple-950">{stats.vendorCount}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-navy/10">
            <nav className="flex flex-wrap gap-1 px-1" role="tablist">
              <Link
                href="/admin/finance?tab=payments"
                role="tab"
                aria-selected={activeTab === "payments"}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                  activeTab === "payments"
                    ? "bg-brand-ink text-white"
                    : "text-navy/60 hover:bg-muted/50"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 inline mr-1" />
                Payments
              </Link>
              <Link
                href="/admin/finance?tab=invoices"
                role="tab"
                aria-selected={activeTab === "invoices"}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                  activeTab === "invoices"
                    ? "bg-brand-ink text-white"
                    : "text-navy/60 hover:bg-muted/50"
                }`}
              >
                <Receipt className="h-3.5 w-3.5 inline mr-1" />
                Invoices
              </Link>
              <Link
                href="/admin/finance?tab=expenses"
                role="tab"
                aria-selected={activeTab === "expenses"}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                  activeTab === "expenses"
                    ? "bg-brand-ink text-white"
                    : "text-navy/60 hover:bg-muted/50"
                }`}
              >
                <FileText className="h-3.5 w-3.5 inline mr-1" />
                Expenses
              </Link>
              <Link
                href="/admin/finance?tab=vendors"
                role="tab"
                aria-selected={activeTab === "vendors"}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                  activeTab === "vendors"
                    ? "bg-brand-ink text-white"
                    : "text-navy/60 hover:bg-muted/50"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 inline mr-1" />
                Vendors
              </Link>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "payments" && (
              <>
                <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
<AdminPaymentFilters
                activeStatus={params.status ?? "ALL"}
                activeStream={params.revenueStream ?? "ALL"}
                activeMode={params.mode ?? "ALL"}
                searchQuery={params.q ?? ""}
              />
                </Suspense>
                <AdminPaymentList
                  payments={paymentsData.payments}
                  total={paymentsData.total}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}

            {activeTab === "invoices" && (
              <>
                <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
                  <AdminInvoiceFilters
                    activeSearch={params.q ?? ""}
                  />
                </Suspense>
                <AdminInvoiceList
                  invoices={invoicesData.invoices}
                  total={invoicesData.total}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}

            {activeTab === "expenses" && (
              <>
                <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
                  <AdminExpenseFilters
                    activeCategory={params.category ?? "ALL"}
                    activeTier={params.approvalTier ?? "ALL"}
                    activeStatus={params.status ?? "ALL"}
                    searchQuery={params.q ?? ""}
                  />
                </Suspense>
                <AdminExpenseList
                  expenses={expensesData.expenses}
                  total={expensesData.total}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}

            {activeTab === "vendors" && (
              <>
                <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
                  <AdminVendorFilters
                    activeSearch={params.q ?? ""}
                  />
                </Suspense>
                <AdminVendorList
                  vendors={vendorsData.vendors}
                  total={vendorsData.total}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
