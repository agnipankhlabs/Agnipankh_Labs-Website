# Agnipankh Labs — Quickstart Guide

Get up and running with **Agnipankh Labs** in 5 minutes.

---

## Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later
- **PostgreSQL**: `v15.x` or later (Local or Cloud instance)

---

## 1. Clone & Setup Project

```bash
# Clone the repository
git clone https://github.com/agnipankh-labs/agnipankh-labs.git
cd agnipankh-labs

# Install dependencies
npm install
```

---

## 2. Environment Configuration

Copy the example environment configuration file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to configure your PostgreSQL database connection URL and authentication secrets:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/agnipankh_db?schema=public"
AUTH_SECRET="your-super-secret-nextauth-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Database Initialization & Seeding

Generate the Prisma Client and apply database schema migrations:

```bash
# Generate Prisma client
npm run db:generate

# Run schema migrations
npm run db:migrate

# Seed demo data (admin users, courses, internships, blog posts)
npm run db:seed
```

---

## 4. Run Development Server

Start the Next.js development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Key Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Compiles production build |
| `npm run check` | Runs full test & verification suite (Typecheck, Lint, Test, Contrast, Certificates) |
| `npm run typecheck` | Validates TypeScript types across codebase |
| `npm run lint` | Runs ESLint 9 checks |
| `npm test` | Runs Vitest test suite |
| `npm run db:studio` | Launches Prisma Studio GUI for database management |
