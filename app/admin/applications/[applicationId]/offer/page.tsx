import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { getOfferLetterData } from "@/lib/offer-letter";
import { OfferLetterDocument } from "@/components/dashboard/offer-letter-document";

export const metadata: Metadata = {
  title: "Offer Letter Preview — Admin Desk | Agnipankh Labs",
  description:
    "Preview the formal internship offer letter and training agreement document for a candidate.",
};

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function AdminOfferLetterPage({ params }: PageProps) {
  const { applicationId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/admin/applications/${applicationId}/offer`);
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

  // Fetch offer letter data with allowDraft = true
  const data = await getOfferLetterData(applicationId, true);

  if (!data) {
    notFound();
  }

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
              <Link
                href="/admin/applications"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Application Review</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">
                Offer Letter Document
              </span>
            </div>

            {/* Right: Role badge + Sign out */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-ink" />
                <span>Operations Staff</span>
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

      {/* Main Document Content */}
      <main className="pt-8 sm:pt-10">
        <Container>
          <OfferLetterDocument
            data={data}
            isAdminPreview={true}
            adminReturnHref="/admin/applications"
          />
        </Container>
      </main>
    </div>
  );
}
