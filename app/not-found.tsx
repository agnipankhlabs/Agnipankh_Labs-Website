import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";
import { Container } from "@/components/ui/layout";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center py-[2cm]">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo-full.png"
              alt="Agnipankh Labs"
              width={160}
              height={60}
              className="h-12 w-auto object-contain opacity-60"
            />
          </div>

          {/* 404 number — styled as a display element, not a heading */}
          <div
            aria-hidden="true"
            className="mb-4 font-heading text-[8rem] font-bold leading-none text-navy/8 select-none sm:text-[12rem]"
          >
            404
          </div>

          <h1 className="-mt-4 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-body">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved. Let&apos;s get you back on track.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-ink px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to Home
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-navy/20 bg-white px-6 py-3 text-sm font-semibold text-navy transition-all hover:border-navy/40 hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              View Internships
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-12 border-t border-navy/10 pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-body">
              Popular Pages
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Services", href: "/services" },
                { label: "Training", href: "/training" },
                { label: "Blog", href: "/blog" },
                { label: "Verify Certificate", href: "/verify" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-brand-ink hover:text-brand-hover hover:underline focus-visible:outline-2 focus-visible:outline-brand-ink"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </div>
  );
}
