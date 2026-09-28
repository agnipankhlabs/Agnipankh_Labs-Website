import { prisma } from "@/lib/db";
import {
  verifyCertificateHash,
  type CertificateHashInput,
} from "@/lib/certificates";
import type { CertificateType } from "@/lib/generated/prisma/client";

export interface AdminCertificateRecord {
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
  downloadCount: number;
  revokedAt: Date | null;
  revokedReason: string | null;
  supersededById: string | null;
  supersedesId: string | null;
  isVerified: boolean;
}

// In-memory certificate cache for dev / unmigrated database
const memoryCertificates: AdminCertificateRecord[] = [];

/**
 * Retrieve all certificates for the admin console with integrity validation.
 */
export async function getAdminCertificates(filters?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<AdminCertificateRecord[]> {
  let list: AdminCertificateRecord[] = [];

  try {
    const dbCerts = await prisma.certificate.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    if (dbCerts.length > 0) {
      list = dbCerts.map((c) => {
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
          downloadCount: c.downloadCount,
          revokedAt: c.revokedAt,
          revokedReason: c.revokedReason,
          supersededById: c.supersededById,
          supersedesId: c.supersedesId ?? null,
          isVerified: isValidHash,
        };
      });
    }
  } catch {
    // Fall back to memory store
  }

  // Merge with memory store
  const combined = [
    ...list,
    ...memoryCertificates.filter((m) => !list.some((l) => l.certificateId === m.certificateId)),
  ];

  let filtered = combined;

  if (filters?.type && filters.type !== "ALL") {
    filtered = filtered.filter((c) => c.type === filters.type);
  }

  if (filters?.status && filters.status !== "ALL") {
    if (filters.status === "ACTIVE") {
      filtered = filtered.filter((c) => !c.revokedAt);
    } else if (filters.status === "REVOKED") {
      filtered = filtered.filter((c) => Boolean(c.revokedAt));
    }
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.recipientName.toLowerCase().includes(q) ||
        c.recipientEmail.toLowerCase().includes(q) ||
        c.programName.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Fetch certificate by ID or Certificate ID.
 */
export async function getAdminCertificateById(
  id: string
): Promise<AdminCertificateRecord | null> {
  try {
    const c = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateId: id }],
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (c) {
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
        downloadCount: c.downloadCount,
        revokedAt: c.revokedAt,
        revokedReason: c.revokedReason,
        supersededById: c.supersededById,
        supersedesId: c.supersedesId ?? null,
        isVerified: isValidHash,
      };
    }
  } catch {
    // Memory fallback
  }

  const mem = memoryCertificates.find(
    (m) => m.id === id || m.certificateId === id
  );
  return mem ?? null;
}

/**
 * KPI stats for admin certificate desk.
 */
export async function getAdminCertificateStats(): Promise<{
  total: number;
  active: number;
  revoked: number;
  totalDownloads: number;
}> {
  const all = await getAdminCertificates();
  const revoked = all.filter((c) => Boolean(c.revokedAt)).length;
  const active = all.length - revoked;
  const totalDownloads = all.reduce((sum, c) => sum + c.downloadCount, 0);

  return {
    total: all.length,
    active,
    revoked,
    totalDownloads,
  };
}

/**
 * Record memory certificate for local testing
 */
export function recordMemoryCertificate(record: AdminCertificateRecord): void {
  const idx = memoryCertificates.findIndex(
    (m) => m.certificateId === record.certificateId
  );
  if (idx >= 0) {
    memoryCertificates[idx] = record;
  } else {
    memoryCertificates.unshift(record);
  }
}

/**
 * Revoke certificate in memory store
 */
export function revokeMemoryCertificate(
  certificateId: string,
  reason: string
): boolean {
  const cert = memoryCertificates.find(
    (m) => m.certificateId === certificateId || m.id === certificateId
  );
  if (cert) {
    cert.revokedAt = new Date();
    cert.revokedReason = reason;
    return true;
  }
  return false;
}
