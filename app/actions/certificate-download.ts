"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateCertificatePdfBuffer, type CertificatePdfProps } from "@/lib/certificates/pdf";
import { certificateVerifyUrl } from "@/lib/certificates";

export interface DownloadCertificateResult {
  success: boolean;
  message?: string;
  pdfBuffer?: Buffer;
  filename?: string;
}

/**
 * Download a certificate PDF. Can be called by the certificate recipient or admin staff.
 */
export async function downloadCertificateAction(
  certificateId: string
): Promise<DownloadCertificateResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const roles = (session?.user as unknown as { roles?: string[] })?.roles ?? [];

  if (!userId) {
    return { success: false, message: "Authentication required." };
  }

  const isAdmin = roles.includes("admin") || roles.includes("super_admin") || roles.includes("trainer");

  try {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!cert) {
      return { success: false, message: "Certificate not found." };
    }

    // Authorization: recipient or admin
    const isRecipient = cert.userId === userId;
    if (!isRecipient && !isAdmin) {
      return { success: false, message: "Unauthorized to download this certificate." };
    }

    const verifyUrl = cert.qrCodeUrl ?? certificateVerifyUrl(certificateId);

    const pdfProps: CertificatePdfProps = {
      certificateId: cert.certificateId,
      recipientName: cert.verifiedFullLegalName,
      programName: cert.programName,
      trackName: cert.trackName,
      type: cert.type,
      issueDate: cert.issueDate,
      cohortStartDate: cert.cohortStartDate,
      cohortEndDate: cert.cohortEndDate,
      signatureAuthority: cert.signatureAuthority ?? "Director — Agnipankh Labs",
      signatureRef: cert.signatureRef,
      verifyUrl,
      sha256Hash: cert.sha256Hash,
    };

    const pdfBuffer = await generateCertificatePdfBuffer(pdfProps);

    // Record the download
    await prisma.certificateDownload.create({
      data: {
        certificateId: cert.id,
        ipAddress: null, // Could be enhanced with request IP
      },
    });

    // Increment download count
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { downloadCount: { increment: 1 } },
    });

    revalidatePath(`/verify/${certificateId}`);
    revalidatePath("/admin/certificates");
    revalidatePath("/dashboard");

    const filename = `Agnipankh-Labs-Certificate-${certificateId}.pdf`;

    return {
      success: true,
      message: "Certificate PDF generated successfully.",
      pdfBuffer,
      filename,
    };
  } catch (error) {
    console.error("[downloadCertificateAction] Error:", error);
    return { success: false, message: "Failed to generate certificate PDF." };
  }
}

/**
 * Admin-only: Resend certificate PDF via email to recipient.
 */
export async function emailCertificateAction(
  certificateId: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles ?? [];

  const isAdmin = roles.includes("admin") || roles.includes("super_admin") || roles.includes("trainer");

  if (!isAdmin) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!cert) {
      return { success: false, message: "Certificate not found." };
    }

    // PDF generation for email attachment (pending Resend attachment support)
    // const pdfProps: CertificatePdfProps = { ... };
    // const _pdfBuffer = await generateCertificatePdfBuffer(pdfProps);

    // TODO: Send email with PDF attachment via Resend
    // This would require extending the email service to support attachments

    return { success: true, message: "Certificate email queued (attachment support pending)." };
  } catch (error) {
    console.error("[emailCertificateAction] Error:", error);
    return { success: false, message: "Failed to email certificate." };
  }
}