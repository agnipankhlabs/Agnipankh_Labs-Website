import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Agnipankh Labs student and participant portal.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-[2cm]">
      <Container>
        <div className="mx-auto w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/logo-full.png"
                alt="Agnipankh Labs Logo"
                width={180}
                height={80}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-body">
              Sign in to access your internships, coursework, and credentials.
            </p>
          </div>

          {/* Form Card */}
          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <LoginForm />

            <div className="mt-6 border-t border-navy/10 pt-5 text-center text-sm text-body">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                Sign up as a student
              </Link>
            </div>
          </div>

          {/* Verification fast link */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-body">
            <ShieldCheck className="h-4 w-4 text-brand-ink" aria-hidden="true" />
            <span>Looking to verify a student certificate?</span>
            <Link href="/verify" className="font-semibold text-brand-ink hover:underline">
              Verify here
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
