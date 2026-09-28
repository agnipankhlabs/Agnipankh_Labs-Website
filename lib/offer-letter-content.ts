import { SITE } from "@/content/site";
import type { OfferLetterData } from "@/lib/offer-letter";

// Internship agreement terms version — frozen; change bumps all agreements
export const AGREEMENT_TERMS_VERSION = "v1.0-AL-LEGAL";

// Agreement clause set displayed to candidate
export const AGREEMENT_CLAUSES = [
  {
    id: "participation",
    heading: "Active Participation",
    body:
      "The intern agrees to actively attend all scheduled mentor-led review sessions, weekly progress calls, and cohort milestone reviews. Chronic unexcused absence may result in termination of this agreement.",
  },
  {
    id: "confidentiality",
    heading: "Confidentiality & Intellectual Property",
    body:
      "All project repositories, internal review feedback, mentor notes, proprietary code, internal documents, and business information disclosed during the internship are strictly confidential. The intern shall not publish, share, or reproduce such materials without written consent from Agnipankh Labs.",
  },
  {
    id: "capstone",
    heading: "Capstone Project Delivery",
    body:
      "The intern agrees to submit all capstone milestones on or before the agreed delivery dates. Submissions must be original work. Plagiarism, contract cheating, or misrepresentation will result in immediate termination and revocation of any certificate.",
  },
  {
    id: "conduct",
    heading: "Professional Conduct",
    body:
      "The intern agrees to maintain professional standards of communication and conduct in all interactions with mentors, coordinators, and fellow cohort members, consistent with Agnipankh Labs' Code of Professional Ethics.",
  },
  {
    id: "data",
    heading: "Personal Data Processing",
    body:
      "The intern acknowledges that personal data collected during the application process is processed by Agnipankh Labs pursuant to the Digital Personal Data Protection Act, 2023 and the Agnipankh Labs Privacy Policy. Data will not be shared with third parties without consent.",
  },
  {
    id: "no_employment",
    heading: "Nature of Engagement — Not Employment",
    body:
      "This internship is a structured training programme and does not constitute employment. The intern is not entitled to employee benefits, PF, ESI, or statutory entitlements. No employer-employee relationship is created by this agreement.",
  },
  {
    id: "disclaimer",
    heading: "No Placement Guarantee",
    body:
      "Completion of this internship does not guarantee employment, job placement, or any specific career outcome. Agnipankh Labs provides skill development and project experience as part of this training engagement. This declaration is mandatory under applicable consumer protection regulations.",
  },
  {
    id: "termination",
    heading: "Termination",
    body:
      "Either party may terminate this agreement with 7 days' written notice. Agnipankh Labs reserves the right to terminate immediately in cases of dishonesty, plagiarism, or breach of confidentiality.",
  },
  {
    id: "governing_law",
    heading: "Governing Law & Jurisdiction",
    body:
      "This agreement shall be governed by the laws of India. Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of competent courts in Maharashtra, India.",
  },
];

/**
 * Build the formatted offer letter document lines for rendering.
 * Returns structured lines to be rendered in the formal letter layout.
 */
export function buildOfferLetterDocument(data: OfferLetterData): {
  issuedDate: string;
  refNumber: string;
  salutation: string;
  address: string;
  bodyParagraphs: string[];
  roleDetails: { label: string; value: string }[];
  closingLine: string;
  signatory: string;
  designationLine: string;
  orgLine: string;
} {
  const issuedDate = new Date(data.issuedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const startDate = data.startDate
    ? new Date(data.startDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "As per cohort schedule";

  const modeMap: Record<string, string> = {
    ONLINE: "Online (Remote)",
    OFFLINE: "In-Person",
    HYBRID: "Hybrid (Online + In-Person)",
  };

  const domainMap: Record<string, string> = {
    WEB_DEVELOPMENT: "Web Development",
    AI_ML: "AI & Machine Learning",
    DATA_SCIENCE: "Data Science",
    CYBERSECURITY: "Cybersecurity",
    MARKETING: "Digital Marketing",
    HR: "Human Resources",
  };

  const refNumber = `AL-OFFER-${new Date(data.issuedAt).getFullYear()}-${data.applicationId.slice(-6).toUpperCase()}`;

  return {
    issuedDate,
    refNumber,
    salutation: `Dear ${data.candidateName},`,
    address: data.college
      ? `${data.college}${data.degree ? `, ${data.degree}` : ""}`
      : data.candidateEmail,
    bodyParagraphs: [
      `We are pleased to extend this Internship Offer Letter to you for the ${domainMap[data.internshipDomain] ?? data.internshipDomain} cohort at Agnipankh Labs, pursuant to your application and successful completion of our eligibility verification and selection review process.`,
      `You have been selected for the role of <strong>${data.roleTitle}</strong> under our <strong>${data.internshipTitle}</strong> program. This is a project-based, structured training engagement designed to deliver verifiable industry-ready skills and a capstone deployment record.`,
      `We look forward to welcoming you into the cohort and supporting your professional development journey.`,
    ],
    roleDetails: [
      { label: "Program", value: data.internshipTitle },
      { label: "Role / Designation", value: data.roleTitle },
      { label: "Domain Track", value: domainMap[data.internshipDomain] ?? data.internshipDomain },
      { label: "Duration", value: `${data.durationMonths} Month${data.durationMonths !== 1 ? "s" : ""}` },
      { label: "Delivery Format", value: modeMap[data.deliveryMode] ?? data.deliveryMode },
      { label: "Reporting To", value: data.reportingTo },
      { label: "Proposed Start Date", value: startDate },
      { label: "Credential", value: "Verifiable Digital Certificate of Internship (upon completion)" },
      { label: "Reference Number", value: refNumber },
    ],
    closingLine:
      "This offer is conditional upon your review and digital execution of the Internship Training Agreement below. Please read all terms carefully and sign to confirm your acceptance and joining.",
    signatory: data.signatory,
    designationLine: "Director",
    orgLine: `${SITE.name} | ${SITE.email.internships}`,
  };
}
