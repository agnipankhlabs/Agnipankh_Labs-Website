import type { Metadata } from "next";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access Restricted",
  description: "You do not have the required permissions to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-sm">
            <ShieldAlert className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-navy">
            Access Restricted
          </h1>

          <p className="mt-3 text-base text-body">
            You do not possess the authorization privileges required to view or manage this section.
            If you believe this is an error, please contact your program administrator or support.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/dashboard"
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </ButtonLink>
            <ButtonLink
              href="/"
              variant="primary"
              className="inline-flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
