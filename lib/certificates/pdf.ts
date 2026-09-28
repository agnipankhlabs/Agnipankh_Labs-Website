import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { format } from "date-fns";

export interface CertificatePdfProps {
  certificateId: string;
  recipientName: string;
  programName: string;
  trackName: string | null;
  type: string;
  issueDate: Date;
  cohortStartDate: Date | null;
  cohortEndDate: Date | null;
  signatureAuthority: string;
  signatureRef: string | null;
  verifyUrl: string;
  sha256Hash: string;
}

const BRAND_ORANGE = "#ff6b00";
const BRAND_INK = "#b35100";
const NAVY = "#0f172a";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";
const EMERALD_800 = "#065f46";
const AMBER_700 = "#b45309";

function drawRoundedRect(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  doc
    .moveTo(x + radius, y)
    .lineTo(x + width - radius, y)
    .quadraticCurveTo(x + width, y, x + width, y + radius)
    .lineTo(x + width, y + height - radius)
    .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    .lineTo(x + radius, y + height)
    .quadraticCurveTo(x, y + height, x, y + height - radius)
    .lineTo(x, y + radius)
    .quadraticCurveTo(x, y, x + radius, y);
}

export async function generateCertificatePdfBuffer(props: CertificatePdfProps): Promise<Buffer> {
  const {
    certificateId,
    recipientName,
    programName,
    trackName,
    type,
    issueDate,
    cohortStartDate,
    cohortEndDate,
    signatureAuthority,
    signatureRef,
    verifyUrl,
    sha256Hash,
  } = props;

  // Generate QR code data URL before creating the PDF
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 120,
    margin: 1,
    color: { dark: NAVY, light: "#ffffff" },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: `Certificate - ${certificateId}`,
        Author: "Agnipankh Labs",
        Subject: "Official Certificate",
        Keywords: "certificate, verification, Agnipankh Labs",
        Creator: "Agnipankh Labs Certificate System",
        Producer: "Agnipankh Labs",
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 120; // 60pt margins on each side

    // ========================================================================
    // HEADER
    // ========================================================================
    let y = 60;

    // Brand row
    const logoPath = path.join(process.cwd(), "public", "images", "logo-full.png");
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 60, y, { width: 120, height: 42, fit: [120, 42] });
      } catch {
        doc
          .fillColor(NAVY)
          .circle(60 + 20, y + 20, 20)
          .fill();
        doc
          .fillColor("#ffffff")
          .fontSize(14)
          .text("AL", 60 + 8, y + 13, { width: 40, align: "center" });
      }
    } else {
      doc
        .fillColor(NAVY)
        .circle(60 + 20, y + 20, 20)
        .fill();
      doc
        .fillColor("#ffffff")
        .fontSize(14)
        .text("AL", 60 + 8, y + 13, { width: 40, align: "center" });
    }

    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("AGNIPANKH LABS", 60 + 50, y + 10);

    // Type badge
    const badgeWidth = 80;
    const badgeX = doc.page.width - 60 - badgeWidth;
    drawRoundedRect(doc, badgeX, y + 8, badgeWidth, 24, 4);
    doc.fillColor(BRAND_ORANGE).fill();
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(type, badgeX, y + 14, { width: badgeWidth, align: "center" });

    y += 60;

    // Divider line
    doc
      .moveTo(60, y)
      .lineTo(doc.page.width - 60, y)
      .strokeColor("#e2e8f0")
      .lineWidth(2)
      .stroke();

    y += 30;

    // ========================================================================
    // TITLE SECTION
    // ========================================================================
    doc
      .fillColor(SLATE_500)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("OFFICIAL CREDENTIAL", 60, y, { width: pageWidth, align: "center" });

    y += 20;

    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(recipientName, 60, y, { width: pageWidth, align: "center" });

    y += 40;

    doc
      .fillColor(SLATE_700)
      .font("Helvetica")
      .fontSize(13)
      .text("for successful completion of", 60, y, { width: pageWidth, align: "center" });

    y += 20;

    doc
      .fillColor(BRAND_INK)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(programName, 60, y, { width: pageWidth, align: "center" });

    y += 28;

    if (trackName) {
      doc
        .fillColor(SLATE_500)
        .font("Helvetica")
        .fontSize(12)
        .text(`Track: ${trackName}`, 60, y, { width: pageWidth, align: "center" });
      y += 14;
    }

    y += 20;

    // ========================================================================
    // DETAILS GRID
    // ========================================================================
    const details = [
      { label: "Certificate ID", value: certificateId, fontSize: 9 },
      { label: "Issue Date", value: format(issueDate, "MMMM d, yyyy") },
    ];

    if (cohortStartDate) {
      details.push({ label: "Cohort Start", value: format(cohortStartDate, "MMMM yyyy") });
    }
    if (cohortEndDate) {
      details.push({ label: "Cohort End", value: format(cohortEndDate, "MMMM yyyy") });
    }
    details.push({ label: "Authorized Signatory", value: signatureAuthority });
    if (signatureRef) {
      details.push({ label: "Signature Reference", value: signatureRef, fontSize: 9 });
    }

    const colWidth = (pageWidth - 20) / 2;
    const detailY = y;

    details.forEach((detail, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 60 + col * (colWidth + 20);
      const itemY = detailY + row * 45;

      // Background box
      drawRoundedRect(doc, x, itemY, colWidth, 40, 6);
      doc.fillColor("#f8fafc").fill();

      doc
        .fillColor(SLATE_500)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(detail.label, x + 12, itemY + 8, { width: colWidth - 24 });

      doc
        .fillColor(NAVY)
        .font("Helvetica-Bold")
        .fontSize(detail.fontSize || 11)
        .text(detail.value, x + 12, itemY + 20, { width: colWidth - 24 });
    });

    y = detailY + Math.ceil(details.length / 2) * 45 + 20;

    // Divider line
    doc
      .moveTo(60, y)
      .lineTo(doc.page.width - 60, y)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();

    y += 20;

    // ========================================================================
    // FOOTER: SIGNATORY & QR CODE
    // ========================================================================
    const leftWidth = pageWidth * 0.45;
    const rightWidth = pageWidth * 0.45;
    const leftX = 60;
    const rightX = doc.page.width - 60 - rightWidth;

    // Signatory line
    doc
      .moveTo(leftX, y)
      .lineTo(leftX + leftWidth, y)
      .strokeColor(NAVY)
      .lineWidth(1)
      .stroke();

    doc
      .fillColor(SLATE_500)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("AUTHORIZED SIGNATORY", leftX, y + 8, { width: leftWidth });

    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(signatureAuthority, leftX, y + 22, { width: leftWidth });

    // QR Code on the right
    doc.image(qrDataUrl, rightX + (rightWidth - 100) / 2, y - 10, { width: 100, height: 100 });

    doc
      .fillColor(SLATE_500)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("SCAN TO VERIFY", rightX, y + 95, { width: rightWidth, align: "center" });

    doc
      .fillColor(SLATE_500)
      .font("Helvetica")
      .fontSize(7)
      .text(verifyUrl, rightX, y + 110, { width: rightWidth, align: "center" });

    y += 140;

    // ========================================================================
    // INTEGRITY SECTION
    // ========================================================================
    doc
      .moveTo(60, y)
      .lineTo(doc.page.width - 60, y)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();

    y += 20;

    doc
      .fillColor(SLATE_500)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("CRYPTOGRAPHIC INTEGRITY", 60, y, { width: pageWidth });

    y += 16;

    doc
      .fillColor(SLATE_700)
      .font("Courier")
      .fontSize(7)
      .text(`HMAC-SHA256: ${sha256Hash}`, 60, y, { width: pageWidth });

    y += 16;

    doc
      .fillColor(EMERALD_800)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Retention: PERMANENT \u2014 Never purged (AL-SEC-001)", 60, y, { width: pageWidth });

    y += 30;

    // ========================================================================
    // DISCLAIMER
    // ========================================================================
    doc
      .moveTo(60, y)
      .lineTo(doc.page.width - 60, y)
      .strokeColor("#fcd34d")
      .lineWidth(1)
      .stroke();

    y += 16;

    const disclaimerText =
      "This certificate confirms successful completion of a structured training program. " +
      "Agnipankh Labs programs are educational training and do not constitute employment, " +
      "job offers, or guarantees of professional outcomes. Verify authenticity at the URL above.";

    doc
      .fillColor(AMBER_700)
      .font("Helvetica")
      .fontSize(7)
      .text(disclaimerText, 60, y, {
        width: pageWidth,
        align: "center",
        lineGap: 2,
      });

    // Finalize
    doc.end();
  });
}

export async function generateCertificatePdfBlob(props: CertificatePdfProps): Promise<Blob> {
  const buffer = await generateCertificatePdfBuffer(props);
  return new Blob([buffer], { type: "application/pdf" });
}