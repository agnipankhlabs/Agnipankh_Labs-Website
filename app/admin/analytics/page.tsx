"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Award,
  GraduationCap,
  Briefcase,
  Mail,
  BarChart3,
  LineChart,
  PieChart,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { Chart, registerables } from "chart.js";
import { Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/layout";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

Chart.register(...registerables);

type TimeRange = "7d" | "30d" | "90d" | "1y";

interface AnalyticsOverview {
  users: { total: number; newThisWeek: number; newThisMonth: number; byRole: Record<string, number> };
  leads: { total: number; newThisWeek: number; newThisMonth: number; byKind: Record<string, number>; byStatus: Record<string, number>; conversionRate: number };
  internships: { total: number; published: number; totalApplications: number; applicationsThisWeek: number; byDomain: Record<string, number>; byStage: Record<string, number> };
  courses: { total: number; published: number; totalEnrollments: number; enrollmentsThisWeek: number; completionRate: number; byLevel: Record<string, number> };
  certificates: { total: number; issuedThisWeek: number; issuedThisMonth: number; active: number; revoked: number; downloads: number; byType: Record<string, number> };
  finance: { totalRevenue: number; revenueThisWeek: number; revenueThisMonth: number; pendingPayments: number; byStream: Record<string, number> };
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

interface AnalyticsTimeSeries {
  users: TimeSeriesData[];
  leads: TimeSeriesData[];
  applications: TimeSeriesData[];
  enrollments: TimeSeriesData[];
  certificates: TimeSeriesData[];
  revenue: TimeSeriesData[];
}

const COLORS = {
  primary: "#0F172A",
  secondary: "#B35100",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  chartColors: ["#0F172A", "#B35100", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"],
};

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeSeries, setTimeSeries] = useState<AnalyticsTimeSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<Map<string, Chart>>(new Map());

  // Chart refs
  const usersChartRef = useRef<HTMLCanvasElement>(null);
  const leadsChartRef = useRef<HTMLCanvasElement>(null);
  const applicationsChartRef = useRef<HTMLCanvasElement>(null);
  const enrollmentsChartRef = useRef<HTMLCanvasElement>(null);
  const certificatesChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const leadsByKindChartRef = useRef<HTMLCanvasElement>(null);
  const appsByStageChartRef = useRef<HTMLCanvasElement>(null);
  const enrollmentsByLevelChartRef = useRef<HTMLCanvasElement>(null);
  const certsByTypeChartRef = useRef<HTMLCanvasElement>(null);
  const revenueByStreamChartRef = useRef<HTMLCanvasElement>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const days = TIME_RANGES.find((t) => t.value === timeRange)?.days ?? 30;
      const [overviewRes, timeSeriesRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview`),
        fetch(`/api/admin/analytics/timeseries?days=${days}`),
      ]);
      const overviewData = await overviewRes.json();
      const timeSeriesData = await timeSeriesRes.json();
      setOverview(overviewData);
      setTimeSeries(timeSeriesData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Render charts when data is available
  useEffect(() => {
    if (!timeSeries || !overview) return;

    const chartInstances = new Map<string, Chart>();

    // Helper to create line chart
    function createLineChart(canvas: HTMLCanvasElement | null, data: TimeSeriesData[], color: string, label: string) {
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Destroy existing chart
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();

      return new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((d) => d.label ?? d.date),
          datasets: [
            {
              label,
              data: data.map((d) => d.value),
              borderColor: color,
              backgroundColor: color + "20",
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0F172A",
              titleColor: "#fff",
              bodyColor: "#fff",
              padding: 12,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#64748B", font: { size: 11 } },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#E2E8F0" },
              ticks: { color: "#64748B", font: { size: 11 } },
            },
          },
          interaction: { intersect: false, mode: "index" },
        },
      });
    }

    // Helper to create pie/doughnut chart
    function createDoughnutChart(canvas: HTMLCanvasElement | null, data: Record<string, number>, label: string) {
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();

      const entries = Object.entries(data).filter(([, v]) => v > 0);
      if (entries.length === 0) return null;

      return new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: entries.map(([k]) => k),
          datasets: [
            {
              data: entries.map(([, v]) => v),
              backgroundColor: COLORS.chartColors.slice(0, entries.length),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: { position: "bottom", labels: { color: "#64748B", font: { size: 11 }, padding: 16 } },
            tooltip: {
              backgroundColor: "#0F172A",
              titleColor: "#fff",
              bodyColor: "#fff",
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const pct = ((context.raw as number) / total * 100).toFixed(1);
                  return `${context.label}: ${context.raw} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // Time series charts
    chartInstances.set("users", createLineChart(usersChartRef.current, timeSeries.users, COLORS.primary, "New Users")!);
    chartInstances.set("leads", createLineChart(leadsChartRef.current, timeSeries.leads, COLORS.secondary, "New Leads")!);
    chartInstances.set("applications", createLineChart(applicationsChartRef.current, timeSeries.applications, COLORS.success, "Applications")!);
    chartInstances.set("enrollments", createLineChart(enrollmentsChartRef.current, timeSeries.enrollments, COLORS.info, "Enrollments")!);
    chartInstances.set("certificates", createLineChart(certificatesChartRef.current, timeSeries.certificates, COLORS.purple, "Certificates")!);
    chartInstances.set("revenue", createLineChart(revenueChartRef.current, timeSeries.revenue, COLORS.success, "Revenue (₹)")!);

    // Distribution charts
    chartInstances.set("leadsByKind", createDoughnutChart(leadsByKindChartRef.current, overview.leads.byKind, "Leads by Kind")!);
    chartInstances.set("appsByStage", createDoughnutChart(appsByStageChartRef.current, overview.internships.byStage, "Applications by Stage")!);
    chartInstances.set("enrollmentsByLevel", createDoughnutChart(enrollmentsByLevelChartRef.current, overview.courses.byLevel, "Enrollments by Level")!);
    chartInstances.set("certsByType", createDoughnutChart(certsByTypeChartRef.current, overview.certificates.byType, "Certificates by Type")!);
    chartInstances.set("revenueByStream", createDoughnutChart(revenueByStreamChartRef.current, overview.finance.byStream, "Revenue by Stream")!);

    setCharts(chartInstances);

    return () => {
      chartInstances.forEach((chart) => chart.destroy());
    };
  }, [timeSeries, overview, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 pb-16">
        <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md">
          <Container>
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Link href="/admin" className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
                <ChevronRight className="h-3 w-3 text-navy/30" />
                <span className="font-semibold text-navy">Analytics & Reporting</span>
              </div>
            </div>
          </Container>
        </header>
        <main className="pt-8">
          <Container>
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">Analytics & Reporting</h1>
                  <p className="text-sm text-body">Platform metrics, trends, and performance insights.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 w-3/4 bg-muted/40 rounded mb-2" />
                    <div className="h-8 w-1/2 bg-muted/40 rounded" />
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Admin Operations Top Bar */}
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md">
        <Container>
          <div className="flex h-14 items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <Link href="/admin" className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Analytics & Reporting</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
                >
                  {TIME_RANGES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1 text-xs font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-8">
        <Container className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink mb-1">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Analytics Dashboard</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">Analytics & Reporting</h1>
              <p className="mt-1 text-xs sm:text-sm text-body max-w-2xl">Comprehensive platform metrics, trends, and performance insights.</p>
            </div>
            <div className="flex items-center gap-2 sm:hidden">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="rounded-xl border border-navy/15 bg-muted/20 px-3 py-2 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
              >
                {TIME_RANGES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Stats Grid */}
          {overview && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {/* Users */}
                <StatCard label="Total Users" value={overview.users.total.toLocaleString()} icon={<Users className="h-5 w-5" />} color="navy" />
                <StatCard label="New This Week" value={overview.users.newThisWeek.toLocaleString()} icon={<TrendingUp className="h-5 w-5" />} color="emerald" trend={{ value: overview.users.newThisWeek > 0 ? 12 : 0, label: "vs last week" }} />
                <StatCard label="Total Leads" value={overview.leads.total.toLocaleString()} icon={<Mail className="h-5 w-5" />} color="navy" />
                <StatCard label="Conversion Rate" value={`${overview.leads.conversionRate.toFixed(1)}%`} icon={<Target className="h-5 w-5" />} color="purple" />
                <StatCard label="Total Applications" value={overview.internships.totalApplications.toLocaleString()} icon={<Briefcase className="h-5 w-5" />} color="blue" />
                <StatCard label="Apps This Week" value={overview.internships.applicationsThisWeek.toLocaleString()} icon={<TrendingUp className="h-5 w-5" />} color="emerald" />

                {/* Courses */}
                <StatCard label="Total Courses" value={overview.courses.total.toLocaleString()} icon={<GraduationCap className="h-5 w-5" />} color="navy" />
                <StatCard label="Published" value={overview.courses.published.toLocaleString()} icon={<Award className="h-5 w-5" />} color="emerald" />
                <StatCard label="Total Enrollments" value={overview.courses.totalEnrollments.toLocaleString()} icon={<Users className="h-5 w-5" />} color="blue" />
                <StatCard label="Completion Rate" value={`${overview.courses.completionRate.toFixed(1)}%`} icon={<Target className="h-5 w-5" />} color="purple" />

                {/* Certificates */}
                <StatCard label="Certificates" value={overview.certificates.total.toLocaleString()} icon={<Award className="h-5 w-5" />} color="navy" />
                <StatCard label="Active" value={overview.certificates.active.toLocaleString()} icon={<Target className="h-5 w-5" />} color="emerald" />
                <StatCard label="Downloads" value={overview.certificates.downloads.toLocaleString()} icon={<TrendingDown className="h-5 w-5" />} color="blue" />
                <StatCard label="Revoked" value={overview.certificates.revoked.toLocaleString()} icon={<TrendingDown className="h-5 w-5" />} color={overview.certificates.revoked > 0 ? "red" : "emerald"} />

                {/* Finance */}
                <StatCard label="Total Revenue" value={formatINR(overview.finance.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
                <StatCard label="Revenue This Month" value={formatINR(overview.finance.revenueThisMonth)} icon={<Calendar className="h-5 w-5" />} color="blue" />
                <StatCard label="Pending Payments" value={formatINR(overview.finance.pendingPayments)} icon={<TrendingUp className="h-5 w-5" />} color="amber" />
              </div>

              {/* Time Series Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">User Registrations</h3>
                  <div className="h-72"><canvas ref={usersChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Lead Generation</h3>
                  <div className="h-72"><canvas ref={leadsChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Internship Applications</h3>
                  <div className="h-72"><canvas ref={applicationsChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Course Enrollments</h3>
                  <div className="h-72"><canvas ref={enrollmentsChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Certificates Issued</h3>
                  <div className="h-72"><canvas ref={certificatesChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Revenue Trend</h3>
                  <div className="h-72"><canvas ref={revenueChartRef} /></div>
                </Card>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Leads by Kind</h3>
                  <div className="h-64"><canvas ref={leadsByKindChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Applications by Stage</h3>
                  <div className="h-64"><canvas ref={appsByStageChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Enrollments by Level</h3>
                  <div className="h-64"><canvas ref={enrollmentsByLevelChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Certificates by Type</h3>
                  <div className="h-64"><canvas ref={certsByTypeChartRef} /></div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-4">Revenue by Stream</h3>
                  <div className="h-64"><canvas ref={revenueByStreamChartRef} /></div>
                </Card>
              </div>
            </>
          )}
        </Container>
      </main>
    </div>
  );
}