import { format } from "date-fns";
import {
  Users,
  UserPlus,
  Briefcase,
  FileText,
  GraduationCap,
  Award,
  Download,
  Mail,
  AlertTriangle,
  DollarSign,
  Clock,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  PenTool,
  Calendar,
  Gift,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/layout";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardStats } from "@/lib/admin-dashboard";

interface AdminDashboardPageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function AdminDashboardPage({ searchParams: _searchParams }: AdminDashboardPageProps) {
  const stats = await getAdminDashboardStats();

  const revenueINR = (stats.totalRevenuePaise / 100).toLocaleString("en-IN");
  const pendingRevenueINR = (stats.pendingPaymentsPaise / 100).toLocaleString("en-IN");

  // Calculate week-over-week trends (mock for now - would need historical data)
  const leadsTrend = stats.newLeadsThisWeek > 0 ? 12 : 0;
  const appsTrend = stats.pendingApplications > 0 ? -5 : 0;
  const enrollTrend = stats.activeEnrollments > 0 ? 8 : 0;
  const certTrend = stats.totalCertificates > 0 ? 15 : 0;

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Admin Operations Top Bar */}
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-navy">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Quick Actions</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                Admin Dashboard
              </h1>
              <p className="text-sm text-body">
                Overview of platform metrics, leads, programs, and operations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy/60">
                Updated: {format(new Date(), "MMM d, yyyy HH:mm")}
              </span>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Users */}
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              color="navy"
              href="/admin/users"
            />
            <StatCard
              label="Active Students"
              value={stats.activeStudents.toLocaleString()}
              icon={<UserPlus className="h-5 w-5" />}
              color="emerald"
              trend={{ value: 5, label: "vs last week" }}
              href="/admin/users?role=student"
            />
            <StatCard
              label="Staff Members"
              value={stats.totalStaff.toLocaleString()}
              icon={<Briefcase className="h-5 w-5" />}
              color="blue"
              href="/admin/users?role=staff"
            />
            <StatCard
              label="Pending Verifications"
              value={stats.pendingVerifications.toLocaleString()}
              icon={<ShieldAlert className="h-5 w-5" />}
              color="amber"
              href="/admin/users?verification=pending"
            />

            {/* Leads */}
            <StatCard
              label="Total Leads"
              value={stats.totalLeads.toLocaleString()}
              icon={<Mail className="h-5 w-5" />}
              color="navy"
              trend={{ value: leadsTrend, label: "this week" }}
              href="/admin/leads"
            />
            <StatCard
              label="New This Week"
              value={stats.newLeadsThisWeek.toLocaleString()}
              icon={<TrendingUp className="h-5 w-5" />}
              color="emerald"
              href="/admin/leads?period=week"
            />

            {/* Internships */}
            <StatCard
              label="Internships"
              value={stats.totalInternships.toLocaleString()}
              icon={<Briefcase className="h-5 w-5" />}
              color="navy"
              href="/admin/internships"
            />
            <StatCard
              label="Active Tracks"
              value={stats.activeInternships.toLocaleString()}
              icon={<Activity className="h-5 w-5" />}
              color="blue"
              href="/admin/internships?status=published"
            />
            <StatCard
              label="Total Applications"
              value={stats.totalApplications.toLocaleString()}
              icon={<FileText className="h-5 w-5" />}
              color="purple"
              trend={{ value: appsTrend, label: "pending" }}
              href="/admin/applications"
            />
            <StatCard
              label="Pending Review"
              value={stats.pendingApplications.toLocaleString()}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              href="/admin/applications?stage=APPLICATION_RECEIVED"
            />

            {/* Courses */}
            <StatCard
              label="Courses"
              value={stats.totalCourses.toLocaleString()}
              icon={<GraduationCap className="h-5 w-5" />}
              color="navy"
              href="/admin/courses"
            />
            <StatCard
              label="Published"
              value={stats.publishedCourses.toLocaleString()}
              icon={<ShieldCheck className="h-5 w-5" />}
              color="emerald"
              href="/admin/courses?status=published"
            />
            <StatCard
              label="Total Enrollments"
              value={stats.totalEnrollments.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              color="blue"
              trend={{ value: enrollTrend, label: "active" }}
              href="/admin/enrollments"
            />
            <StatCard
              label="Active Learners"
              value={stats.activeEnrollments.toLocaleString()}
              icon={<GraduationCap className="h-5 w-5" />}
              color="purple"
              href="/admin/enrollments?status=ACTIVE"
            />

            {/* Certificates */}
            <StatCard
              label="Certificates Issued"
              value={stats.totalCertificates.toLocaleString()}
              icon={<Award className="h-5 w-5" />}
              color="navy"
              trend={{ value: certTrend, label: "this month" }}
              href="/admin/certificates"
            />
            <StatCard
              label="Active & Valid"
              value={stats.activeCertificates.toLocaleString()}
              icon={<ShieldCheck className="h-5 w-5" />}
              color="emerald"
              href="/admin/certificates?status=ACTIVE"
            />
            <StatCard
              label="Revoked"
              value={stats.revokedCertificates.toLocaleString()}
              icon={<ShieldAlert className="h-5 w-5" />}
              color="red"
              href="/admin/certificates?status=REVOKED"
            />
            <StatCard
              label="Total Downloads"
              value={stats.totalDownloads.toLocaleString()}
              icon={<Download className="h-5 w-5" />}
              color="blue"
              href="/admin/certificates"
            />

            {/* Support */}
            <StatCard
              label="Open Tickets"
              value={stats.openTickets.toLocaleString()}
              icon={<Mail className="h-5 w-5" />}
              color="navy"
              href="/admin/support"
            />
            <StatCard
              label="SLA Breaches"
              value={stats.ticketsSlaBreach.toLocaleString()}
              icon={<AlertTriangle className="h-5 w-5" />}
              color={stats.ticketsSlaBreach > 0 ? "red" : "emerald"}
              href="/admin/support?sla=breach"
            />

            {/* Finance */}
            <StatCard
              label="Total Revenue"
              value={`₹${revenueINR}`}
              icon={<DollarSign className="h-5 w-5" />}
              color="emerald"
              href="/admin/finance"
            />
            <StatCard
              label="Pending Payments"
              value={`₹${pendingRevenueINR}`}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              href="/admin/finance?status=PENDING"
            />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-navy">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/admin/internships/new"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Create Internship</p>
                    <p className="text-xs text-navy/60">Add new track</p>
                  </div>
                </Link>
                <Link
                  href="/admin/courses/new"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Create Course</p>
                    <p className="text-xs text-navy/60">Build curriculum</p>
                  </div>
                </Link>
                <Link
                  href="/admin/certificates/new"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Issue Certificate</p>
                    <p className="text-xs text-navy/60">Mint credential</p>
                  </div>
                </Link>
                <Link
                  href="/admin/posts/new"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Write Blog Post</p>
                    <p className="text-xs text-navy/60">Publish content</p>
                  </div>
                </Link>
                <Link
                  href="/admin/leads"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Review Leads</p>
                    <p className="text-xs text-navy/60">New inquiries</p>
                  </div>
                </Link>
                <Link
                  href="/admin/events/new"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Create Event</p>
                    <p className="text-xs text-navy/60">Schedule event</p>
                  </div>
                </Link>
                <Link
                  href="/admin/referrals"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Referral Management</p>
                    <p className="text-xs text-navy/60">Track rewards</p>
                  </div>
                </Link>
                <Link
                  href="/admin/notifications"
                  className="flex items_center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Notification Management</p>
                    <p className="text-xs text-navy/60">Send announcements</p>
                  </div>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 hover:border-brand-ink/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Analytics & Reporting</p>
                    <p className="text-xs text-navy/60">View metrics</p>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Lead Type Breakdown */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-navy">Leads by Type</h2>
              </div>
              {Object.entries(stats.leadsByKind).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.leadsByKind).map(([kind, count]) => (
                    <Link
                      key={kind}
                      href={`/admin/leads?kind=${kind}`}
                      className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-3 hover:border-brand-ink/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                          {kind === "CONTACT" && <Mail className="h-4 w-4" />}
                          {kind === "NEWSLETTER" && <Activity className="h-4 w-4" />}
                          {kind === "PARTNERSHIP" && <Briefcase className="h-4 w-4" />}
                          {kind === "CAREERS" && <Users className="h-4 w-4" />}
                          {kind === "AMBASSADOR" && <GraduationCap className="h-4 w-4" />}
                          {kind === "REFERRAL" && <Gift className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-navy capitalize">{kind.toLowerCase()}</span>
                      </div>
                      <span className="font-bold text-navy">{count}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-body text-center py-4">No leads yet</p>
              )}
            </Card>
          </div>

          {/* Recent Activity Placeholder */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-navy">Recent Activity</h2>
              <Link
                href="/admin/activity"
                className="text-xs font-semibold text-brand-ink hover:text-brand-hover"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-body text-center py-4 text-navy/50">
                Activity feed coming soon — will show recent enrollments, certificate issuances, application updates, and lead submissions.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}