import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { InternshipForm } from "@/components/admin/internship-form";

export const metadata: Metadata = {
  title: "Create Internship Track — Admin Desk | Agnipankh Labs",
  description:
    "Author and publish a new industry-aligned internship track with learning objectives and prerequisites.",
};

export default async function NewInternshipPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/internships/new");
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

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
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
                href="/admin/internships"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Internship Tracks</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">New Track</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-ink" />
                <span>Curriculum Authoring</span>
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
        <Container className="space-y-6">
          <div className="max-w-4xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Cohort Track</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Create New Internship Track
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Fill in the program specifications below. You can save as a draft or
              publish immediately to the public catalog.
            </p>
          </div>

          <InternshipForm mode="create" />
        </Container>
      </main>
    </div>
  );
}
