import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Code2,
  Brain,
  Cloud,
  ShieldAlert,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Technical Training & Bootcamps | Agnipankh Labs",
  description:
    "Industry-focused technical training programs in Full-Stack Web Development, AI/ML, Cloud DevOps, Cybersecurity, and Data Science built for practical career readiness.",
  openGraph: {
    title: "Training Programs | Agnipankh Labs",
    description:
      "Master high-demand tech skills with hands-on labs, live capstones, and verifiable industry credentials.",
    type: "website",
  },
};

const TRAINING_PROGRAMS = [
  {
    id: "fullstack-web",
    title: "Full-Stack Web Engineering Track",
    domain: "Software Development",
    duration: "12 Weeks",
    level: "Beginner to Advanced",
    icon: Code2,
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-200",
    summary:
      "Master modern frontend and backend development with Next.js, React, Node.js, TypeScript, and SQL/NoSQL databases through real production builds.",
    skills: ["Next.js / React", "TypeScript", "Node.js & Express", "PostgreSQL & Prisma", "REST & GraphQL APIs"],
  },
  {
    id: "ai-ml-engineering",
    title: "Applied AI & Machine Learning",
    domain: "Artificial Intelligence",
    duration: "12 Weeks",
    level: "Intermediate",
    icon: Brain,
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200",
    summary:
      "Build deep learning models, fine-tune LLMs, process computer vision pipelines, and deploy ML models to production using Python and PyTorch.",
    skills: ["Python & PyTorch", "LLM Prompting & RAG", "Scikit-Learn", "OpenCV", "Model Deployment"],
  },
  {
    id: "cloud-devops",
    title: "Cloud Infrastructure & DevOps",
    domain: "Cloud & Systems",
    duration: "10 Weeks",
    level: "Intermediate",
    icon: Cloud,
    badgeColor: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
    summary:
      "Learn container orchestration, infrastructure as code, automated CI/CD pipelines, and cloud security on AWS and Docker/Kubernetes.",
    skills: ["Docker & Kubernetes", "AWS Cloud Core", "Terraform IaC", "GitHub Actions CI/CD", "Linux Administration"],
  },
  {
    id: "cybersecurity-soc",
    title: "Cybersecurity & Defense Operations",
    domain: "Security",
    duration: "10 Weeks",
    level: "Beginner to Intermediate",
    icon: ShieldAlert,
    badgeColor: "bg-rose-500/10 text-rose-700 border-rose-200",
    summary:
      "Hands-on vulnerability assessment, network traffic analysis, SOC monitoring, penetration testing fundamentals, and ethical hacking protocols.",
    skills: ["Network Security", "Wireshark & Nmap", "Penetration Testing", "SOC Fundamentals", "Cryptographic Standards"],
  },
  {
    id: "data-analytics",
    title: "Data Analytics & Business Intelligence",
    domain: "Data Science",
    duration: "8 Weeks",
    level: "Beginner",
    icon: BarChart3,
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-200",
    summary:
      "Transform complex raw dataset feeds into actionable business decisions using SQL, Pandas, Tableau, and automated dashboards.",
    skills: ["SQL & Data Modeling", "Python Pandas/Numpy", "Tableau & PowerBI", "Statistical Analysis", "Data Visualization"],
  },
  {
    id: "mobile-app-dev",
    title: "Cross-Platform Mobile Engineering",
    domain: "Mobile Development",
    duration: "8 Weeks",
    level: "Intermediate",
    icon: Smartphone,
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    summary:
      "Develop responsive, high-performance mobile applications for iOS and Android using React Native and Flutter frameworks.",
    skills: ["React Native / Expo", "Flutter & Dart", "Mobile UI/UX", "Native Device APIs", "App Store Deployment"],
  },
];

