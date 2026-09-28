import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldAlert } from "lucide-react";
import { SITE, copyrightLine, hasSocialLinks } from "@/content/site";
import { NO_GUARANTEE_DISCLAIMER } from "@/content/marketing";
import { Container } from "@/components/ui/layout";

export function Footer() {
  const showSocials = hasSocialLinks();

  return (
    <footer className="border-t-2 border-brand bg-navy text-white/90">
      {/* Education & Training Notice / Disclaimer Bar */}
      <div className="border-b border-white/10 bg-black/20 py-4">
        <Container>
          <div className="flex items-center gap-3 text-xs leading-relaxed text-white/80 sm:text-sm">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <p>
              <span className="font-semibold text-white">Notice:</span>{" "}
              {NO_GUARANTEE_DISCLAIMER}
            </p>
          </div>
        </Container>
      </div>

      {/* Main Footer Links & Directory */}
      <div className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Col 1: Brand & Contact Info */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-white p-2 shadow-sm ring-1 ring-white/20">
                  <Image
                    src="/images/logo-full.png"
                    alt={`${SITE.name} Logo`}
                    width={140}
                    height={50}
                    className="h-9 w-auto object-contain"
                  />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-white/80">
                {SITE.description}
              </p>

              <div className="space-y-2 pt-2 text-sm text-white/85">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <span>{SITE.location.display}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <a
                    href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                    className="hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {SITE.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <a
                    href={`mailto:${SITE.email.info}`}
                    className="hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {SITE.email.info}
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Programs & Services */}
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
                Programs
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <Link
                    href="/internships"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Internship Programs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/training"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Training Programs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Events & Workshops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ambassador/apply"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Campus Ambassador Programme
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#certifications"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#live-projects"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Live Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#career-guidance"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Career Guidance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#mentorship"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Mentorship
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Company & Verification */}
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
                Organization
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <span>Verify Certificate</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#leadership"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Leadership
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Email Inquiries & Legal */}
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
                Inquiries & Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <a
                    href={`mailto:${SITE.email.internships}`}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Internships Desk
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE.email.partnerships}`}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Partnerships Desk
                  </a>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="transition-colors hover:text-white hover:underline"
                  >
                    Legal Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar: Copyright & Compliance */}
      <div className="border-t border-white/10 py-6 text-xs text-surface/70">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p>{copyrightLine()}</p>
            {showSocials ? (
              <div className="flex items-center gap-4">
                {/* Dynamically only rendered when non-null URLs are present */}
                {SITE.social.linkedin ? (
                  <a
                    href={SITE.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-surface/40 italic">
                Committed to ethical, transparent skill development.
              </p>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}
