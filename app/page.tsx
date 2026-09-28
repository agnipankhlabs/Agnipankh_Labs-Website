import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Compass,
  Users,
  CheckCircle2,
  Layers,
  TrendingUp,
  Laptop,
  Target,
  Users2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";
import { SITE } from "@/content/site";
import {
  hero,
  services,
  differentiators,
  about,
  vision,
  mission,
  companyRoadmap,
  faqs,
  NO_GUARANTEE_DISCLAIMER,
} from "@/content/marketing";
import { Container } from "@/components/ui/layout";
import { HomePageAnimatedBackground } from "@/components/ui/homepage-animated-background";

const SERVICE_ICONS = [Briefcase, GraduationCap, Award, Code2, Compass, Users];
const DIFF_ICONS = [CheckCircle2, Layers, TrendingUp, Laptop, Target, Users2];

/* ─── Reusable section heading ─────────────────────────────────────────── */
function Heading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand-ink">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg leading-relaxed text-body text-pretty ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ─── Divider line ─────────────────────────────────────────────────────── */
function Divider() {
  return <div className="border-t border-navy/10" />;
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Interactive mouse hover constellation & particle animation layer */}
      <HomePageAnimatedBackground />

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — Clean soft gradient (no image), interactive hover
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f9fc] via-white to-surface py-[2.5cm]">
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center animate-fade-in">
              <Image
                src="/images/logo-full.png"
                alt="Agnipankh Labs — Giving Wings to Innovation"
                width={400}
                height={300}
                className="h-[110px] w-auto object-contain sm:h-[180px] lg:h-[220px]"
                priority
              />
            </div>

            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-ink/20 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink animate-fade-up delay-100 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
              <span>{SITE.tagline}</span>
            </div>

            {/* Headline — Crisp Navy Text */}
            <h1 className="animate-fade-up delay-200 font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl text-balance leading-[1.15]">
              {hero.headline}
            </h1>

            {/* Sub-headline */}
            <p className="animate-fade-up delay-300 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-body sm:text-xl font-medium">
              {hero.subheadline}
            </p>

            {/* CTA row */}
            <div className="animate-fade-up delay-400 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={hero.ctas[0].href}
                prefetch={true}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink sm:w-auto"
              >
                {hero.ctas[0].label}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href={hero.ctas[1].href}
                prefetch={true}
                className="inline-flex w-full items-center justify-center rounded-xl border border-navy/20 bg-white/90 px-7 py-3.5 text-sm font-semibold text-navy shadow-2xs transition-all hover:border-navy/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink sm:w-auto"
              >
                {hero.ctas[1].label}
              </Link>
            </div>

            {/* Glassmorphic Trust strip */}
            <div className="animate-fade-up delay-500 mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 rounded-2xl border border-navy/10 bg-white/85 p-6 backdrop-blur-md shadow-md sm:grid-cols-4 sm:gap-6">
              {[
                { num: "Hands-On", sub: "Practical Learning" },
                { num: "Modern", sub: "Industry Stacks" },
                { num: "Verified", sub: "QR Certificates" },
                { num: "Expert", sub: "Mentorship" },
              ].map(({ num, sub }) => (
                <div key={sub} className="flex flex-col items-center gap-1 text-center">
                  <span className="font-heading text-base font-bold text-brand-ink sm:text-lg">{num}</span>
                  <span className="text-[11px] font-medium text-navy/80 sm:text-xs">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          SERVICES SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-[2cm]">
        <Container>
          <Heading
            eyebrow="WHAT WE OFFER"
            title="Comprehensive Skill & Career Programs"
            description="Hands-on tracks engineered to bridge academic foundations with modern industry requirements."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {services.map((item, idx) => {
              const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length];
              return (
                <div
                  key={item.slug}
                  className="reveal group flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-ink/30 hover:shadow-md"
                >
                  <div>
                    {/* Icon */}
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-ink transition-colors group-hover:bg-brand-ink group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    {/* Title */}
                    <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
                    {/* Blurb */}
                    <p className="mt-2 text-sm leading-relaxed text-body">{item.blurb}</p>
                  </div>
                  {/* Link */}
                  <div className="mt-6 pt-4 border-t border-navy/8">
                    <Link
                      href={`/services#${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover"
                    >
                      Learn more
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          DIFFERENTIATORS SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f8f9fc] py-[2cm]">
        <Container>
          <Heading
            eyebrow="THE AGNIPANKH ADVANTAGE"
            title="Why Learners Choose Our Programs"
            description="Designed from the ground up to replace passive theory with rigorous, verifiable competence."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {differentiators.map((diff, idx) => {
              const Icon = DIFF_ICONS[idx % DIFF_ICONS.length];
              return (
                <div
                  key={diff.title}
                  className="reveal group flex h-full items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/8 transition-all hover:ring-brand-ink/30 hover:shadow-md"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-navy">{diff.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-body">{diff.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          ABOUT SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-[2cm]">
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Story */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand-ink">
                  ABOUT AGNIPANKH LABS
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
                  {about.heading}
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-body">
                  <p>{about.paragraphs[0]}</p>
                  <p>{about.paragraphs[1]}</p>
                </div>
              </div>

              <div>
                {/* Micro-stats */}
                <div className="mt-8 grid grid-cols-3 gap-6 border-t border-navy/10 pt-6">
                  {[
                    { num: "6+", label: "Programs" },
                    { num: "4", label: "Domains" },
                    { num: "QR", label: "Verified Certs" },
                  ].map((s) => (
                    <div key={s.label}>
                      <span className="block font-heading text-3xl font-bold text-brand-ink">{s.num}</span>
                      <span className="text-sm text-body">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:text-brand-hover"
                  >
                    Read our full story & leadership
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Dark vision card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-navy p-8 text-white shadow-2xl sm:p-10">
              {/* Decorative blobs */}
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/15 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-royal/15 blur-2xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-md bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Our Vision
                </span>
                <blockquote className="mt-5 font-heading text-lg font-semibold leading-snug text-white">
                  &ldquo;{vision.statement}&rdquo;
                </blockquote>

                <div className="mt-8 border-t border-white/15 pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Core Mission Focus
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {mission.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-white/85">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative mt-8 pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Learn more about us
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          ROADMAP SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f8f9fc] py-[2cm]">
        <Container>
          <Heading
            eyebrow="OUR STRATEGIC ROADMAP"
            title="Company Phase Milestones"
            description="A transparent outline of our phased development and long-term organizational expansion."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {companyRoadmap.map((item) => (
              <div
                key={item.phase}
                className="reveal group flex h-full items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/8 transition-all hover:ring-brand-ink/30 hover:shadow-md"
              >
                {/* Phase number */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy font-heading text-sm font-bold text-white transition-colors group-hover:bg-brand-ink">
                  {item.phase}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink">
                    Phase {item.phase}
                  </p>
                  <h3 className="mt-0.5 font-heading text-sm font-semibold text-navy">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          FAQ SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-[2cm]">
        <Container>
          <Heading
            eyebrow="FREQUENTLY ASKED QUESTIONS"
            title="Everything You Need to Know"
            description="Clear answers regarding our programs, internship formats, and certification credentials."
          />

          <div className="mx-auto mt-12 max-w-3xl divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
            {faqs.map((faq, idx) => (
              <details
                key={faq.q}
                className="group"
                open={idx === 0}
              >
                <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-4 px-6 py-5 font-heading text-base font-semibold text-navy transition-colors hover:bg-navy/3 focus-visible:outline-2 focus-visible:outline-brand-ink">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-navy/40 transition-transform duration-200 group-open:rotate-180 group-open:text-brand-ink"
                    aria-hidden="true"
                  />
                </summary>
                <div className="border-t border-navy/8 bg-[#fafafa] px-6 py-4 text-sm leading-relaxed text-body">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          CONTACT STRIP — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f8f9fc] py-[2cm]">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: PhoneCall,
                label: "Call Us",
                value: SITE.phone,
                href: `tel:${SITE.phone.replace(/\s+/g, "")}`,
              },
              {
                icon: Mail,
                label: "Email Us",
                value: SITE.email.info,
                href: `mailto:${SITE.email.info}`,
              },
              {
                icon: MapPin,
                label: "Location",
                value: SITE.location.display,
                href: "/contact",
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="group flex h-full items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/8 transition-all hover:ring-brand-ink/30 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-ink transition-colors group-hover:bg-brand-ink group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-body">{label}</p>
                  <p className="mt-0.5 text-sm font-medium text-navy">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════
          CTA BANNER SECTION — 2 cm vertical spacing
          ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-[2cm]">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-12 shadow-2xl sm:px-14 sm:py-16 lg:px-20 lg:py-16">
            {/* Blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-royal/10 blur-3xl" />
            {/* Dot grid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-md bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Start Your Journey</span>
                </div>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                  Ready to Build Industry-Ready Skills?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/70 sm:text-lg">
                  Explore our upcoming internship cohorts, hands-on training tracks, and credential
                  verification platform.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  href="/internships"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-ink px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Explore Internships
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Contact Our Team
                </Link>
              </div>
            </div>

            <p className="relative z-10 mt-6 text-xs text-white/40">{NO_GUARANTEE_DISCLAIMER}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
