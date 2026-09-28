import type { Metadata } from "next";
import Image from "next/image";
import {
  Lightbulb,
  Shield,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Quote,
  Building,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { SITE } from "@/content/site";
import {
  about,
  vision,
  mission,
  coreValues,
  foundersMessage,
  departments,
  brandPersonality,
  NO_GUARANTEE_DISCLAIMER,
} from "@/content/marketing";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Agnipankh Labs — our mission, vision, leadership, core values, and our commitment to bridging academic learning with industry-ready competence.",
};

const VALUE_ICONS = [Lightbulb, Shield, Award, TrendingUp, Sparkles];

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="border-b border-navy/10 bg-gradient-to-b from-surface via-surface to-muted/30 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            {/* Official Logo Brand Showcase */}
            <div className="mb-6 flex justify-center">
              <div className="relative inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-xs border border-navy/10 hover:border-brand/30 transition-all group">
                <Image
                  src="/images/logo-full.png"
                  alt="Agnipankh Labs Logo"
                  width={220}
                  height={140}
                  className="h-20 sm:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              ABOUT AGNIPANKH LABS
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl text-balance">
              Giving Wings to Next-Generation Innovators
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-body sm:text-xl text-pretty">
              Bridging academic theory and industry demands through structured internships,
              hands-on engineering builds, and verifiable professional milestones.
            </p>

            {/* Brand Traits Badge Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {brandPersonality.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border border-navy/10 bg-white px-3.5 py-1 text-xs font-medium text-navy shadow-2xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Story & Background */}
      <Section className="bg-surface">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                OUR GENESIS
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
                The Journey to Bridge the Theory-Practice Divide
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-body">
                {about.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-muted/40 p-7 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">
                The Spirit of Agnipankh
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-body">
                The name &ldquo;Agnipankh&rdquo; carries profound significance — symbolizing
                courage, resilience, and the determination to soar beyond limitations.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-body">
                We operate from {SITE.location.display}, collaborating across academic
                institutions and tech domains to prepare learners for real-world excellence.
              </p>
            </div>

            <div className="mt-6 border-t border-navy/10 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy/70">
                Official Tagline
              </span>
              <p className="mt-1 font-heading text-lg font-bold text-brand-ink">
                &ldquo;{SITE.tagline}&rdquo;
              </p>
            </div>

            {/* Innovation Lab Image */}
            <div className="mt-6 overflow-hidden rounded-xl border border-navy/10 shadow-sm">
              <Image
                src="/images/about-mission.jpg"
                alt="Agnipankh Innovation Lab Facilities & Workspace"
                width={800}
                height={450}
                className="w-full h-auto object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Vision & Mission */}
      <Section className="border-t border-navy/10 bg-muted/30">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Vision Card */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-navy/15 bg-navy p-8 text-white shadow-md">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                Our Vision
              </div>
              <h3 className="mt-5 font-heading text-2xl font-bold text-white">
                Architecting Global Career Readiness
              </h3>
              <blockquote className="mt-4 font-heading text-lg font-normal leading-relaxed text-white/90">
                &ldquo;{vision.statement}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Mission Card */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">
                Our Strategic Mission
              </div>
              <h3 className="mt-5 font-heading text-2xl font-bold text-navy">
                Action-Driven Pillars
              </h3>
              <ul className="mt-5 space-y-3.5">
                {mission.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-ink" aria-hidden="true" />
                    <span className="text-sm font-medium leading-relaxed text-navy">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Founder's Message */}
      <Section className="border-t border-navy/10 bg-surface">
        <div className="mx-auto max-w-4xl">
          <div className="reveal relative rounded-2xl border border-navy/10 bg-gradient-to-b from-white to-muted/20 p-8 shadow-sm sm:p-12">
            {/* Decorative large quote mark */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 left-8 font-heading text-[8rem] font-bold leading-none text-brand/10 select-none"
            >
              &ldquo;
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                <Quote className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                LEADERSHIP PERSPECTIVE
              </p>
            </div>

            <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Message from Our Founder
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-body">
              {foundersMessage.quotes.map((quote, idx) => (
                <p key={idx} className="italic">
                  &ldquo;{quote}&rdquo;
                </p>
              ))}
            </div>

            <div className="mt-8 border-t border-navy/10 pt-6">
              <p className="font-heading text-base font-bold text-navy">
                {foundersMessage.attribution}
              </p>
              <p className="text-xs text-body">
                Championing experiential education and student empowerment.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Core Values */}
      <Section className="border-t border-navy/10 bg-muted/20">
        <SectionHeading
          eyebrow="GUIDING PRINCIPLES"
          title="Our Foundational Values"
          description="The institutional commitments that shape our mentorship, assessment standards, and corporate conduct."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((value, idx) => {
            const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
            return (
              <Card
                key={value.title}
                className="flex h-full flex-col justify-between transition-all hover:border-brand-ink/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold text-navy">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {value.body}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Leadership Section */}
      <Section id="leadership" className="border-t border-navy/10 bg-surface">
        <SectionHeading
          eyebrow="ORGANIZATIONAL LEADERSHIP"
          title="Meet Our Leadership Team"
          description="Dedicated educators, technologists, and operators guiding Agnipankh Labs toward its vision."
        />

          {/* Leadership cards — initials avatar */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {SITE.leadership.map((leader) => {
              const initials = leader.name
                .split(" ")
                .filter((_, i) => i === 0 || i === leader.name.split(" ").length - 1)
                .map((n) => n[0])
                .join("");
              return (
                <div
                  key={leader.name}
                  className="reveal flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-7 shadow-xs transition-colors hover:border-brand-ink/40"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy font-heading text-lg font-bold text-white tracking-wider">
                      {initials}
                    </div>
                    <h3 className="mt-5 font-heading text-xl font-bold text-navy">
                      {leader.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                        {leader.role}
                      </span>
                      <span className="text-xs text-navy/30">•</span>
                      <span className="text-xs text-body">{leader.remit}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-body">
                      Committed to delivering impactful learning tracks and establishing
                      high-standard student pathways.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
      </Section>

      {/* Operational Departments */}
      <Section className="border-t border-navy/10 bg-muted/30">
        <SectionHeading
          eyebrow="INTERNAL STRUCTURE"
          title="Operational Departments"
          description="Specialized units working cohesively to ensure curriculum relevance, candidate success, and institutional compliance."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="flex h-full flex-col justify-between rounded-xl border border-navy/10 bg-white p-5 transition-colors hover:border-brand-ink/30"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    <Building className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-navy">
                    {dept.name}
                  </h3>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-body">
                  {dept.remit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Conversion Banner */}
      <section className="border-t border-navy/10 bg-surface py-[2cm]">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-navy/90 p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                Partner with Agnipankh Labs
              </h2>
              <p className="mt-3 text-base text-white/90">
                Whether you are a student eager to learn or an academic institution seeking
                to empower your cohorts, we are ready to collaborate.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <ButtonLink href="/internships" variant="primary" size="lg">
                  Explore Internships
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="inverse" size="lg">
                  Connect with Us
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
