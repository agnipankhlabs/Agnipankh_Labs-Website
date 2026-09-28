/**
 * Agnipankh Labs — Database seed
 *
 * Run with: npx prisma db seed
 *
 * Seeds core reference data only. No real PII. Safe to re-run — every upsert is
 * idempotent. Do NOT add real API keys, passwords, or student records here.
 *
 * Seed order matters because of FK constraints:
 *   1. Roles & Permissions
 *   2. Departments
 *   3. Vendors
 *   4. Super-admin user (dev only)
 *   5. Internships & Courses
 *   6. Site settings
 */

import { PrismaClient, InternshipDomain, DeliveryMode } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// 1. Roles
// ---------------------------------------------------------------------------

const ROLES = [
  { key: "super_admin", name: "Super Admin", description: "Full platform access. Cybersecurity Framework mandates MFA and 90-day password rotation.", isStaff: true, requiresMfa: true, passwordRotationDays: 90 },
  { key: "admin", name: "Admin", description: "Platform administration. Cannot manage billing or certificates.", isStaff: true, requiresMfa: false, passwordRotationDays: null },
  { key: "finance", name: "Finance", description: "Payment, invoice, expense and GST access. Cybersecurity Framework mandates MFA.", isStaff: true, requiresMfa: true, passwordRotationDays: 90 },
  { key: "dept_head", name: "Department Head", description: "Head of an operational division. Approves expenses up to Rs 10,000.", isStaff: true, requiresMfa: false, passwordRotationDays: null },
  { key: "trainer", name: "Trainer", description: "Delivers training programmes. HR Framework §6 — vetted before assignment.", isStaff: true, requiresMfa: false, passwordRotationDays: null },
  { key: "mentor", name: "Mentor", description: "Guides a cohort through an internship or programme. Approval-gated.", isStaff: false, requiresMfa: false, passwordRotationDays: null },
  { key: "student", name: "Student", description: "Learner / intern. Self-registration allowed subject to profile verification.", isStaff: false, requiresMfa: false, passwordRotationDays: null },
  { key: "employer", name: "Employer / Recruiter", description: "External hiring partner. Read-only access to approved placement profiles.", isStaff: false, requiresMfa: false, passwordRotationDays: null },
  { key: "college_tpo", name: "College / TPO", description: "Training & Placement Officer from a partner college. MoU-gated.", isStaff: false, requiresMfa: false, passwordRotationDays: null },
  { key: "campus_ambassador", name: "Campus Ambassador", description: "Student ambassador. Marketing Playbook §9 — 5/10/25/50+ referral tier matrix.", isStaff: false, requiresMfa: false, passwordRotationDays: null },
];

// ---------------------------------------------------------------------------
// 2. Permissions
// ---------------------------------------------------------------------------

const PERMISSIONS = [
  { key: "user.list", description: "List all platform users" },
  { key: "user.view", description: "View any user profile" },
  { key: "user.edit", description: "Edit any user profile" },
  { key: "user.suspend", description: "Suspend or reinstate a user account" },
  { key: "user.delete", description: "Hard-delete a user (DPDP erasure)" },
  { key: "internship.create", description: "Create a new internship listing" },
  { key: "internship.edit", description: "Edit an existing internship listing" },
  { key: "internship.publish", description: "Publish / unpublish an internship" },
  { key: "internship.delete", description: "Archive-delete an internship" },
  { key: "application.review", description: "Move an application through the 5-stage pipeline" },
  { key: "application.approve", description: "Issue an offer letter" },
  { key: "application.reject", description: "Reject an application" },
  { key: "certificate.issue", description: "Issue a new certificate — FROZEN field set" },
  { key: "certificate.revoke", description: "Revoke an issued certificate" },
  { key: "certificate.supersede", description: "Issue a superseding certificate" },
  { key: "expense.approve.team_lead", description: "Approve expenses <= Rs 2,000" },
  { key: "expense.approve.founder", description: "Approve expenses Rs 2,001-10,000" },
  { key: "expense.approve.joint", description: "Joint approval for expenses > Rs 10,000" },
  { key: "payment.view", description: "View payment records" },
  { key: "payment.refund", description: "Initiate a refund" },
  { key: "invoice.create", description: "Generate an invoice" },
  { key: "lead.view", description: "View the lead CRM" },
  { key: "lead.edit", description: "Update lead status and notes" },
  { key: "mentor.approve", description: "Approve or reject a mentor application" },
  { key: "mentor.evaluate", description: "Submit a quarterly mentor evaluation" },
  { key: "role.assign", description: "Assign or revoke roles from users" },
  { key: "ticket.assign", description: "Assign a support ticket to a team member" },
  { key: "ticket.resolve", description: "Mark a ticket resolved" },
  { key: "quality.manage", description: "Manage quality issues, CAPA cases, and audit records" },
  { key: "settings.manage", description: "Update site settings and content" },
];

