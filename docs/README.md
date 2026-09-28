# Agnipankh Labs — Documentation Hub

Welcome to the centralized documentation repository for **Agnipankh Labs**.

---

## 📖 Core Guides

| Document | Purpose & Audience |
|---|---|
| [`QUICKSTART.md`](QUICKSTART.md) | 5-minute setup — prerequisites, installation, dev server, key workflows |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Full developer guide — architecture, coding standards, database, UI components |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Operations & DevOps guide — Vercel, Docker, CI/CD, security checklist |
| [`MAINTENANCE.md`](MAINTENANCE.md) | System administration guide — maintenance tasks, incident response, backups |
| [`SUPPORT.md`](SUPPORT.md) | Support team manual — ticket management, SLAs, escalation procedures |

---

## 📂 Project Planning & Proposal

Located in [`project/`](project/):

- [`project/plan.md`](project/plan.md) — Master project plan, architecture decision records (ADRs), and technical debt registry
- [`project/done.md`](project/done.md) — Complete timeline of finished features, bug fixes, and refactoring
- [`project/startup-proposal.md`](project/startup-proposal.md) — Agnipankh Labs master startup proposal document

---

## 📄 Corporate Documents & Specification PDFs

All official PDF documents are stored in [`pdf/`](pdf/):

- `Agnipankh_Labs_Brand_Kit_Content_Pack_v1.0.pdf`
- `Agnipankh_Labs_Business_and_Growth_Plan_v1.0.pdf`
- `Agnipankh_Labs_Company_Profile.pdf`
- `Agnipankh_Labs_Cybersecurity_and_IT_Governance_Framework.pdf`
- `Agnipankh_Labs_Finance_and_Governance_Pack.pdf`
- `Agnipankh_Labs_HR_and_People_Management_Framework.pdf`
- `Agnipankh_Labs_Implementation_Assets_Pack.pdf`
- `Agnipankh_Labs_Internship_Operations_Pack_v1.0.pdf`
- `Agnipankh_Labs_Investor_Partnership_Deck_v1.0.pdf`
- `Agnipankh_Labs_Legal_Document_Pack.pdf`
- `Agnipankh_Labs_Master_Execution_Blueprint.pdf`
- `Agnipankh_Labs_Operations_Administration_Manual_v1.0.pdf`
- `Agnipankh_Labs_Product_LMS_and_Innovation_Roadmap.pdf`
- `Agnipankh_Labs_Product_Requirements_Document_PRD.pdf`
- `Agnipankh_Labs_Quality_Management_System_QMS.pdf`
- `Agnipankh_Labs_SRS_v1.0.pdf`
- `Agnipankh_Labs_Sales_Marketing_and_Community_Growth_Playbook.pdf`
- `startup-proposal.pdf`

---

## 🛠️ PDF Generation & Tooling

To convert Markdown documentation files to PDF format:

### Script Execution

```bash
# Convert core documentation files to PDF
./convert-to-pdf.sh

# Generate startup proposal HTML & PDF
node scripts/generate-proposal-pdf.mjs
```

### PDF Styling

PDF styling is managed by [`styles/pdf.css`](styles/pdf.css).

---

## 🔍 Audit & Maintenance Reports

Located in [`project-audit/`](project-audit/):

- [`project-audit/PROJECT_AUDIT.md`](project-audit/PROJECT_AUDIT.md) — Complete repository audit report
- [`project-audit/DELETE_MANIFEST.md`](project-audit/DELETE_MANIFEST.md) — Deletion manifest & safety evidence
