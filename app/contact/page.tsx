import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section } from "@/components/ui/layout";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Agnipankh Labs. Enquire about student internships, university collaborations, corporate partnerships, or certificate validation.",
};

const OFFICIAL_DESKS = [
  {
    role: "Internships & Admissions",
    email: SITE.email.internships,
    description: "Application updates, domain selection, and cohort onboarding.",
  },
  {
    role: "Institutional Partnerships",
    email: SITE.email.partnerships,
    description: "College MoUs, university training cells, and hiring partners.",
  },
  {
    role: "Credential Verification",
    email: SITE.email.certificates,
    description: "Certificate validation and student credential queries.",
  },
  {
    role: "Learner Support",
    email: SITE.email.support,
    description: "Technical issues, learning platform access, and general help.",
  },
  {
    role: "Careers Desk",
    email: SITE.email.careers,
    description: "Mentor applications, operational roles, and team opportunities.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="border-b border-navy/10 bg-gradient-to-b from-surface to-muted/30 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              GET IN TOUCH
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              We&apos;d Love to Hear From You
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-body">
              Whether you are an aspiring student, college administrator, prospective
              corporate partner, or an employer verifying credentials, our team is ready
              to assist.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content: Form + Contact Cards */}
      <Section className="bg-surface">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-navy/10 pb-5">
                <h2 className="font-heading text-2xl font-bold text-navy">
                  Send a Direct Message
                </h2>
                <p className="mt-1 text-sm text-body">
                  Fill out the form below and our operations team will respond within 1–2
                  business days.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>

          {/* Right Column: Information & Department Desks */}
          <div className="space-y-6 lg:col-span-5">
            {/* Quick Contact Overview Card */}
            <div className="rounded-2xl border border-navy/10 bg-muted/30 p-6 sm:p-7">
              <h2 className="font-heading text-lg font-bold text-navy">
                General Enquiries
              </h2>
              <p className="mt-1 text-xs text-body">
                Official contact channels for general queries and communications.
              </p>

              <div className="mt-6 space-y-4 text-sm text-body">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Telephone
                    </span>
                    <a
                      href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                      className="font-medium text-navy hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                      {SITE.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${SITE.email.info}`}
                      className="font-medium text-navy hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                      {SITE.email.info}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Location
                    </span>
                    <span className="font-medium text-navy">
                      {SITE.location.display}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Operating Hours
                    </span>
                    <span className="font-medium text-navy">
                      Monday to Saturday, 9:30 AM – 6:30 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialized Department Desks Card */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="font-heading text-lg font-bold text-navy">
                Specialized Desks
              </h2>
              <p className="mt-1 text-xs text-body">
                Route your request directly to the appropriate functional team.
              </p>

              <div className="mt-5 divide-y divide-navy/10">
                {OFFICIAL_DESKS.map((desk) => (
                  <div key={desk.email} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-navy">
                        {desk.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-body">{desk.description}</p>
                    <a
                      href={`mailto:${desk.email}`}
                      className="mt-1.5 inline-flex text-xs font-medium text-brand-ink hover:text-brand-hover hover:underline focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                      {desk.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Helper */}
            <div className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 text-xs text-body">
                <ShieldCheck className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                <span>Need to verify a certificate instantly?</span>
              </div>
              <Link
                href="/verify"
                className="text-xs font-semibold text-brand-ink hover:text-brand-hover hover:underline"
              >
                Go to Verification →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Mandatory Disclaimer Note */}
      <section className="border-t border-navy/10 bg-muted/20 py-8">
        <Container>
          <div className="flex items-center gap-3 text-center text-xs text-body sm:text-left">
            <HelpCircle className="h-4 w-4 shrink-0 text-navy/40" aria-hidden="true" />
            <p>{NO_GUARANTEE_DISCLAIMER}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