const ALL_PERM_KEYS = PERMISSIONS.map((p) => p.key);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_PERM_KEYS,
  admin: [
    "user.list","user.view","user.edit","user.suspend",
    "internship.create","internship.edit","internship.publish","internship.delete",
    "application.review","application.approve","application.reject",
    "certificate.issue","certificate.revoke","certificate.supersede",
    "lead.view","lead.edit",
    "mentor.approve","mentor.evaluate",
    "role.assign",
    "ticket.assign","ticket.resolve",
    "quality.manage","settings.manage",
    "payment.view","invoice.create",
  ],
  finance: ["payment.view","payment.refund","invoice.create","expense.approve.team_lead","expense.approve.founder","expense.approve.joint"],
  dept_head: ["expense.approve.team_lead","expense.approve.founder","user.list","user.view","ticket.assign","ticket.resolve"],
  trainer: ["user.view"],
  mentor: ["user.view"],
  student: [],
  employer: [],
  college_tpo: [],
  campus_ambassador: [],
};

// ---------------------------------------------------------------------------
// 3. Departments
// ---------------------------------------------------------------------------

const DEPARTMENTS = [
  { key: "technology", name: "Technology & Engineering", remit: "Platform development, DevOps, and cybersecurity." },
  { key: "academics", name: "Academics & Delivery", remit: "Curriculum design, mentor management, cohort delivery, and QMS compliance." },
  { key: "marketing", name: "Marketing & Growth", remit: "Brand, digital marketing, campus ambassador programme, and partnerships." },
  { key: "operations", name: "Operations", remit: "Day-to-day operations, support, and HR administration." },
  { key: "finance", name: "Finance & Governance", remit: "Payments, invoicing, GST, statutory compliance, and vendor management." },
];

// ---------------------------------------------------------------------------
// 4. Vendors
// ---------------------------------------------------------------------------

const VENDORS = [
  { name: "Vercel", service: "Next.js hosting & edge network", soc2: true, iso27001: false, uptimeSla: "99.99%" },
  { name: "Upstash", service: "Redis rate-limiting & caching", soc2: true, iso27001: false, uptimeSla: "99.9%" },
  { name: "Resend", service: "Transactional email delivery", soc2: false, iso27001: false, uptimeSla: "99.9%" },
  { name: "Cloudinary", service: "Image & video CDN", soc2: true, iso27001: false, uptimeSla: "99.9%" },
  { name: "Razorpay", service: "Payment gateway (INR)", soc2: false, iso27001: false, uptimeSla: "99.9%" },
  { name: "Neon", service: "PostgreSQL managed database", soc2: true, iso27001: false, uptimeSla: "99.95%" },
];

// ---------------------------------------------------------------------------
// 5. Internships
// ---------------------------------------------------------------------------

