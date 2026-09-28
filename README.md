# Agnipankh Labs — Production Platform

Welcome to the **Agnipankh Labs** production repository. Agnipankh Labs is an innovative technology, cybersecurity, and workforce enablement platform built with Next.js 15, React 19, TypeScript, PostgreSQL (Prisma ORM), NextAuth v5, and Tailwind CSS v4.

---

## 🚀 Quick Links

- [🚀 Quickstart Guide](docs/QUICKSTART.md) — 5-minute setup & developer workflow
- [💻 Development Guide](docs/DEVELOPMENT.md) — Architecture, coding standards, UI components, database
- [🚢 Deployment Guide](docs/DEPLOYMENT.md) — Vercel, Docker, production configuration, security checklist
- [🛠️ Maintenance Manual](docs/MAINTENANCE.md) — Backup routines, monitoring, incident response
- [🎧 Support Manual](docs/SUPPORT.md) — Ticket workflows, SLAs, escalation procedures
- [📄 Documents & PDFs](docs/pdf/) — Corporate plans, PRD, SRS, QMS, brand kits, governance specs
- [📋 Project Roadmap & Log](docs/project/) — `plan.md`, `done.md`, and master startup proposal

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.5 (App Router, Turbopack, React 19) |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL with Prisma ORM 7.10 & `@prisma/adapter-pg` |
| **Auth & Security**| NextAuth v5, bcryptjs, TOTP MFA, Role-Based Access Control (RBAC) |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, custom design tokens |
| **Testing** | Vitest 2.1, React Testing Library, JSDOM |
| **Email & Utilities** | Resend API, PDFKit, QRCode, Date-fns, Zod |

---

## 🏁 Getting Started

### Prerequisites

- Node.js `20.x` or higher
- PostgreSQL database instance
- npm package manager

### Environment Setup

Copy `.env.example` to `.env` and configure environment variables:

```bash
cp .env.example .env
```

### Installation & Run

```bash
# Install dependencies
npm install

# Generate Prisma Client & Run Migrations
npm run db:generate
npm run db:migrate

# Start Development Server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Commands

```bash
# Run full verification suite (Typecheck, Lint, Tests, Contrast, Certificates)
npm run check

# Run Vitest test suite
npm test

# Run TypeScript type checker
npm run typecheck

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## 📁 Repository Structure

```text
├── app/                  # Next.js App Router (Pages, Layouts, Server Actions, API routes)
├── components/           # Reusable UI, Admin, Blog, Forms, Layout, and Feature components
├── content/              # Static & dynamic marketing and program content schemas
├── docs/                 # Documentation hub (Guides, Specifications, PDFs, Audit Reports)
│   ├── pdf/              # Official company & product PDF specifications (18 files)
│   ├── project/          # Roadmap (plan.md), history (done.md), proposal
│   ├── project-audit/    # Project audit report & delete manifest
│   └── styles/           # Pandoc / Weasyprint styling for PDF generation
├── hooks/                # Custom React hooks
├── lib/                  # Services, database client, auth, email, validation schemas
├── prisma/               # Database schema (`schema.prisma`), seed script (`seed.ts`), migrations
├── public/               # Public static assets & brand graphics
├── scripts/              # Verification, contrast check, and PDF generation scripts
└── tests/                # Vitest unit and component test suites
```

---

## 📄 License & Governance

All rights reserved. Proprietary source code and documentation of **Agnipankh Labs**. Refer to [`docs/pdf/`](docs/pdf/) for cybersecurity frameworks, legal governance packs, and company policies.
