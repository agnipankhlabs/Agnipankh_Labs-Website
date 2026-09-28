import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Award,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { CertificateIssueForm } from "@/components/admin/certificate-issue-form";

export const metadata: Metadata = {
  title: "Issue Certificate — Admin Desk | Agnipankh Labs",
  description:
    "Mint an official cryptographic certificate with Crockford Base32 ID and HMAC-SHA256 signature.",
};

interface PageProps {
  searchParams: Promise<{
    userId?: string;
    email?: string;
    name?: string;
    program?: string;
    track?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function NewCertificatePage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/certificates/new");
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

  const initialValues = {
    userId: params.userId ?? "usr-student-01",
    recipientEmail: params.email ?? "",
    verifiedFullLegalName: params.name ?? "",
    programName: params.program ?? "Full-Stack Web Development Track",
    trackName: params.track ?? "Web Development",
    type: params.type ?? "INTERNSHIP",
    cohortStartDate: params.startDate ?? "",
    cohortEndDate: params.endDate ?? "",
  };

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
                href="/admin/certificates"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Certificate Desk</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Mint Credential</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-ink" />
                <span>Authority Desk</span>
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
          <div className="max-w-5xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verifiable Credential Issuance</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Issue Official Certificate
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Generate a permanent, cryptographically signed certificate matching
              the QMS §9 and Cybersecurity Framework AL-SEC-001 specification.
            </p>
          </div>

          <CertificateIssueForm initialValues={initialValues} />
        </Container>
      </main>
    </div>
  );
}