const INTERNSHIPS = [
  {
    slug: "ai-ml-research-intern",
    title: "AI/ML Research Internship",
    domain: "AI_ML",
    summary: "Work on real-world machine learning pipelines, model fine-tuning, and MLOps.",
    roleTitle: "AI/ML Research Intern",
    durationMonths: 3,
    learningObjectives: ["Understand supervised and unsupervised learning paradigms","Implement end-to-end ML pipelines using Python and scikit-learn","Fine-tune pre-trained transformer models for domain-specific tasks","Evaluate model performance using industry-standard metrics"],
    skillRequirements: ["Python","NumPy","Pandas","scikit-learn","Basic linear algebra"],
    completionCriteria: "Deliver a documented ML pipeline with >= 80% accuracy on the agreed evaluation dataset and a 10-minute demo presentation.",
    mode: "ONLINE",
    feePaise: 599900,
    isPublished: true,
  },
  {
    slug: "web-development-internship",
    title: "Full-Stack Web Development Internship",
    domain: "WEB_DEVELOPMENT",
    summary: "Build production-grade Next.js applications with TypeScript, Prisma, and Tailwind CSS.",
    roleTitle: "Full-Stack Developer Intern",
    durationMonths: 3,
    learningObjectives: ["Architect a Next.js 15 App Router project from scratch","Implement REST and Server Actions with Zod validation","Integrate a PostgreSQL database via Prisma ORM","Deploy to Vercel with environment-based configuration"],
    skillRequirements: ["HTML/CSS","JavaScript fundamentals","Basic React knowledge"],
    completionCriteria: "Deploy a live full-stack web app with authentication, CRUD, and a documented README.",
    mode: "ONLINE",
    feePaise: 499900,
    isPublished: true,
  },
  {
    slug: "cybersecurity-internship",
    title: "Cybersecurity Fundamentals Internship",
    domain: "CYBERSECURITY",
    summary: "Learn ethical hacking, vulnerability assessment, and security compliance frameworks.",
    roleTitle: "Cybersecurity Intern",
    durationMonths: 2,
    learningObjectives: ["Understand the OWASP Top 10 vulnerability classes","Perform basic penetration testing using industry-standard tools","Write a vulnerability assessment report","Apply the ISO 27001 control framework to a sample organisation"],
    skillRequirements: ["Basic networking (TCP/IP)","Linux command line","Python basics"],
    completionCriteria: "Submit a penetration test report on a sandboxed lab environment with CVSS-scored findings and remediation recommendations.",
    mode: "ONLINE",
    feePaise: 699900,
    isPublished: true,
  },
  {
    slug: "hr-management-internship",
    title: "Human Resources Management Internship",
    domain: "HR",
    summary: "Gain hands-on experience in recruitment, onboarding, performance evaluation, and HR compliance.",
    roleTitle: "HR Management Intern",
    durationMonths: 2,
    learningObjectives: ["Draft a job description and conduct a structured screening interview","Build an onboarding checklist aligned to the HR Framework","Apply the performance evaluation rubric to a case study","Understand Indian labour law basics (Shops & Establishment Act, PF, ESIC)"],
    skillRequirements: ["Strong written communication","MS Office / Google Workspace"],
    completionCriteria: "Produce an HR operations handbook covering recruitment, onboarding, and performance review for a 10-person startup.",
    mode: "HYBRID",
    feePaise: 349900,
    isPublished: true,
  },
  {
    slug: "digital-marketing-internship",
    title: "Digital Marketing & Growth Internship",
    domain: "MARKETING",
    summary: "Execute real campaigns across SEO, content, social media, and paid channels with measurable KPIs.",
    roleTitle: "Digital Marketing Intern",
    durationMonths: 2,
    learningObjectives: ["Conduct keyword research and on-page SEO audits","Create and schedule a 30-day content calendar","Set up and analyse a Google Ads or Meta Ads campaign","Build a growth dashboard with UTM-tracked funnel metrics"],
    skillRequirements: ["Google Analytics basics","Social media literacy","Basic copywriting"],
    completionCriteria: "Deliver a marketing campaign report with before/after metrics, learnings, and a 90-day growth roadmap.",
    mode: "ONLINE",
    feePaise: 299900,
    isPublished: true,
  },
  {
    slug: "data-science-internship",
    title: "Data Science & Analytics Internship",
    domain: "DATA_SCIENCE",
    summary: "Analyse real datasets, build visualisations, and derive actionable business insights.",
    roleTitle: "Data Science Intern",
    durationMonths: 3,
    learningObjectives: ["Clean and wrangle a real-world dataset using Pandas","Build interactive dashboards using Plotly / Streamlit","Apply statistical hypothesis testing to business questions","Present data-driven recommendations to a simulated stakeholder audience"],
    skillRequirements: ["Python or R basics","Basic statistics","Excel / Google Sheets"],
    completionCriteria: "Deliver a Jupyter notebook with full EDA, at least one predictive model, and a 5-slide executive summary.",
    mode: "ONLINE",
    feePaise: 549900,
    isPublished: true,
  },
];

