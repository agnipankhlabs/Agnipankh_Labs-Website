/**
 * Marketing copy, quoted from the approved source documents.
 *
 * EDITORIAL RULES enforced here (see build plan):
 *  1. No metric is presented as achieved. The Investor Deck's "1,000+ students" and
 *     "25+ colleges" are Year 1 TARGETS; "100,000+ learners" is a 5-year target. No
 *     document reports a single current student, partner, placement or rupee of
 *     revenue, so no such number appears on this site in any form.
 *  2. The Company Profile's unsourced "Status: Active & Verified" badge is dropped.
 *  3. Never "ISO 9001 certified" — the QMS claims readiness/alignment only.
 *  4. The Business Plan's "regional-language support" claim is omitted: the site
 *     ships English-only, so advertising it would be false.
 *
 * Every string below is verbatim from the cited document unless marked [assembled].
 */

/** Brand Kit §5 — Home Page Hero Section. */
export const hero = {
  headline: "Build Your Future with Industry-Ready Skills",
  subheadline:
    "Gain practical experience through internships, live projects, certifications, and mentorship programs designed to prepare you for real-world success.",
  ctas: [
    { label: "Explore Internships", href: "/internships", variant: "primary" as const },
    { label: "Start Learning", href: "/services", variant: "secondary" as const },
  ],
};

/**
 * Brand Kit §7 — six services with finished per-service copy.
 * ADR #3: the Brand Kit's six supersede the Company Profile's five. The Company
 * Profile's "Mentorship & R&D" is split — Mentorship is a service here, and R&D is
 * surfaced under the roadmap instead of being lost.
 */
export const services = [
  {
    slug: "internship-programs",
    title: "Internship Programs",
    blurb:
      "Gain practical experience through structured internship opportunities across various domains.",
  },
  {
    slug: "training-programs",
    title: "Training Programs",
    blurb:
      "Industry-focused courses designed to build relevant skills and improve employability.",
  },
  {
    slug: "certifications",
    title: "Certifications",
    blurb:
      "Earn professional certificates that validate your learning and accomplishments.",
  },
  {
    slug: "live-projects",
    title: "Live Projects",
    blurb:
      "Work on real-world projects that strengthen your portfolio and practical expertise.",
  },
  {
    slug: "career-guidance",
    title: "Career Guidance",
    blurb:
      "Receive support with resumes, interviews, professional development, and career planning.",
  },
  {
    slug: "mentorship",
    title: "Mentorship",
    blurb: "Learn directly from experienced mentors and industry professionals.",
  },
];

/** Company Profile — "Why Choose Agnipankh Labs", six differentiators. */
export const differentiators = [
  {
    title: "Practical Learning First",
    body: "Priority on hands-on coding, builds, and problem-solving over passive theory.",
  },
  {
    title: "Industry-Relevant Stacks",
    body: "Curricula mapped to modern engineering requirements.",
  },
  {
    title: "Measurable Professional Growth",
    body: "Cultivating communication, technical acumen, and delivery rigor.",
  },
  {
    title: "Real Workplace Simulations",
    body: "Experience collaborative agile workflows and sprint reviews.",
  },
  {
    title: "Career-Oriented Trajectory",
    body: "Focused on verifiable portfolios, interview preparation, and placement readiness.",
  },
  {
    title: "Collaborative Ecosystem",
    body: "A vibrant community linking learners with mentors and peers.",
  },
];

/** Company Profile — About Agnipankh Labs (three paragraphs). */
export const about = {
  heading: "About Agnipankh Labs",
  paragraphs: [
    "Agnipankh Labs is an emerging innovation, practical learning, and career development organization dedicated to empowering students, graduates, and aspiring professionals through real-world industry exposure and skill-focused education.",
    "In today’s rapidly changing technological landscape, academic theory alone is often insufficient to build a thriving career. Recognizing this critical gap, Agnipankh Labs was established to provide learners with structured opportunities to develop industry-grade skills, gain hands-on project experience, and build the confidence required to excel in modern workplaces.",
    "We emphasize internships, live capstone projects, professional mentorship, recognized certifications, and career development tracks. At Agnipankh Labs, education extends beyond concepts—true transformation happens when knowledge is actively applied, challenges are conquered, and practical competence is built.",
  ],
};

/** Company Profile — Vision & Strategic Mission. */
export const vision = {
  statement:
    "To become a trusted learning and innovation ecosystem that empowers individuals to transform their latent potential into professional excellence and meaningful, high-impact careers.",
};

