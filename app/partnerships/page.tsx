import type { Metadata } from "next";
import {
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  ShieldCheck,
  BarChart3,
  Layers,
} from "lucide-react";
import { SITE } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { PartnershipForm } from "@/components/forms/partnership-form";

export const metadata: Metadata = {
  title: "Partnerships",
  description:
    "Partner with Agnipankh Labs. We collaborate with colleges, universities, corporate employers, CSR foundations, and sponsors to deliver industry-grade practical education.",
};

const PARTNERSHIP_MODELS = [
  {
    type: "COLLEGE",
    icon: GraduationCap,
    title: "Colleges & Universities",
    subtitle: "Institutional MoUs & Cohort Upskilling",
    description:
      "Complement your existing academic syllabus with practical, industry-aligned internship modules, experiential workshops, and structured capstone reviews.",
    benefits: [
      "Institutional MoUs tailored to university academic calendars.",
      "Hands-on internship cohorts with verifiable project deliverables.",
      "Joint workshops on emerging software architectures and DevOps.",
      "Comprehensive milestone tracking and student progress reports.",
    ],
  },
  {
    type: "CORPORATE",
    icon: Briefcase,
    title: "Corporate & Hiring Employers",
    subtitle: "Pre-Trained Talent & Project Sponsorship",
    description:
      "Source junior engineers and interns who have already built real software, navigated collaborative Git workflows, and passed rigorous technical evaluations.",
    benefits: [
      "Access to pre-assessed, high-intent student candidate pipelines.",
      "Sponsor real-world capstone projects solving actual business cases.",
      "Custom training tracks built around your internal technical stack.",
      "Zero recruitment friction with cryptographically verified credentials.",
    ],
  },
  {
    type: "CSR",
    icon: HeartHandshake,
    title: "CSR Foundations",
    subtitle: "Empowerment & High-Impact Skilling",
    description:
      "Deploy corporate social responsibility capital into tangible skill development programs that empower underprivileged students with high-demand digital skills.",
    benefits: [
      "Audited execution with full transparency and milestone accountability.",
      "High-impact technical bootcamps targeting tier-2/tier-3 institutions.",
      "Empowering first-generation learners with marketable competence.",
      "Structured reporting aligned with Indian CSR compliance mandates.",
    ],
  },
  {
    type: "SPONSOR",
    icon: Sparkles,
    title: "Event & Program Sponsors",
    subtitle: "Hackathons, Summits & Campus Innovation",
    description:
      "Gain direct visibility among motivated students, young developers, and academic leaders through sponsored hackathons, innovation challenges, and campus events.",
    benefits: [
      "Prominent brand alignment with education and technological innovation.",
      "Direct engagement with motivated engineering students and creators.",
      "Keynote speaking and mentor participation opportunities.",
      "Cross-channel visibility across our active digital and campus channels.",
    ],
  },
];

const VALUE_PROPS = [
  {
    icon: Layers,
    title: "Turnkey Execution",
    description:
      "We handle curriculum delivery, technical infrastructure, mentor scheduling, and candidate evaluations end-to-end.",
  },
  {
    icon: ShieldCheck,
    title: "Verifiable Standards",
    description:
      "Every project submission is evaluated against transparent rubrics, and all credentials feature tamper-proof cryptographic verification.",
  },
  {
    icon: BarChart3,
    title: "Transparent Reporting",
    description:
      "Institutional partners receive granular attendance logs, code commit analytics, milestone metrics, and completion summaries.",
  },
];

export default function PartnershipsPage() {
  return (
    <>
      {/* Page Header */}
      <section className="border-b border-navy/10 bg-gradient-to-b from-surface via-surface to-muted/30 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-ink/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
              <span>COLLABORATIVE ECOSYSTEM</span>
            </div>
            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl text-balance">
              Institutional & Industry Partnerships
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-body sm:text-xl text-pretty">
              Joining forces with academic institutions, hiring organizations, and
              foundations to build India&apos;s most rigorous practical education ecosystem.
            </p>
          </div>
        </Container>
      </section>

      {/* 4 Partnership Tracks */}
      <Section className="bg-surface">
        <SectionHeading
          eyebrow="COLLABORATION MODELS"
          title="Ways We Work Together"
          description="Select the partnership track that matches your institutional mission, campus requirements, or hiring goals."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {PARTNERSHIP_MODELS.map((model) => {
            const Icon = model.icon;
            return (
              <div
                key={model.type}
                className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-7 shadow-xs transition-all hover:border-brand-ink/40 sm:p-8"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-ink">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                        {model.subtitle}
                      </span>
                      <h3 className="font-heading text-xl font-bold text-navy">
                        {model.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-body">
                    {model.description}
                  </p>

                  <div className="mt-6 border-t border-navy/5 pt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-navy/70">
                      Key Capabilities
                    </h4>
                    <ul className="mt-3 space-y-2.5">
                      {model.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
                          <span className="text-xs font-medium text-navy/90 leading-relaxed">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-navy/10">
                  <a
                    href="#partner-form"
                    className="inline-flex text-xs font-semibold uppercase tracking-wider text-brand-ink hover:text-brand-hover hover:underline"
                  >
                    Initiate {model.title} Partnership →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Institutional Advantage Strip */}
      <Section className="border-t border-navy/10 bg-muted/30">
        <SectionHeading
          eyebrow="THE AGNIPANKH STANDARD"
          title="Why Partner With Us"
          description="Engineered to remove friction from institutional training and deliver measurable, verifiable candidate competence."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div
                key={prop.title}
                className="flex h-full flex-col justify-between rounded-xl border border-navy/10 bg-white p-6 shadow-xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-navy">
                    {prop.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Partnership Submission Form */}
      <Section id="partner-form" className="scroll-mt-24 border-t border-navy/10 bg-surface">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-navy/10 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                  OFFICIAL ENQUIRY
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-navy">
                  Initiate an Institutional Partnership
                </h2>
                <p className="mt-1.5 text-sm text-body">
                  Submit your organisation details below. Our partnerships desk will
                  schedule an exploratory discussion within 1–2 business days.
                </p>
              </div>

              <PartnershipForm />
            </div>
          </div>

          {/* Contact Details & Desk Information */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-navy/10 bg-muted/30 p-6 sm:p-7">
              <h3 className="font-heading text-lg font-bold text-navy">
                Partnerships Coordination Desk
              </h3>
              <p className="mt-1 text-xs text-body">
                Direct contact channels for institutional liaisons, MoUs, and corporate relations.
              </p>

              <div className="mt-6 space-y-4 text-sm text-body">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Dedicated Email
                    </span>
                    <a
                      href={`mailto:${SITE.email.partnerships}`}
                      className="font-medium text-navy hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                      {SITE.email.partnerships}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-brand-ink">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-navy/70">
                      Direct Telephone
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
              </div>
            </div>

            <div className="rounded-2xl border border-navy/10 bg-navy p-6 text-white shadow-md">
              <span className="inline-block rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                MoU Turnaround
              </span>
              <h4 className="mt-3 font-heading text-lg font-bold text-white">
                Fast-Track College Onboarding
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                We provide standardized, legally verified MoU templates allowing engineering
                departments and university training cells to finalize student internship
                cohorts with zero bureaucratic delay.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Mandatory Disclaimer */}
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
