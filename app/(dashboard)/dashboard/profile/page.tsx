import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/layout";
import { ProfileForm } from "@/components/forms/profile-form";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your academic background, skills, and portfolio credentials.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let profile = null;
  let userName = session.user.name ?? "";

  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (userWithProfile) {
      profile = userWithProfile.profile;
      userName = userWithProfile.name ?? userName;
    }
  } catch (error) {
    console.error("[profile] Failed to load user profile:", error);
    // Proceed with fallback so UI remains functional
  }

  const initialData = {
    fullName: profile?.fullName ?? userName,
    phone: profile?.phone ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    college: profile?.college ?? "",
    degree: profile?.degree ?? "",
    branch: profile?.branch ?? "",
    graduationYear: profile?.graduationYear ?? null,
    skills: profile?.skills ?? [],
    githubUrl: profile?.githubUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
  };

  return (
    <div className="bg-muted/20 py-10 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb / Nav */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-body hover:text-brand-ink transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Profile & Credentials
              </h1>
              <p className="mt-1 text-sm text-body">
                Keep your academic details and technical competencies up to date for program reviews.
              </p>
            </div>
            {profile?.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <UserCheck className="h-3.5 w-3.5" />
                Verified Student
              </span>
            )}
          </div>

          {/* Profile Form */}
          <ProfileForm
            initialData={initialData}
            userEmail={session.user.email ?? ""}
          />
        </div>
      </Container>
    </div>
  );
}
