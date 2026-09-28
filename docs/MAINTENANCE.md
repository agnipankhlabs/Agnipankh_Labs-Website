# Agnipankh Labs — Maintenance & Operations Manual

Operations guide, daily/weekly/monthly routines, incident response, and performance monitoring for **Agnipankh Labs**.

---

## 📅 Scheduled Maintenance Tasks

### Daily Routines
- Monitor error rates in Next.js Server Actions and API routes.
- Check database connection pool health via `@prisma/adapter-pg`.
- Audit rate limiting metrics on Upstash Redis dashboard.

### Weekly Routines
- Perform automated PostgreSQL backup verification.
- Review certificate issuance logs and verification audit entries.
- Run `npm run check` locally to verify security dependencies.

### Monthly Routines
- Review and update third-party npm dependencies.
- Audit admin user permissions and MFA enrollment statuses.

---

## 🚨 Incident Response Workflows

### 1. Database Outage / Connection Failures
- Verify PostgreSQL service availability.
- Check `DATABASE_URL` credentials in production environment settings.
- Restart connection pool.

### 2. High API Rate Limit Spikes
- Inspect Upstash Redis dashboard for originating IP addresses.
- Adjust rate limiting windows in `lib/rate-limit.ts`.
