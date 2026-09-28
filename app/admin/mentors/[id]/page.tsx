import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  User,
  Award,
  Briefcase,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Edit,
  UserPlus,
  MoreVertical,
  Loader2,
  MessageSquare,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { auth } from "@/auth";
import { getAdminMentorById, getAdminMentorStats } from "@/lib/admin-mentors";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { approveMentorAction, createMentorEvaluationAction, assignMentorToCohortAction } from "@/app/actions/admin-mentors";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const mentor = await getAdminMentorById(id);
  
  if (!mentor) {
    return {
      title: "Mentor Not Found — Admin | Agnipankh Labs",
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `${mentor.user?.name ?? "Mentor"} — Admin | Agnipankh Labs`,
    description: `Manage mentor profile, evaluations, and cohort assignments.`,
  };
}

function StarIcon({ score }: { score: number | null }) {
  if (score === null) return <Star className="h-4 w-4 text-navy/20" />;
  const filled = Math.round(score / 20);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= filled ? "text-amber-500 fill-current" : "text-navy/20"}`} />
      ))}
    </span>
  );
}

function getApprovalStatusClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function getClassificationClass(classification: string) {
  switch (classification) {
    case "OUTSTANDING":
      return "bg-emerald-100 text-emerald-800";
    case "STRONG":
      return "bg-blue-100 text-blue-800";
    case "SATISFACTORY":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-red-100 text-red-800";
  }
}

export default async function MentorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const mentor = await getAdminMentorById(id);

  if (!mentor) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20">
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
                <span>Mentors</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">{mentor.user?.name ?? "Mentor"}</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <User className="h-3.5 w-3.5 text-brand-ink" />
                <span>Mentor Detail</span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-8 sm:pt-10">
        <Container className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/mentors"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Mentor Desk</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/mentors/${mentor.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Header Card */}
          <Card className="bg-gradient-to-br from-white via-surface to-muted/20 border-2 border-navy/20 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-navy/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy">
                    {mentor.user?.name ?? "Mentor"}
                  </h2>
                  <p className="text-sm text-body">{mentor.user?.email}</p>
                </div>
              </div>
              <span className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-ink uppercase">
                {mentor.approvalStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-navy/10 bg-white/80 p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Domain Experience</p>
                <p className="font-medium text-navy">{mentor.domainExperience ?? "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Years of Experience</p>
                <p className="font-medium text-navy">{mentor.yearsExperience ? `${mentor.yearsExperience} years` : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Current Employer</p>
                <p className="font-medium text-navy">{mentor.currentEmployer ?? "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Expertise Areas</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {mentor.expertise.length > 0 ? (
                    mentor.expertise.map((e) => (
                      <span key={e} className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {e}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-navy/50">None specified</span>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-body">Approval Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getApprovalStatusClass(mentor.approvalStatus)}`}>
                    {mentor.approvalStatus === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    {mentor.approvalStatus === "REJECTED" && <XCircle className="h-3.5 w-3.5 text-red-600" />}
                    {mentor.approvalStatus === "PENDING" && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                    <span className="capitalize">{mentor.approvalStatus.toLowerCase()}</span>
                  </span>
{mentor.approvedAt && (
                    <p className="text-xs text-navy/50 mt-1">
                      {mentor.approvalStatus === "APPROVED" ? "Approved" : "Reviewed"} on {format(new Date(mentor.approvedAt!), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-navy/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Average Rating</p>
                  <p className="font-heading text-xl font-bold text-navy">
                    {mentor.averageScore !== null ? `${mentor.averageScore} / 100` : "Not evaluated yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Total Evaluations</p>
                  <p className="font-heading text-xl font-bold text-navy">{mentor.evaluationCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Student Reviews</p>
                  <p className="font-heading text-xl font-bold text-navy">{mentor.reviewCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body">Active Cohorts</p>
                  <p className="font-heading text-xl font-bold text-navy">{mentor.cohortCount}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Evaluation & Review Section */}
          <Section>
            <SectionHeading
              eyebrow="Performance & Feedback"
              title="Evaluations & Reviews"
              description="Track mentor performance through structured evaluations and student feedback"
            />
            
            {/* Latest Evaluation */}
            {mentor.evaluations && mentor.evaluations.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-navy">Latest Evaluation</h3>
                <Card className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-body">Evaluation Score</p>
                          <p className="font-heading text-2xl font-bold text-navy">{mentor.evaluations[0].score} / 100</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getClassificationClass(mentor.evaluations[0].classification)}`}>
                          {mentor.evaluations[0].classification}
                        </span>
                        <span className="text-xs text-navy/50">Review Period: {mentor.evaluations[0].reviewPeriod}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 rounded-xl bg-emerald-50">
                        <p className="font-heading text-xl font-bold text-emerald-900">{mentor.evaluations[0].engagement}</p>
                        <p className="text-[11px] text-emerald-800">Engagement</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50">
                        <p className="font-heading text-xl font-bold text-blue-900">{mentor.evaluations[0].communication}</p>
                        <p className="text-[11px] text-blue-800">Communication</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50">
                        <p className="font-heading text-xl font-bold text-purple-900">{mentor.evaluations[0].reviewDetail}</p>
                        <p className="text-[11px] text-purple-800">Review Detail</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50">
                        <p className="font-heading text-xl font-bold text-emerald-900">{mentor.evaluations[0].learnerImpact}</p>
                        <p className="text-[11px] text-emerald-800">Learner Impact</p>
                      </div>
                    </div>
                    {mentor.evaluations[0].administrativeAction && (
                      <div className="pt-3 border-t border-navy/10">
                        <p className="text-xs font-semibold uppercase tracking-wider text-body">Administrative Action</p>
                        <p className="text-sm text-navy mt-1">{mentor.evaluations[0].administrativeAction}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-navy/10">
                      <span className="text-xs text-navy/50">Review Period: {mentor.evaluations[0].reviewPeriod}</span>
                      <span className="text-xs text-navy/50">Evaluated on {format(new Date(mentor.evaluations[0].createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  </Card>
                </div>
                )}

            {/* Evaluation Form (for admins) */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-navy">Create New Evaluation</h3>
              <Card className="p-5 space-y-4">
                <form id="evaluation-form" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-navy">Engagement <span className="text-red-600">*</span></label>
                      <select name="engagement" required className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-navy">Communication <span className="text-red-600">*</span></label>
                      <select name="communication" required className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-navy">Review Detail <span className="text-red-600">*</span></label>
                      <select name="reviewDetail" required className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-navy">Learner Impact <span className="text-red-600">*</span></label>
                      <select name="learnerImpact" required className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:outline-2 focus:outline-brand-ink">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-navy">Review Period <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      name="reviewPeriod"
                      required
                      placeholder="e.g., Q1 2026, Sprint 3, etc."
                      className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-navy">Administrative Action (Optional)</label>
                    <textarea
                      name="administrativeAction"
                      rows={2}
                      placeholder="Any administrative action taken or recommended..."
                      className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy/10">
                    <Button type="submit" variant="primary" className="gap-2 text-xs py-2.5 px-6 font-semibold">
                      <UserPlus className="h-4 w-4" />
                      <span>Create Evaluation</span>
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
        </Section>
        </Container>
      </main>
    </div>
  );
}