export const mission = {
  points: [
    "Bridge the divide between academic curricula and industry demands.",
    "Deliver structured internships, experiential training, and live projects.",
    "Foster creativity, problem-solving, and continuous upskilling.",
    "Accelerate career confidence and long-term employability.",
  ],
};

/** Company Profile — Foundational Core Values. */
export const coreValues = [
  {
    title: "Innovation",
    body: "Encouraging curiosity, novel ideas, and superior engineering solutions.",
  },
  {
    title: "Integrity",
    body: "Operating with honesty, transparency, and accountability across all operations.",
  },
  {
    title: "Excellence",
    body: "Upholding institutional standards in mentorship, training, and assessment.",
  },
  {
    title: "Growth",
    body: "Fostering lifelong learning and continuous professional evolution.",
  },
  {
    title: "Impact",
    body: "Creating measurable, positive change through education and career empowerment.",
  },
];

/** Company Profile — Founder's Message, three quoted paragraphs. */
export const foundersMessage = {
  quotes: [
    "Agnipankh Labs was not created merely as an organization. It was born from a belief—a belief that every individual possesses unique potential and that with the right guidance, opportunities, and determination, extraordinary achievements become possible.",
    "As a student, I personally experienced the transition challenges between academia and industry expectations. Many talented individuals struggle not from lack of capability, but from lack of practical mentorship and exposure. The word 'Agnipankh' symbolizes courage, resilience, and the determination to rise beyond limitations.",
    "We do not measure success only through certificates; we measure it through skills mastered, confidence forged, and lives transformed. Together, let us learn, innovate, and build a brighter future.",
  ],
  attribution: "Pratik Dinkar Nanavare — Founder, Agnipankh Labs",
};

/** Company Profile — Core Operational Departments. */
export const departments = [
  { name: "Internship Operations", remit: "Candidate workflows & programs." },
  { name: "Training & Curriculum", remit: "Learning pathways & pedagogy." },
  { name: "Mentorship", remit: "Expert coordination & review sessions." },
  { name: "Marketing & Outreach", remit: "Partnerships, MoUs & brand." },
  { name: "Technology & Development", remit: "LMS, web platform & security." },
];

/**
 * Company Profile — Six-Phase Strategic Roadmap.
 * Labelled "Company Phase" per ADR #5: three documents define unrelated Phase 1–5/6
 * schemes, so bare "Phase 1" is never written anywhere on this site.
 * `status` is forward-looking for every entry — nothing here is claimed as delivered.
 */
export const companyRoadmap = [
  { phase: 1, title: "Digital Platform & Internship Portal Launch" },
  { phase: 2, title: "Expansion of Technical Training Programs" },
  { phase: 3, title: "Proprietary Learning Management System (LMS)" },
  { phase: 4, title: "Bilateral College & Corporate Alliances" },
  { phase: 5, title: "National Learning & Innovation Community" },
  { phase: 6, title: "Research Wing & Startup Incubation Hub" },
];

/** Brand Kit §1 — Brand Personality. */
export const brandPersonality = [
  "Innovative",
  "Trustworthy",
  "Professional",
  "Student-Centric",
  "Growth-Oriented",
  "Future-Focused",
];

/**
 * Brand Kit §8 — five FAQs, verbatim.
 *
 * GAP: the build plan flags that a paid EdTech site needs roughly twelve, covering
 * pricing, refunds, certificate validity/verifiability, eligibility, duration, mentor
 * allocation and the no-guarantee disclaimer. Those answers do not exist in any source
 * document and must be authored by the founder — they are NOT invented here.
 */
export const faqs = [
  {
    q: "What is Agnipankh Labs?",
    a: "Agnipankh Labs is a learning, internship, and innovation platform focused on developing industry-ready skills.",
  },
  {
    q: "Are internships paid?",
    a: "Depending on the program, internships may be paid, unpaid, or performance-based.",
  },
  {
    q: "Will I receive a certificate?",
    a: "Yes. Eligible participants receive certificates upon successful completion of program requirements.",
  },
  {
    q: "Is mentorship provided?",
    a: "Yes. Selected programs include mentor support and guidance.",
  },
  {
    q: "How can I apply?",
    a: "Applications can be submitted through the Agnipankh Labs website.",
  },
];

/**
 * Legal Pack — the no-employment-guarantee statement is required wherever internships,
 * training, mentorship or certification are marketed, not only on /disclaimer. The pack
 * supplies only full-page prose, so this short form is [assembled] from it and is
 * pending founder/legal approval.
 */
export const NO_GUARANTEE_DISCLAIMER =
  "Agnipankh Labs provides education and training. Participation does not guarantee employment.";
