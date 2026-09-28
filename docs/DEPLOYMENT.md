# Agnipankh Labs — Deployment Guide

Production deployment workflows, Vercel configuration, Docker setup, and security checklist for **Agnipankh Labs**.

---

## 🚀 Recommended Deployment: Vercel

Agnipankh Labs is optimized for zero-config deployment on Vercel.

### 1. Connect Repository
- Import the Git repository in the Vercel Dashboard.
- Set Framework Preset to **Next.js**.

### 2. Environment Variables
Configure the following production environment variables in Vercel:

```env
DATABASE_URL="postgresql://user:password@pg-host:5432/db?sslmode=require"
AUTH_SECRET="generated-secure-random-secret"
NEXT_PUBLIC_APP_URL="https://agnipankhlabs.com"
RESEND_API_KEY="re_..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Build & Deploy Command
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

---

## 🐳 Docker Deployment

To run Agnipankh Labs using Docker:

```bash
# Build Docker image
docker build -t agnipankh-labs .

# Run container
docker run -d -p 3000:3000 --env-file .env agnipankh-labs
```

---

## 🛡️ Production Security Checklist

- [x] SSL/TLS forced via HTTPS headers in Next.js middleware
- [x] Rate limiting active via Upstash Redis on API endpoints
- [x] TOTP Multi-Factor Authentication enabled for Admin users
- [x] Certificate QR verification hashed with HMAC SHA-256
- [x] Database connections protected by PostgreSQL SSL parameters