// ---------------------------------------------------------------------------
// 6. Courses
// ---------------------------------------------------------------------------

const COURSES = [
  { slug: "python-for-data-science", title: "Python for Data Science", summary: "A 30-lesson, project-first Python course covering NumPy, Pandas, Matplotlib, and an end-to-end ML project.", level: "Beginner", prerequisites: [], pricePaise: 199900, isPublished: true },
  { slug: "nextjs-fullstack-bootcamp", title: "Next.js Full-Stack Bootcamp", summary: "Build and ship a production Next.js 15 app with Auth.js, Prisma, and Vercel deployment in 40 lessons.", level: "Intermediate", prerequisites: ["JavaScript fundamentals","Basic React"], pricePaise: 249900, isPublished: true },
  { slug: "ethical-hacking-essentials", title: "Ethical Hacking Essentials", summary: "Hands-on cybersecurity: reconnaissance, exploitation, post-exploitation, and reporting. 35 lessons.", level: "Intermediate", prerequisites: ["Linux command line basics","TCP/IP fundamentals"], pricePaise: 299900, isPublished: true },
  { slug: "digital-marketing-masterclass", title: "Digital Marketing Masterclass", summary: "End-to-end digital marketing: SEO, SEM, social media, content strategy, email, and analytics.", level: "Beginner", prerequisites: [], pricePaise: 149900, isPublished: true },
];

// ---------------------------------------------------------------------------
// 7. Site settings
// ---------------------------------------------------------------------------

