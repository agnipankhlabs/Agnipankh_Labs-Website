import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { MfaForm } from "@/components/forms/mfa-form";

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Verify your identity with your two-factor security code.",
};

export default async function MfaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-12 sm:py-16">
      <Container>
        <div className="mx-auto w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-navy">
              Two-Factor Challenge
            </h1>
            <p className="mt-2 text-sm text-body">
              Your role requires multi-factor authentication before accessing privileged operations.
            </p>
          </div>

          {/* Form Card */}
          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <MfaForm />

            <div className="mt-6 border-t border-navy/10 pt-5 text-center">
              <ButtonLink
                href="/dashboard"
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-1.5 text-xs text-body hover:text-navy"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Student Dashboard</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
