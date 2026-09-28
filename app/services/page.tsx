import type { Metadata } from "next";
import {
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Compass,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { services, NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services & Learning Programs",
  description:
    "Explore Agnipankh Labs' comprehensive skill development tracks: structured internships, industry training, verifiable certifications, live projects, career guidance, and expert mentorship.",
};

const SERVICE_DETAILS = [
  {
    slug: "internship-programs",
    icon: Briefcase,
    title: "Internship Programs",
    subtitle: "Hands-on, domain-specific experiential cohorts",
    blurb:
      "Gain practical experience through structured internship opportunities across various technical and professional domains. Our programs are architected to simulate real workplace sprints, deliverables, and team collaboration.",
    keyFeatures: [
      "Domain tracks in Web Development, Software Engineering, and AI/Data.",
      "Hands-on project assignments mirroring production team workflows.",
      "Regular milestone evaluations and constructive code reviews.",
      "Eligible candidates receive verifiable completion certificates.",
    ],
    cta: {
      label: "Explore Internship Tracks",
      href: "/internships",
      variant: "primary" as const,
    },
  },
  {
    slug: "training-programs",
    icon: GraduationCap,
    title: "Training Programs",
    subtitle: "Industry-aligned curricula for in-demand skills",
    blurb:
      "Industry-focused courses designed to build relevant skills and improve employability. We focus on modern frameworks, clean software architecture, and practical problem-solving rather than rote memorization.",
    keyFeatures: [
      "Curricula updated to reflect modern engineering standards.",
      "Intensive coding exercises, practical labs, and live demonstrations.",
      "Self-paced modules supplemented by scheduled mentor sessions.",
      "Structured learning roadmaps from foundational to advanced concepts.",
    ],
    cta: {
      label: "View Training Offerings",
      href: "/training",
      variant: "secondary" as const,
    },
  },
  {
    slug: "certifications",
    icon: Award,
    title: "Certifications",
    subtitle: "Tamper-proof, cryptographically verifiable credentials",
    blurb:
      "Earn professional certificates that validate your learning and accomplishments. Every certificate issued features a unique frozen ID, HMAC-SHA256 integrity hash, and a dynamic QR code for instant employer verification.",
    keyFeatures: [
      "Tamper-proof cryptographic hashes verify authenticity instantly.",
      "Unique certificate IDs adhering to strict institutional formatting.",
      "Direct verification portal accessible worldwide at agnipankhlabs.com/verify.",
      "Shareable directly to LinkedIn and professional digital portfolios.",
    ],
    cta: {
      label: "Verify a Certificate",
      href: "/verify",
      variant: "outline" as const,
    },
  },
  {
    slug: "live-projects",
    icon: Code2,
    title: "Live Projects",
    subtitle: "Production-grade builds that prove capability",
    blurb:
      "Work on real-world projects that strengthen your portfolio and practical expertise. Move beyond toy tutorials to build applications that handle real data, edge cases, and modern cloud deployment environments.",
    keyFeatures: [
      "Collaborative Git workflows with pull requests and branch management.",
      "Fullstack architectures utilizing Next.js, PostgreSQL, and cloud services.",
      "Exposure to testing methodologies, CI/CD pipelines, and linting rules.",
      "Tangible, demonstrable deliverables ready for technical interviews.",
    ],
    cta: {
      label: "Inquire About Projects",
      href: "/contact",
      variant: "primary" as const,
    },
  },
  {
    slug: "career-guidance",
    icon: Compass,
    title: "Career Guidance",
    subtitle: "Holistic professional preparation and placement readiness",
    blurb:
      "Receive support with resumes, interviews, professional development, and career planning. We equip learners with both the technical depth and professional polish required to stand out to hiring teams.",
    keyFeatures: [
      "Technical resume reviews and ATS optimization strategies.",
      "Mock technical and behavioral interview preparation sessions.",
      "LinkedIn profile enhancements and personal branding guidelines.",
      "Industry navigation tips and strategic job application advice.",
    ],
    cta: {
      label: "Get Career Support",
      href: "/contact",
      variant: "secondary" as const,
    },
  },
  {
    slug: "mentorship",
    icon: Users,
    title: "Mentorship",
    subtitle: "Direct guidance from seasoned industry professionals",
    blurb:
      "Learn directly from experienced mentors and industry professionals who provide personalized insights, architectural feedback, and actionable career direction throughout your learning journey.",
    keyFeatures: [
      "Dedicated 1-on-1 and cohort review sessions with practicing engineers.",
      "Direct code reviews highlighting best practices and performance tips.",
      "Constructive feedback on project architecture and technical decisions.",
      "Continuous encouragement and personalized career trajectory guidance.",
    ],
    cta: {
      label: "Connect with Mentors",
      href: "/contact",
      variant: "outline" as const,
    },
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="border-b border-navy/10 bg-gradient-to-b from-surface via-surface to-muted/30 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-ink/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
              <span>CORE OFFERINGS</span>
            </div>
            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl text-balance">
              Services & Skill Development Programs
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-body sm:text-xl text-pretty">
              Comprehensive educational pathways built to turn theoretical knowledge into
              verifiable, industry-ready technical capability.
            </p>
          </div>
        </Container>
      </section>

      {/* Overview Quick Nav Grid */}
      <Section className="bg-surface">
        <SectionHeading
          eyebrow="PROGRAM OVERVIEW"
          title="Explore Our Core Services"
          description="Click any offering below to jump directly to its detailed breakdown and program details."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, idx) => {
            const detail = SERVICE_DETAILS[idx];
            const Icon = detail.icon;

            return (
              <a
                key={item.slug}
                href={`#${item.slug}`}
                className="group flex h-full flex-col justify-between rounded-xl border border-navy/10 bg-white p-6 transition-all hover:border-brand-ink/40 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-ink"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand-ink transition-colors group-hover:bg-brand-ink group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-navy group-hover:text-brand-ink transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {item.blurb}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-brand-ink">
                  <span>View details</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>
      </Section>

      {/* Detailed Service Sections */}
      <div className="border-t border-navy/10 bg-muted/20 divide-y divide-navy/10">
        {SERVICE_DETAILS.map((service, idx) => {
          const Icon = service.icon;
          const isEven = idx % 2 === 0;

          return (
            <section
              key={service.slug}
              id={service.slug}
              className="scroll-mt-24 py-[2cm]"
            >
              <Container>
                <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
                  {/* Text Column */}
                  <div
                    className={
                      isEven
                        ? "lg:col-span-7 flex flex-col justify-between"
                        : "lg:col-span-7 lg:order-2 flex flex-col justify-between"
                    }
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                          {service.subtitle}
                        </span>
                      </div>

                      <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
                        {service.title}
                      </h2>

                      <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
                        {service.blurb}
                      </p>

                      <div className="mt-8 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-navy/70">
                          Program Highlights
                        </h3>
                        <ul className="space-y-2.5">
                          {service.keyFeatures.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
                              <span className="text-sm text-body">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-2">
                      <ButtonLink
                        href={service.cta.href}
                        variant={service.cta.variant}
                        size="md"
                      >
                        {service.cta.label}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </ButtonLink>
                    </div>
                  </div>

                  {/* Visual / Feature Card Column */}
                  <div
                    className={
                      isEven
                        ? "lg:col-span-5 flex flex-col justify-between"
                        : "lg:col-span-5 lg:order-1 flex flex-col justify-between"
                    }
                  >
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between border-b border-navy/10 pb-4">
                          <span className="font-heading text-sm font-bold text-navy">
                            Delivery Model
                          </span>
                          <span className="rounded-md bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-navy">
                            Structured Track
                          </span>
                        </div>

                        <div className="mt-6 space-y-4 text-sm text-body">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink font-semibold text-xs">
                              1
                            </div>
                            <div>
                              <span className="font-semibold text-navy">Curriculum Mapped</span>
                              <p className="text-xs text-body mt-0.5">
                                Aligned to contemporary engineering stacks and real team workflows.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink font-semibold text-xs">
                              2
                            </div>
                            <div>
                              <span className="font-semibold text-navy">Active Application</span>
                              <p className="text-xs text-body mt-0.5">
                                Continuous practical sprints, coding milestones, and direct builds.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink font-semibold text-xs">
                              3
                            </div>
                            <div>
                              <span className="font-semibold text-navy">Verifiable Outcome</span>
                              <p className="text-xs text-body mt-0.5">
                                Deliverable portfolios, code repositories, and tamper-proof certificates.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 rounded-xl border border-navy/10 bg-muted/30 p-4 text-xs text-body">
                        <div className="flex items-center gap-2 font-semibold text-navy">
                          <ShieldCheck className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                          <span>Quality & Standards</span>
                        </div>
                        <p className="mt-1">
                          Evaluated against structured rubrics to ensure demonstrable individual capability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          );
        })}
      </div>

      {/* Bottom Conversion & Compliance Banner */}
      <section className="border-t border-navy/10 bg-surface py-[2cm]">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-navy/90 p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                Accelerate Your Professional Growth
              </h2>
              <p className="mt-3 text-base text-white/90">
                Apply for our active internship tracks, enroll in structured training, or
                reach out for corporate partnership opportunities.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <ButtonLink href="/internships" variant="primary" size="lg">
                  Explore Internships
                </ButtonLink>
                <ButtonLink href="/contact" variant="inverse" size="lg">
                  Contact Admissions
                </ButtonLink>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-white/70">
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-white/50" aria-hidden="true" />
                <p>{NO_GUARANTEE_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
