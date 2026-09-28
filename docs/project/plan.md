# Agnipankh Labs — Master Project Roadmap & Architectural Decisions

Master roadmap, architectural decisions, and technical debt tracking for **Agnipankh Labs**.

---

## 🗺️ System Roadmap

### Phase 1: Core Platform & Security (Completed)
- Next.js 15 App Router architecture with React 19.
- NextAuth v5 authentication with TOTP MFA and RBAC.
- PostgreSQL integration with Prisma ORM 7.10.
- Certificate generation system with PDFKit and QRCode generation.
- Full responsive design system with Tailwind CSS v4.

### Phase 2: Enterprise Scaling & Analytics (Current)
- Automated document PDF compiler (`scripts/generate-proposal-pdf.mjs`).
- Advanced admin dashboards (Analytics, Leads, Finance, Applications).
- Upstash Redis rate-limiting integration.

### Phase 3: AI Learning Companion & LMS Integration (Upcoming)
- Interactive student code sandbox.
- AI-driven resume review & skill matcher.

---

## 🏛️ Architectural Decision Records (ADRs)

- **ADR-001**: Use Next.js App Router & Server Actions for form processing to eliminate boilerplate API routes.
- **ADR-002**: Standardize on `@prisma/adapter-pg` for serverless-compatible connection pooling.
- **ADR-003**: Enforce WCAG AA compliance with automated contrast testing (`npm run check:contrast`).
