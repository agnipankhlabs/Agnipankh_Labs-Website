# Agnipankh Labs — Development Guide

Architecture, coding standards, database workflows, and UI component standards for **Agnipankh Labs**.

---

## 🏗️ Architecture Overview

Agnipankh Labs is built on Next.js 15 App Router using React 19, TypeScript, Prisma ORM, and Tailwind CSS v4.

```text
app/
├── (auth)/                # Authentication pages (Login, Register, MFA)
├── (dashboard)/           # User student portal & dashboard
├── admin/                 # Admin management portals (Applications, Certificates, Courses, Finance, Leads)
├── actions/               # Server Actions (Type-safe form handling & mutations)
├── api/                   # API routes (REST endpoints, downloads, webhooks)
├── blog/                  # Public engineering blog & articles
├── courses/               # Public training course catalog
├── events/                # Workshops & webinar events
├── internships/           # Internship program listings & application flows
├── verify/                # Verification engine for student certificates
└── globals.css            # Global CSS, design tokens & WCAG AA contrast rules
```

---

## 🎨 Design System & Styling Rules

1. **Color Palette Tokens**:
   - `navy`: `#0F172A` (Primary dark background / high contrast text)
   - `brand-ink`: `#B35100` (AA accessible text orange)
   - `white` / `slate-50`: Backgrounds and cards

2. **Typography**:
   - Font Family: Inter / Outfit / System Sans-serif via Next.js Font Optimization.

3. **Accessibility Contract (WCAG AA)**:
   - All interactive text elements must pass 4.5:1 contrast against background colors.
   - Run `npm run check:contrast` to verify WCAG AA compliance.

---

## 🗄️ Database & Prisma Workflows

The PostgreSQL schema is defined in `prisma/schema.prisma`.

### Common Database Tasks

```bash
# Modify schema.prisma then create a migration
npm run db:migrate

# Push schema changes directly during prototype work
npm run db:push

# Launch Prisma Studio to inspect data
npm run db:studio
```

---

## 🧪 Testing Standards

All business logic and UI components are tested using **Vitest** and **React Testing Library**.

- Unit tests: `tests/unit/*.test.ts`
- Component tests: `tests/components/*.test.tsx`

Run tests with:

```bash
npm test
```
