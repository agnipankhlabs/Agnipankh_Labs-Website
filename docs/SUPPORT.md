# Agnipankh Labs — Support Guide

Ticket management, SLA targets, escalation procedures, and support workflows for **Agnipankh Labs**.

---

## 🎧 Support Ticket Priorities & SLAs

| Priority | First Response SLA | Resolution SLA | Description |
|---|---|---|---|
| **P1 - Critical** | 15 Minutes | 4 Hours | System outage, authentication failure, database down |
| **P2 - High** | 1 Hour | 24 Hours | Core feature degraded (Certificate verification down) |
| **P3 - Normal** | 4 Hours | 48 Hours | Minor bug, student portal UI glitch |
| **P4 - Low** | 24 Hours | 5 Days | General inquiry, feedback, feature request |

---

## 🔍 Common Support Inquiries

### 1. Certificate Verification Issues
- **Problem**: Certificate ID returns "Invalid or Not Found".
- **Resolution**: Verify certificate ID format (`AL-CERT-YYYY-XXXX`). Check if certificate status in Admin is `ISSUED`.

### 2. Password Reset / Login Lockout
- **Problem**: User locked out after multiple invalid MFA attempts.
- **Resolution**: Admin can reset MFA status in Admin User Portal (`/admin/mentors` or `/admin/applications`).
