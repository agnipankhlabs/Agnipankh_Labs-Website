import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container } from "@/components/ui/layout";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Student Registration",
  description:
    "Create your student account with Agnipankh Labs to apply for internship tracks, access hands-on training, and earn verifiable certificates.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-[2cm]">
      <Container>
        <div className="mx-auto w-full max-w-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/logo-full.png"
                alt="Agnipankh Labs Logo"
                width={200}
                height={90}
                className="h-16 sm:h-18 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy">
              Create Your Student Account
            </h1>
            <p className="mt-2 text-sm text-body">
              Join Agnipankh Labs to apply for live cohorts, build projects, and get mentored.
            </p>
          </div>

          {/* Form Card */}
          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <RegisterForm />

            <div className="mt-6 border-t border-navy/10 pt-5 text-center text-sm text-body">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-center text-xs text-body/80">
            {NO_GUARANTEE_DISCLAIMER}
          </p>
        </div>
      </Container>
    </div>
  );
}
