import type { Metadata } from "next";
import {
  Users,
  GraduationCap,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { AmbassadorApplicationForm } from "./ambassador-form";

export const metadata: Metadata = {
  title: "Become a Campus Ambassador | Agnipankh Labs",
  description: "Join our Campus Ambassador Programme. Earn rewards, build your network, and represent Agnipankh Labs at your campus.",
  openGraph: {
    title: "Become a Campus Ambassador | Agnipankh Labs",
    description: "Join our Campus Ambassador Programme. Earn rewards, build your network.",
    type: "website",
  },
};

export default function AmbassadorApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-navy/95 via-navy to-royal/90 py-[2cm]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <Container>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white mb-6">
              <Users className="h-3.5 w-3.5" />
              <span>Campus Ambassador Programme</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Represent. Grow. Lead.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Join our Campus Ambassador Programme and become the face of Agnipankh Labs at your campus. Build leadership skills, earn exclusive rewards, and connect with a national network of student leaders.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#apply"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-navy hover:bg-white/90 transition-colors shadow-lg"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#benefits"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                View Benefits
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Benefits Section */}
      <Section id="benefits" className="py-[2cm] bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy">Why Become an Ambassador?</h2>
            <p className="mt-4 text-lg text-body">Unlock exclusive benefits designed to accelerate your growth.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Award, title: "Tiered Rewards", desc: "Progress through 4 tiers (5→10→25→50+ referrals) with increasing rewards at each level." },
              { icon: Star, title: "Senior Status", desc: "Top performers earn Senior Ambassador status with higher reward rates and exclusive access." },
              { icon: GraduationCap, title: "Skill Building", desc: "Access to exclusive workshops, webinars, and mentorship from industry professionals." },
              { icon: Users, title: "National Network", desc: "Connect with 100+ ambassadors across India. Build lasting relationships with peer leaders." },
              { icon: Award, title: "Certification", desc: "Earn verified digital certificates for your ambassador work. Showcase on LinkedIn and resume." },
              { icon: Star, title: "Early Access", desc: "Get early access to new courses, internships, and events before public launch." },
              { icon: Users, title: "Swag & Merch", desc: "Exclusive Agnipankh Labs merchandise, stickers, and welcome kits for active ambassadors." },
              { icon: ArrowRight, title: "Career Boost", desc: "Stand out to employers with leadership experience and verified referral metrics." },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-xs hover:border-brand-ink/20 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-ink/10 text-brand-ink mb-4">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{benefit.title}</h3>
                  <p className="text-sm text-body">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tier Progression */}
          <div className="mt-16 rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="font-heading text-2xl font-bold text-navy text-center mb-8">Tier Progression</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {[
                { tier: "Tier 1", referrals: "5+", reward: "Welcome kit + Certificate", color: "amber" },
                { tier: "Tier 2", referrals: "10+", reward: "Swag pack + Workshop access", color: "orange" },
                { tier: "Tier 3", referrals: "25+", reward: "Premium merch + Mentorship", color: "purple" },
                { tier: "Tier 4", referrals: "50+", reward: "Senior status + Exclusive rewards", color: "pink" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="relative rounded-xl p-5 text-center bg-gradient-to-br from-white to-muted/20 border border-navy/10 flex h-full flex-col justify-between"
                >
                  <div>
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-3 bg-${t.color}-100 text-${t.color}-600`}>
                      <Award className="h-7 w-7" />
                    </div>
                    <h4 className="font-heading text-lg font-bold text-navy mb-1">{t.tier}</h4>
                    <p className="text-sm text-navy/60 mb-2">{t.referrals} referrals</p>
                    <p className="text-xs text-body">{t.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Application Form */}
      <Section id="apply" className="py-[2cm] bg-muted/20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs">
              <div className="text-center mb-8">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy">Apply Now</h2>
                <p className="mt-2 text-body">Fill out the form below. We&apos;ll review your application within 5-7 business days.</p>
              </div>

              <AmbassadorApplicationForm />
            </div>

            {/* Disclaimer */}
            <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold mb-1">Note:</p>
              <p>Selection is based on campus involvement, leadership potential, and alignment with our values. Not all applicants will be selected. All decisions are final.</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="py-[2cm] bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-body">Everything you need to know before applying.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "Who can apply?", a: "Any currently enrolled undergraduate or postgraduate student at a recognized Indian university/college can apply. You must be active on campus and have a passion for technology, learning, and community building." },
              { q: "What is the time commitment?", a: "We expect ambassadors to dedicate 3-5 hours per month to promote events, share content, and engage with their campus community. The program is flexible around your academic schedule." },
              { q: "How are referrals tracked?", a: "Each ambassador gets a unique 8-character referral code. When someone registers using your code, it's automatically attributed to you in real-time." },
              { q: "What rewards do I get?", a: "Rewards include welcome kits, exclusive merchandise, workshop access, mentorship sessions, digital certificates, and Senior Ambassador status for top performers." },
              { q: "Can I be an ambassador if I'm not in a tech major?", a: "Absolutely! We welcome students from all disciplines. Diversity of backgrounds strengthens our community." },
              { q: "How long does the application process take?", a: "We review applications within 5-7 business days. Selected candidates will receive an email with next steps and their unique referral code." },
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-navy/10 bg-white p-5">
                <summary className="flex items-center gap-3 cursor-pointer list-none font-semibold text-navy">
                  <span>{faq.q}</span>
                  <svg className="ml-auto h-5 w-5 text-navy/40 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-body">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="py-[2cm] bg-navy/95">
        <Container className="max-w-xl text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">Ready to Lead?</h2>
          <p className="mt-4 text-lg text-white/80">Join 100+ student leaders representing Agnipankh Labs across India.</p>
          <div className="mt-8">
            <Link
              href="#apply"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-semibold text-navy hover:bg-white/90 transition-colors shadow-lg"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Container>
      </Section>
    </div>
  );
}