export default function TrainingPage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f9fc] to-surface py-[2cm]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-[300px] w-[300px] rounded-full bg-royal/5 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Brand Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/logo-full.png"
                alt="Agnipankh Labs Logo"
                width={220}
                height={80}
                className="h-16 w-auto object-contain sm:h-20"
                priority
              />
            </div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-ink/20 bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Skill-First Learning Pathways</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl text-balance">
              Industry-Focused Training Programs
            </h1>

            {/* Sub-headline */}
            <p className="mt-4 text-lg leading-relaxed text-body sm:text-xl text-pretty">
              Equip yourself with practical, modern engineering competencies. Learn through structured
              curricula, live project sprints, and 1-on-1 expert code reviews.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="#tracks" variant="primary" size="lg" className="gap-2">
                <span>View All Training Tracks</span>
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                <span>Inquire for Institutional Cohorts</span>
              </ButtonLink>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Production-Grade Capstones",
                body: "Build real projects using modern frameworks and standard industry workflows.",
              },
              {
                icon: Users,
                title: "1-on-1 Mentor Reviews",
                body: "Receive direct feedback on code quality, architecture patterns, and optimization.",
              },
              {
                icon: Award,
                title: "Verifiable Certifications",
                body: "Earn tamper-evident certificates backed by immutable SHA-256 validation IDs.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-xs ring-1 ring-navy/5"
                >
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-ink">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-navy">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-body">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PROGRAM TRACKS GRID — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <Section id="tracks" className="bg-white">
        <SectionHeading
          eyebrow="COHORT TRACKS"
          title="Explore Technical Training Paths"
          description="Select a specialized track tailored to build high-demand skills for current market needs."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TRAINING_PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <Card
                key={program.id}
                className="flex h-full flex-col justify-between transition-all hover:border-brand-ink/30 hover:shadow-lg"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${program.badgeColor}`}
                    >
                      {program.domain}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-body">
                      <Clock className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
                      <span>{program.duration}</span>
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="mt-5 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <Icon className="h-6 w-6 text-brand-ink" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-navy hover:text-brand-ink">
                        {program.title}
                      </h3>
                      <p className="text-xs font-medium text-navy/60">{program.level}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 text-xs leading-relaxed text-body">{program.summary}</p>

                  {/* Skills tags */}
                  <div className="mt-6 border-t border-navy/5 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-body">
                      Key Competencies
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {program.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-navy/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center gap-3 border-t border-navy/10 pt-4">
                  <ButtonLink
                    href="/contact"
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center text-xs"
                  >
                    <span>Curriculum Info</span>
                  </ButtonLink>
                  <ButtonLink
                    href={`/contact?program=${encodeURIComponent(program.title)}`}
                    variant="primary"
                    size="sm"
                    className="flex-1 justify-center gap-1.5 text-xs"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          PEDAGOGY / METHODOLOGY — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <Section className="bg-[#f8f9fc]">
        <SectionHeading
          eyebrow="LEARNING METHODOLOGY"
          title="How Our Training Programs Work"
          description="Structured 4-step execution framework designed to ensure practical mastery."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Conceptual Foundations",
              body: "Interactive live modules covering core architecture principles and industry best practices.",
            },
            {
              step: "02",
              title: "Hands-On Lab Sprints",
              body: "Guided coding challenges, real-time debugging labs, and problem-solving exercises.",
            },
            {
              step: "03",
              title: "Capstone Delivery",
              body: "Build and deploy an end-to-end production application under mentor guidance.",
            },
            {
              step: "04",
              title: "Verification & Audit",
              body: "Undergo final milestone code reviews and receive a cryptographically verified credential.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-xs"
            >
              <div>
                <span className="font-mono text-2xl font-black text-brand-ink/40">{item.step}</span>
                <h3 className="mt-3 font-heading text-base font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-body">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          COLLEGE & INSTITUTIONAL CALLOUT — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <Section className="bg-white">
        <Container>
          <div className="rounded-3xl bg-navy p-8 sm:p-12 text-white shadow-xl">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <span className="inline-block rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Institutional Solutions
                </span>
                <h2 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
                  Custom Training Cohorts for Colleges & Institutions
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/85">
                  Are you an academic institution seeking to deliver industry-aligned technical bootcamps
                  or faculty development workshops? Partner with Agnipankh Labs for tailored curricula
                  and hands-on lab platforms.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Custom Syllabus Mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Dedicated Mentor Panel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Institutional Certification</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <ButtonLink
                  href="/partnerships"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-center sm:w-auto"
                >
                  Explore College Partnerships →
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
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