const SITE_SETTINGS: Record<string, string> = {
  "company.name": "Agnipankh Labs",
  "company.legal_name": "Agnipankh Labs Private Limited",
  "company.cin": "",
  "company.gstin": "",
  "company.pan": "",
  "company.registered_address": "",
  "company.support_email": "support@agnipankhlabs.com",
  "company.contact_phone": "",
  "company.founded_year": "2024",
  "company.tagline": "Bridging the gap between education and industry",
  "policy.privacy_version": "1.0",
  "policy.terms_version": "1.0",
  "policy.cookie_version": "1.0",
  "certificate.signatory_name": "",
  "certificate.signatory_title": "Founder & CEO, Agnipankh Labs",
  "invoice.gstin": "",
  "invoice.hsn_sac": "999293",
  "invoice.place_of_supply": "",
  "invoice.gst_rate_percent": "18",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding Agnipankh Labs database...\n");

  // Roles
  console.log("  -> Upserting roles...");
  const roleMap: Record<string, string> = {};
  for (const role of ROLES) {
    const r = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description, isStaff: role.isStaff, requiresMfa: role.requiresMfa, passwordRotationDays: role.passwordRotationDays },
      create: { key: role.key, name: role.name, description: role.description, isStaff: role.isStaff, requiresMfa: role.requiresMfa, passwordRotationDays: role.passwordRotationDays },
    });
    roleMap[role.key] = r.id;
  }
  console.log(`     OK ${ROLES.length} roles`);

  // Permissions
  console.log("  -> Upserting permissions...");
  const permMap: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: { key: perm.key, description: perm.description },
    });
    permMap[perm.key] = p.id;
  }
  console.log(`     OK ${PERMISSIONS.length} permissions`);

  // Role-permission links
  console.log("  -> Linking role permissions...");
  let permLinkCount = 0;
  for (const [roleKey, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleKey];
    if (!roleId) continue;
    for (const permKey of permKeys) {
      const permId = permMap[permKey];
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      });
      permLinkCount++;
    }
  }
  console.log(`     OK ${permLinkCount} role-permission links`);

  // Departments
  console.log("  -> Upserting departments...");
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { key: dept.key },
      update: { name: dept.name, remit: dept.remit },
      create: { key: dept.key, name: dept.name, remit: dept.remit },
    });
  }
  console.log(`     OK ${DEPARTMENTS.length} departments`);

  // Vendors
  console.log("  -> Upserting vendors...");
  for (const vendor of VENDORS) {
    const existing = await prisma.vendor.findFirst({ where: { name: vendor.name } });
    if (!existing) {
      await prisma.vendor.create({ data: { name: vendor.name, service: vendor.service, soc2: vendor.soc2, iso27001: vendor.iso27001, uptimeSla: vendor.uptimeSla } });
    }
  }
  console.log(`     OK ${VENDORS.length} vendors`);

  // Dev users — one per role (non-production only)
  if (process.env.NODE_ENV !== "production") {
    console.log("  -> Creating dev users (one per role)...");

    const DEV_USERS = [
      { roleKey: "super_admin",       email: "superadmin@agnipankhlabs.dev",  name: "Dev Super Admin",       password: "SuperAdmin@123!" },
      { roleKey: "admin",             email: "admin@agnipankhlabs.dev",        name: "Dev Admin",             password: "Admin@123!" },
      { roleKey: "finance",           email: "finance@agnipankhlabs.dev",      name: "Dev Finance",           password: "Finance@123!" },
      { roleKey: "dept_head",         email: "depthead@agnipankhlabs.dev",     name: "Dev Dept Head",         password: "DeptHead@123!" },
      { roleKey: "trainer",           email: "trainer@agnipankhlabs.dev",      name: "Dev Trainer",           password: "Trainer@123!" },
      { roleKey: "mentor",            email: "mentor@agnipankhlabs.dev",       name: "Dev Mentor",            password: "Mentor@123!" },
      { roleKey: "student",           email: "student@agnipankhlabs.dev",      name: "Dev Student",           password: "Student@123!" },
      { roleKey: "employer",          email: "employer@agnipankhlabs.dev",     name: "Dev Employer",          password: "Employer@123!" },
      { roleKey: "college_tpo",       email: "tpo@agnipankhlabs.dev",          name: "Dev College TPO",       password: "CollegeTPO@123!" },
      { roleKey: "campus_ambassador", email: "ambassador@agnipankhlabs.dev",   name: "Dev Campus Ambassador", password: "Ambassador@123!" },
    ];

    for (const devUser of DEV_USERS) {
      const passwordHash = await hash(devUser.password, 12);
      const user = await prisma.user.upsert({
        where: { email: devUser.email },
        update: {},
        create: {
          email: devUser.email,
          name: devUser.name,
          emailVerified: new Date(),
          passwordHash,
        },
      });
      const roleId = roleMap[devUser.roleKey];
      if (roleId) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId } },
          update: {},
          create: { userId: user.id, roleId },
        });
      }
      console.log(`     OK  ${devUser.email.padEnd(42)} / ${devUser.password}`);
    }

    console.log("\n     WARNING: These accounts are for local development only.");
    console.log("     Do NOT expose this database to the internet or deploy to production without re-seeding with production credentials.\n");
  }

  // Internships
  console.log("  -> Upserting internships...");
  for (const internship of INTERNSHIPS) {
    await prisma.internship.upsert({
      where: { slug: internship.slug },
      update: { title: internship.title, domain: internship.domain as InternshipDomain, summary: internship.summary, roleTitle: internship.roleTitle, durationMonths: internship.durationMonths, learningObjectives: internship.learningObjectives, skillRequirements: internship.skillRequirements, completionCriteria: internship.completionCriteria, mode: internship.mode as DeliveryMode, feePaise: internship.feePaise, isPublished: internship.isPublished },
      create: { slug: internship.slug, title: internship.title, domain: internship.domain as InternshipDomain, summary: internship.summary, roleTitle: internship.roleTitle, durationMonths: internship.durationMonths, learningObjectives: internship.learningObjectives, skillRequirements: internship.skillRequirements, completionCriteria: internship.completionCriteria, mode: internship.mode as DeliveryMode, feePaise: internship.feePaise, isPublished: internship.isPublished },
    });
  }
  console.log(`     OK ${INTERNSHIPS.length} internships`);

  // Courses
  console.log("  -> Upserting courses...");
  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: { title: course.title, summary: course.summary, level: course.level, prerequisites: course.prerequisites, pricePaise: course.pricePaise, isPublished: course.isPublished },
      create: { slug: course.slug, title: course.title, summary: course.summary, level: course.level, prerequisites: course.prerequisites, pricePaise: course.pricePaise, isPublished: course.isPublished },
    });
  }
  console.log(`     OK ${COURSES.length} courses`);

  // Site settings
  console.log("  -> Upserting site settings...");
  for (const [key, value] of Object.entries(SITE_SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`     OK ${Object.keys(SITE_SETTINGS).length} site settings`);

  console.log("\nSeed complete.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
