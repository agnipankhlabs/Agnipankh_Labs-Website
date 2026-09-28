import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Award,
  LogOut,
  ArrowRight,
  ShieldCheck,
  User,
  Gift,
  Users,
  Copy,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { getUserApplications } from "@/lib/applications";
import { prisma } from "@/lib/db";
import { Container, Card } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { ApplicationTracker } from "@/components/dashboard/application-tracker";

export const metadata: Metadata = {
  title: "Learner Dashboard",
  description: "Manage your internship applications, enrolled programs, and verifiable certificates.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userName = session.user.name ?? "Learner";
  const userEmail = session.user.email ?? "";
  const applications = await getUserApplications(session.user.id);

  // Fetch referral data
  const [profile, referrals] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { ownReferralCode: true, referredByCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerUserId: session.user.id },
      select: { id: true, code: true, referredUserId: true, rewardGranted: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const referralCode = profile?.ownReferralCode ?? "";
  const referredByCode = profile?.referredByCode ?? "";
  const totalReferrals = referrals.length;
  const rewardedReferrals = referrals.filter((r) => r.rewardGranted).length;

  return (
    <div className="bg-muted/20 py-10 sm:py-16">
      <Container>
        {/* Welcome Header */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover font-heading text-xl font-bold text-white shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
                  Welcome, {userName}
                </h1>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                  Student
                </span>
              </div>
              <p className="mt-1 text-sm text-body">{userEmail}</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <ButtonLink
              href="/dashboard/profile"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <User className="h-4 w-4 text-brand-ink" aria-hidden="true" />
              <span>Edit Profile</span>
            </ButtonLink>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-2 text-navy hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Live Application & 5-Stage Cohort Tracker */}
        <div className="mt-8">
          <ApplicationTracker applications={applications} />
        </div>

        {/* Quick Nav / Modules Header */}
        <div className="mt-12 flex items-center justify-between border-b border-navy/10 pb-4">
          <h2 className="font-heading text-lg font-bold text-navy">
            Platform Modules & Resources
          </h2>
          <span className="text-xs text-body">Self-service learner tools</span>
        </div>

        {/* Dashboard Modules Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Internships */}
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand-ink">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-navy">
                Internship Programs
              </h2>
              <p className="mt-2 text-sm text-body">
                Explore hands-on technical cohorts, submit applications, and track your review status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy/5">
              <Link
                href="/internships"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                <span>Browse Cohorts</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Card 2: Training Courses */}
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <GraduationCap className="h-5 w-5 text-brand-ink" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-navy">
                Skill Training
              </h2>
              <p className="mt-2 text-sm text-body">
                Access structured engineering curricula, practical code exercises, and study modules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy/5">
              <Link
                href="/training"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                <span>View Training</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Card 3: Verifiable Credentials */}
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand-ink">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-navy">
                Certificates & Records
              </h2>
              <p className="mt-2 text-sm text-body">
                Verify credential hashes, preview dynamic QR payloads, and share proof of completion.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy/5">
              <Link
                href="/verify"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                <span>Verify Credentials</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Card 4: Profile & Academic Info */}
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-navy">
                Profile & Resume
              </h2>
              <p className="mt-2 text-sm text-body">
                Manage your college info, portfolio links, and technical skill tags for program reviews.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy/5">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                <span>Edit Profile</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Card 5: Referral Programme */}
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-bold text-navy">
                Referral Programme
              </h2>
              <p className="mt-2 text-sm text-body">
                Share your referral code to earn rewards. Track your referrals and reward status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy/5 space-y-3">
              {referralCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-body">Your Referral Code</p>
                      <p className="font-mono font-semibold text-navy">{referralCode}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-body">No referral code assigned yet.</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-body">Total Referrals</span>
                <span className="font-bold text-navy">{totalReferrals}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-body">Rewards Granted</span>
                <span className="font-bold text-emerald-600">{rewardedReferrals}</span>
              </div>
              <Link
                href="/ambassador/apply"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                <span>Learn More About Programme</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Academic Profile Status Banner */}
        <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-navy">
                Account Status: Active Learner
              </h3>
              <p className="mt-1 text-sm text-body">
                Your account is set up for Agnipankh Labs cohorts. Keep your contact information
                accurate to ensure seamless project notifications and certificate delivery.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-brand-ink">
                <Link href="/contact" className="hover:underline">
                  Need Help or Mentor Guidance? Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
