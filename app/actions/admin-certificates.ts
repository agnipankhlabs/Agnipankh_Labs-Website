"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  generateCertificateId,
  computeCertificateHash,
  certificateVerifyUrl,
  type CertificateHashInput,
} from "@/lib/certificates";
import {
  issueCertificateSchema,
  revokeCertificateSchema,
  supersedeCertificateSchema,
} from "@/lib/validation/certificate";
import {
  recordMemoryCertificate,
  revokeMemoryCertificate,
} from "@/lib/admin-certificates";
import type { CertificateType } from "@/lib/generated/prisma/client";

export interface CertificateActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  certificateId?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: CertificateActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

/**
 * Mint and issue a new cryptographic certificate.
 */
export async function issueCertificateAction(
  prevState: CertificateActionResult | null,
  formData: FormData
): Promise<CertificateActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    userId: formData.get("userId"),
    recipientEmail: formData.get("recipientEmail"),
    verifiedFullLegalName: formData.get("verifiedFullLegalName"),
    type: formData.get("type"),
    programName: formData.get("programName"),
    trackName: formData.get("trackName"),
    cohortStartDate: formData.get("cohortStartDate"),
    cohortEndDate: formData.get("cohortEndDate"),
    signatureAuthority:
      formData.get("signatureAuthority") || "Director — Agnipankh Labs",
    signatureRef: formData.get("signatureRef") || `SIG-AL-${new Date().getFullYear()}`,
  };

  const parsed = issueCertificateSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return {
      success: false,
      message: "Please fix the validation errors below.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const issueDate = new Date();
  const issuedAtUtc = issueDate;

  // Generate Crockford Base32 ID per the frozen contract
  const certificateId = generateCertificateId(data.type as CertificateType, issueDate);

  const cohortStart = data.cohortStartDate ? new Date(data.cohortStartDate) : null;
  const cohortEnd = data.cohortEndDate ? new Date(data.cohortEndDate) : null;

  // Prepare canonical hash input
  const hashInput: CertificateHashInput = {
    certificateId,
    verifiedFullLegalName: data.verifiedFullLegalName.trim().replace(/\s+/g, " "),
    programName: data.programName.trim(),
    trackName: data.trackName ? data.trackName.trim() : null,
    cohortStartDate: cohortStart,
    cohortEndDate: cohortEnd,
    issuedAtUtc,
  };

  // Compute HMAC-SHA256 hash digest
  const sha256Hash = computeCertificateHash(hashInput);
  const verifyUrl = certificateVerifyUrl(certificateId);

  try {
    await prisma.certificate.create({
      data: {
        certificateId,
        userId: data.userId,
        type: data.type as CertificateType,
        verifiedFullLegalName: hashInput.verifiedFullLegalName,
        programName: hashInput.programName,
        trackName: hashInput.trackName,
        cohortStartDate: cohortStart,
        cohortEndDate: cohortEnd,
        issueDate,
        issuedAtUtc,
        sha256Hash,
        signatureAuthority: data.signatureAuthority,
        signatureRef: data.signatureRef ?? null,
        qrCodeUrl: verifyUrl,
      },
    });
  } catch (error) {
    console.warn("[admin-certificates] DB insert failed, recording to memory cache:", error);
    recordMemoryCertificate({
      id: `cert-mem-${Date.now()}`,
      certificateId,
      userId: data.userId,
      recipientName: hashInput.verifiedFullLegalName,
      recipientEmail: data.recipientEmail,
      type: data.type as CertificateType,
      programName: hashInput.programName,
      trackName: hashInput.trackName,
      cohortStartDate: cohortStart,
      cohortEndDate: cohortEnd,
      issueDate,
      issuedAtUtc,
      sha256Hash,
      signatureAuthority: data.signatureAuthority,
      signatureRef: data.signatureRef ?? null,
      downloadCount: 0,
      revokedAt: null,
      revokedReason: null,
      supersededById: null,
      supersedesId: null,
      isVerified: true,
    });
  }

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${certificateId}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Certificate ${certificateId} minted and issued to ${hashInput.verifiedFullLegalName}!`,
    certificateId,
  };
}

/**
 * Revoke an issued certificate with an audit reason.
 */
export async function revokeCertificateAction(
  certificateId: string,
  reason: string
): Promise<CertificateActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = revokeCertificateSchema.safeParse({
    certificateId,
    revokedReason: reason,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid revocation request.",
    };
  }

  try {
    await prisma.certificate.update({
      where: { certificateId },
      data: {
        revokedAt: new Date(),
        revokedReason: parsed.data.revokedReason,
      },
    });
  } catch (error) {
    console.warn("[admin-certificates] DB update failed, setting in memory:", error);
    revokeMemoryCertificate(certificateId, parsed.data.revokedReason);
  }

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${certificateId}`);
  revalidatePath("/admin");

  return {
    success: true,
    message: `Certificate ${certificateId} has been revoked.`,
    certificateId,
  };
}

/**
 * Supersede a certificate with a new corrected certificate.
 * Links the original to the replacement via supersededById/supersedes relations.
 */
export async function supersedeCertificateAction(
  originalCertificateId: string,
  newCertificateId: string,
  reason: string
): Promise<CertificateActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = supersedeCertificateSchema.safeParse({
    originalCertificateId,
    newCertificateId,
    supersessionReason: reason,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid supersession request.",
    };
  }

  const { originalCertificateId: origId, newCertificateId: newId, supersessionReason: _supersessionReason } = parsed.data;

  // Verify both certificates exist
  const [originalCert, newCert] = await Promise.all([
    prisma.certificate.findUnique({ where: { certificateId: origId } }),
    prisma.certificate.findUnique({ where: { certificateId: newId } }),
  ]);

  if (!originalCert) {
    return { success: false, message: `Original certificate ${origId} not found.` };
  }
  if (!newCert) {
    return { success: false, message: `New certificate ${newId} not found.` };
  }

  // Check original is not already superseded
  if (originalCert.supersededById) {
    return { success: false, message: `Original certificate ${origId} is already superseded.` };
  }

  // Check new certificate is not already a supersession target
  if (newCert.supersededById) {
    return { success: false, message: `New certificate ${newId} is already a supersession target.` };
  }

  try {
    // Link original -> new (supersededById on original points to new cert's id)
    await prisma.certificate.update({
      where: { certificateId: origId },
      data: {
        supersededById: newCert.id,
      },
    });
    // The inverse relation 'supersedes' on newCert is automatically maintained by Prisma
  } catch (error) {
    console.warn("[admin-certificates] DB supersession failed:", error);
    return { success: false, message: "Failed to link certificates for supersession." };
  }

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${origId}`);
  revalidatePath(`/verify/${newId}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Certificate ${origId} superseded by ${newId}.`,
    certificateId: newId,
  };
}
