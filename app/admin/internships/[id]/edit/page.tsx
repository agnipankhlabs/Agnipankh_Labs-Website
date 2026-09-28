import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Edit,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { getAdminInternshipById } from "@/lib/admin-internships";
import { InternshipForm } from "@/components/admin/internship-form";

export const metadata: Metadata = {
  title: "Edit Internship Track — Admin Desk | Agnipankh Labs",
  description: "Update curriculum, requirements, or publication status for an internship track.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInternshipPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/admin/internships/${id}/edit`);
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

  const track = await getAdminInternshipById(id);

  if (!track) {
    notFound();
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
              <span className="font-semibold text-navy truncate max-w-[140px] sm:max-w-none">
                {track.title}
              </span>
            </div>

            {/* Right */}
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
        <Container className="space-y-6">
          <div className="max-w-4xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <Edit className="h-3.5 w-3.5" />
              <span>Modify Track Specifications</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Edit Track: {track.title}
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Make changes to curriculum masteries, duration, mode, or toggle public enrollment status.
            </p>
          </div>

          <InternshipForm
            mode="edit"
            trackId={track.id}
            initialData={track}
          />
        </Container>
      </main>
    </div>
  );
}
