import { prisma } from "@/lib/db";
import {
  verifyCertificateHash,
  type CertificateHashInput,
} from "@/lib/certificates";
import type { CertificateType } from "@/lib/generated/prisma/client";

export interface PublicCertificateRecord {
  id: string;
  certificateId: string;
  userId: string;
  recipientName: string;
  recipientEmail: string;
  type: CertificateType;
  programName: string;
  trackName: string | null;
  cohortStartDate: Date | null;
  cohortEndDate: Date | null;
  issueDate: Date;
  issuedAtUtc: Date;
  sha256Hash: string;
  signatureAuthority: string;
  signatureRef: string | null;
  qrCodeUrl: string | null;
  downloadCount: number;
  revokedAt: Date | null;
  revokedReason: string | null;
  supersededById: string | null;
  supersedesId: string | null;
  isVerified: boolean;
}

/**
 * Retrieve a certificate by its public Certificate ID for the verify page.
 * Performs integrity validation via HMAC-SHA256.
 */
export async function getCertificateByCertificateId(
  certificateId: string
): Promise<PublicCertificateRecord | null> {
  // Normalize the input ID (handles common transcription errors)
  const { normalizeCertificateId } = await import("@/lib/certificates");
  const normalizedId = normalizeCertificateId(certificateId);

  try {
    const c = await prisma.certificate.findUnique({
      where: { certificateId: normalizedId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!c) {
      return null;
    }

    const hashInput: CertificateHashInput = {
      certificateId: c.certificateId,
      verifiedFullLegalName: c.verifiedFullLegalName,
      programName: c.programName,
      trackName: c.trackName,
      cohortStartDate: c.cohortStartDate,
      cohortEndDate: c.cohortEndDate,
      issuedAtUtc: c.issuedAtUtc,
    };

    let isValidHash = false;
    try {
      isValidHash = verifyCertificateHash(hashInput, c.sha256Hash);
    } catch {
      isValidHash = false;
    }

    return {
      id: c.id,
      certificateId: c.certificateId,
      userId: c.userId,
      recipientName: c.verifiedFullLegalName,
      recipientEmail: c.user?.email ?? "—",
      type: c.type,
      programName: c.programName,
      trackName: c.trackName,
      cohortStartDate: c.cohortStartDate,
      cohortEndDate: c.cohortEndDate,
      issueDate: c.issueDate,
      issuedAtUtc: c.issuedAtUtc,
      sha256Hash: c.sha256Hash,
      signatureAuthority: c.signatureAuthority ?? "Director — Agnipankh Labs",
      signatureRef: c.signatureRef,
      qrCodeUrl: c.qrCodeUrl,
      downloadCount: c.downloadCount,
      revokedAt: c.revokedAt,
      revokedReason: c.revokedReason,
      supersededById: c.supersededById,
      supersedesId: c.supersedesId ?? null,
      isVerified: isValidHash,
    };
  } catch (error) {
    console.error("[public-certificates] Database query failed:", error);
    return null;
  }
}