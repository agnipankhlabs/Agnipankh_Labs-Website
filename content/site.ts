/**
 * Single source of truth for organisation facts that appear across the site.
 *
 * WHY THIS FILE EXISTS
 * Several values the footer, contact page and legal pages need are marked
 * "To Be Updated" or "(Confidential)" in the source documents:
 *   - Company Profile:  office address is "Maharashtra, India (Confidential / To Be Updated)"
 *   - Legal Pack:       Privacy Policy effective date is the literal placeholder "[Launch Date]"
 *   - No document in the set of 17 contains any social URL, CIN, LLPIN, GSTIN or PAN.
 *
 * Anything not yet supplied is `null`, never a placeholder string. Components must
 * branch on null and omit the element entirely. A site that renders "[Launch Date]"
 * or an empty social row is worse than one that renders neither.
 *
 * See the founder release-gate checklist in the build plan for what unblocks each null.
 */

export const SITE = {
  name: "Agnipankh Labs",
  /** Company Profile + Brand Kit, used verbatim as the tagline everywhere. */
  tagline: "Giving Wings to Innovation",

  /** Brand Kit §12 establishes agnipankhlabs.com as the mail domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://agnipankhlabs.com",

  /** Brand Kit §1 Brand Mission, used as the default meta description. */
  description:
    "Empowering students and young professionals through practical learning, internships, innovation, and industry-focused skill development.",

  /** Brand Kit §11. Primary + secondary sets; long-tail phrases live on their routes. */
  seoKeywords: [
    "Internship Platform",
    "Online Internships",
    "Student Internships",
    "Internship Programs",
    "Skill Development",
    "Career Development",
    "Training Programs",
    "Certification Programs",
    "Project-Based Learning",
    "Student Mentorship",
  ],

  /** Brand Kit §12 — the six official addresses. */
  email: {
    info: "info@agnipankhlabs.com",
    support: "support@agnipankhlabs.com",
    internships: "internships@agnipankhlabs.com",
    careers: "careers@agnipankhlabs.com",
    partnerships: "partnerships@agnipankhlabs.com",
    certificates: "certificates@agnipankhlabs.com",
  },

  /** Company Profile. Rendered as a tel: link. */
  phone: "+91 9405212547",

  location: {
    /** City/state level only — this is all the Company Profile authorises publishing. */
    display: "Maharashtra, India",
    /** Full postal address. Required for a GST-compliant invoice and a Google Business
     *  listing; the Company Profile marks it Confidential / To Be Updated. */
    postal: null as string | null,
  },

  /** Company Profile + Investor Deck. The only two named people in the document set. */
  leadership: [
    { name: "Pratik Dinkar Nanavare", role: "Founder", remit: "Strategy & Growth" },
    { name: "Sayali Sandip Kale", role: "Co-Founder", remit: "Operations & Delivery" },
  ],

  /**
   * Four documents mandate footer social links; ZERO social URLs exist in any of the 17.
   * The Brand Kit supplies the LinkedIn/Instagram *bios* but no destinations.
   * Until real accounts exist, the footer social row does not render.
   */
  social: {
    linkedin: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
    twitter: null as string | null,
  },

  /**
   * Registered-entity identity. No CIN / LLPIN / GSTIN / PAN / incorporation date /
   * entity type appears anywhere in the document set. Until `legalName` is supplied,
   * the footer prints the trading name only and legal copy must not imply a
   * registered company.
   */
  entity: {
    legalName: null as string | null,
    type: null as string | null, // "Private Limited" | "LLP" | "Proprietorship"
    cin: null as string | null,
    gstin: null as string | null,
    /** Legal Pack ships every policy stamped "[Launch Date]". Set this once, at launch. */
    policiesEffectiveDate: null as string | null,
    /** Mandatory for an Indian data fiduciary under the DPDP Act 2023. None of the six
     *  Brand Kit addresses covers this role. */
    grievanceOfficer: null as { name: string; email: string } | null,
    /** Absent from the Legal Pack entirely — no governing-law or jurisdiction clause. */
    governingLaw: null as string | null,
  },
} as const;

/** Founded year is unknown; fall back to the current year so the notice is never wrong. */
export const copyrightLine = (): string => {
  const holder = SITE.entity.legalName ?? SITE.name;
  return `© ${new Date().getFullYear()} ${holder}. All rights reserved.`;
};

/** True only when at least one real social destination exists. */
export const hasSocialLinks = (): boolean =>
  Object.values(SITE.social).some((v) => v !== null);
