export type InternshipDomain =
  | "WEB_DEVELOPMENT"
  | "AI_ML"
  | "DATA_SCIENCE"
  | "CYBERSECURITY"
  | "MARKETING"
  | "HR";

export type DeliveryMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface InternshipTrack {
  id: string;
  slug: string;
  title: string;
  domain: InternshipDomain;
  domainLabel: string;
  summary: string;
  description: string;
  roleTitle: string;
  durationMonths: number;
  learningObjectives: string[];
  skillRequirements: string[];
  completionCriteria: string;
  mode: DeliveryMode;
  feePaise: number; // 0 for free or fee in paise (e.g. 0)
  isPublished: boolean;
  featured?: boolean;
}

export const DOMAIN_LABELS: Record<InternshipDomain, string> = {
  WEB_DEVELOPMENT: "Web Development",
  AI_ML: "AI & Machine Learning",
  DATA_SCIENCE: "Data Science",
  CYBERSECURITY: "Cybersecurity",
  MARKETING: "Digital Marketing",
  HR: "Human Resources",
};

export const MODE_LABELS: Record<DeliveryMode, string> = {
  ONLINE: "Remote / Online",
  OFFLINE: "In-Person / Onsite",
  HYBRID: "Hybrid",
};

export const INITIAL_INTERNSHIPS: InternshipTrack[] = [
  {
    id: "int-web-dev-01",
    slug: "full-stack-web-development",
    title: "Full-Stack Web Development Track",
    domain: "WEB_DEVELOPMENT",
    domainLabel: "Web Development",
    summary:
      "Design and deploy production-grade responsive web architectures using modern JavaScript/TypeScript, React, Next.js, and relational databases.",
    description:
      "A rigorous, project-centric internship simulating an active product engineering sprint. Interns work through architecture design, Git PR workflows, relational schema modeling, API contract testing, and cloud deployments while collaborating under senior tech mentorship.",
    roleTitle: "Junior Full-Stack Engineering Intern",
    durationMonths: 2,
    learningObjectives: [
      "Master modern component architecture and state management in React and Next.js App Router.",
      "Design RESTful APIs, data validation schemas with Zod, and ORM integration using Prisma.",
      "Implement industry Git branch strategies, code review checklists, and CI/CD pipelines.",
      "Build and deliver an end-to-end full-stack capstone product evaluated on performance and code quality.",
    ],
    skillRequirements: [
      "HTML5, Modern CSS, and foundational JavaScript / TypeScript.",
      "Basic understanding of relational databases and SQL queries.",
      "Familiarity with Git command line operations and GitHub repositories.",
    ],
    completionCriteria:
      "Successful deployment of a full-stack capstone project, minimum 80% attendance in cohort syncs, and passing score on mentor evaluation rubric.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: true,
  },
  {
    id: "int-ai-ml-02",
    slug: "applied-ai-machine-learning",
    title: "Applied AI & Machine Learning Track",
    domain: "AI_ML",
    domainLabel: "AI & Machine Learning",
    summary:
      "Develop, train, and evaluate practical machine learning models and integrate LLMs into real-world software workflows.",
    description:
      "Bridge mathematical theory and production reality. You will work on feature engineering pipelines, supervised and unsupervised learning algorithms, neural network fine-tuning, and API deployment of predictive models.",
    roleTitle: "Machine Learning Intern",
    durationMonths: 3,
    learningObjectives: [
      "Process, clean, and analyze high-dimensional datasets using Pandas, NumPy, and Scikit-Learn.",
      "Train, evaluate, and tune classification, regression, and clustering models with cross-validation.",
      "Implement foundational neural network architectures with PyTorch / TensorFlow.",
      "Package predictive models into Docker containers and serve them via FastAPI endpoints.",
    ],
    skillRequirements: [
      "Proficiency in Python programming and numerical packages.",
      "Understanding of linear algebra, calculus, and probability statistics.",
      "Basic experience with Jupyter Notebooks and Git.",
    ],
    completionCriteria:
      "End-to-end model pipeline report with documented accuracy metrics, containerized inference endpoint, and mentor review sign-off.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: true,
  },
  {
    id: "int-ds-03",
    slug: "data-science-analytics",
    title: "Data Science & Business Analytics Track",
    domain: "DATA_SCIENCE",
    domainLabel: "Data Science",
    summary:
      "Transform complex raw data into actionable executive insights with advanced SQL, Python statistical analysis, and interactive dashboards.",
    description:
      "Focuses on practical data modeling, exploratory data analysis (EDA), cohort behavior analysis, and dashboard visualization. Interns tackle business-driven case studies reflecting modern corporate data operations.",
    roleTitle: "Data Analyst Intern",
    durationMonths: 2,
    learningObjectives: [
      "Execute complex SQL queries including window functions, CTEs, and cohort aggregations.",
      "Perform thorough exploratory data analysis and hypothesis testing in Python.",
      "Build executive-grade BI dashboards and visual narratives.",
      "Present actionable, data-backed findings to technical and non-technical stakeholders.",
    ],
    skillRequirements: [
      "Solid SQL fundamentals (joins, groupings, aggregations).",
      "Python data manipulation skills (Pandas, Matplotlib, Seaborn).",
      "Analytical mindset and attention to detail.",
    ],
    completionCriteria:
      "Completion of 3 exploratory case studies, 1 automated executive dashboard, and a final presentation to the analytics mentor team.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: false,
  },
  {
    id: "int-cyber-04",
    slug: "cybersecurity-threat-defense",
    title: "Cybersecurity & Threat Defense Track",
    domain: "CYBERSECURITY",
    domainLabel: "Cybersecurity",
    summary:
      "Learn vulnerability assessment, security hardening, network defense, and compliance protocols aligned with ISO 27001 standards.",
    description:
      "Practical defense-in-depth engineering. Interns analyze OWASP Top 10 vulnerabilities, conduct secure code reviews, configure cryptographic controls, and understand organizational security incident response plans.",
    roleTitle: "Security Analyst Intern",
    durationMonths: 2,
    learningObjectives: [
      "Identify and remediate OWASP Top 10 web vulnerabilities.",
      "Understand asymmetric/symmetric cryptography, hashing, and PKI infrastructure.",
      "Conduct automated vulnerability scans and write comprehensive assessment reports.",
      "Apply security policies complying with the DPDP Act and cybersecurity governance standards.",
    ],
    skillRequirements: [
      "Foundational networking concepts (TCP/IP, DNS, TLS/SSL, HTTP).",
      "Linux terminal fluency and basic scripting knowledge.",
      "Ethical mindset and strict adherence to non-disclosure obligations.",
    ],
    completionCriteria:
      "Submission of a formal vulnerability assessment report for a sandbox application and compliance policy audit checklist.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: false,
  },
  {
    id: "int-mkt-05",
    slug: "digital-marketing-growth",
    title: "Digital Marketing & Growth Track",
    domain: "MARKETING",
    domainLabel: "Digital Marketing",
    summary:
      "Master modern growth marketing, search engine optimization (SEO), performance campaigns, content strategy, and conversion analytics.",
    description:
      "A fast-paced track covering data-driven audience acquisition, search optimization, lifecycle email automation, and performance measurement. Interns execute practical campaign plans using real industry analytics frameworks.",
    roleTitle: "Growth Marketing Intern",
    durationMonths: 2,
    learningObjectives: [
      "Conduct keyword research, competitive audits, and technical on-page/off-page SEO.",
      "Design performance marketing campaigns with audience segmentation and A/B test variations.",
      "Track marketing funnels using Google Analytics 4, Tag Manager, and UTM parameters.",
      "Create high-converting copy, email sequences, and lead capture workflows.",
    ],
    skillRequirements: [
      "Strong written English communication and copywriting instincts.",
      "Basic understanding of social media platforms and digital marketing channels.",
      "Comfort with data interpretation and spreadsheet modeling.",
    ],
    completionCriteria:
      "Delivery of an integrated growth campaign strategy, comprehensive SEO audit document, and conversion funnel analysis report.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: false,
  },
  {
    id: "int-hr-06",
    slug: "human-resource-talent-acquisition",
    title: "HR Management & Talent Acquisition Track",
    domain: "HR",
    domainLabel: "Human Resources",
    summary:
      "Understand modern people operations, recruitment lifecycle management, campus hiring strategy, and talent onboarding workflows.",
    description:
      "Exposes interns to structured talent acquisition frameworks, candidate screening matrices, campus ambassador management, and employee lifecycle operations in alignment with ethical HR guidelines.",
    roleTitle: "HR Operations Intern",
    durationMonths: 2,
    learningObjectives: [
      "Draft clear job descriptions, evaluation scorecards, and candidate outreach campaigns.",
      "Screen resumes, conduct structured preliminary interviews, and document evaluation notes.",
      "Coordinate campus recruitment engagement and student ambassador communication.",
      "Understand HR compliance, documentation standards, and onboarding workflows.",
    ],
    skillRequirements: [
      "Excellent interpersonal and verbal/written communication skills.",
      "High degree of empathy, confidentiality, and professional integrity.",
      "Familiarity with Google Workspace / Microsoft 365 tools.",
    ],
    completionCriteria:
      "Completion of candidate sourcing playbook, structured interview rubric, and campus recruitment campaign proposal.",
    mode: "ONLINE",
    feePaise: 0,
    isPublished: true,
    featured: false,
  },
];
