import { describe, it, expect, beforeAll } from "vitest";
import {
  generateCertificateId,
  normalizeCertificateId,
  computeCertificateHash,
  verifyCertificateHash,
  isValidCertificateIdFormat,
  type CertificateHashInput,
} from "@/lib/certificates";
import type { CertificateType } from "@/lib/generated/prisma/client";

describe("Certificate Integrity & Identifier Engine", () => {
  beforeAll(() => {
    process.env.CERTIFICATE_HASH_SECRET =
      "test-secret-key-32-chars-long-strictly-for-testing!!";
  });

  const types: CertificateType[] = [
    "INTERNSHIP",
    "COURSE",
    "EXCELLENCE",
    "RECOGNITION",
    "LEADERSHIP",
    "CITATION",
  ];

  it("generates valid Crockford Base32 certificate IDs for every type", () => {
    for (const type of types) {
      const id = generateCertificateId(type, new Date("2026-06-15T00:00:00Z"));
      expect(isValidCertificateIdFormat(id)).toBe(true);
      expect(id.startsWith("AL-")).toBe(true);
      expect(id.includes("26-")).toBe(true);
    }
  });

  it("produces non-colliding random IDs", () => {
    const sample = new Set<string>();
    for (let i = 0; i < 50; i++) {
      sample.add(generateCertificateId("INTERNSHIP"));
    }
    expect(sample.size).toBe(50);
  });

  it("normalizes certificate IDs correctly", () => {
    const canonical = "AL-IN26-K7M2QX9P4T";

    // Same ID without hyphens
    expect(normalizeCertificateId("ALIN26K7M2QX9P4T")).toBe(canonical);

    // Lowercase with spaces
    expect(normalizeCertificateId("al in26 k7m2qx9p4t")).toBe(canonical);

    // Invalid length returns sanitized raw string
    expect(normalizeCertificateId("AL-TOO-SHORT")).toBe("ALTOOSHORT");
  });

  it("computes deterministic HMAC digest and detects tampering", () => {
    const issuedAt = new Date("2026-01-01T00:00:00Z");
    const certData: CertificateHashInput = {
      certificateId: "AL-IN26-K7M2QX9P4T",
      verifiedFullLegalName: "Jane Doe",
      programName: "Full Stack Engineering",
      trackName: "Web Development",
      cohortStartDate: new Date("2025-10-01T00:00:00Z"),
      cohortEndDate: new Date("2025-12-31T00:00:00Z"),
      issuedAtUtc: issuedAt,
    };

    const hash = computeCertificateHash(certData);
    expect(hash.startsWith("v1:")).toBe(true);

    // Genuine verification
    expect(verifyCertificateHash(certData, hash)).toBe(true);

    // Tampered recipient name
    expect(
      verifyCertificateHash(
        { ...certData, verifiedFullLegalName: "Jane Smith" },
        hash,
      ),
    ).toBe(false);

    // Tampered dates
    expect(
      verifyCertificateHash(
        { ...certData, cohortEndDate: new Date("2026-01-15T00:00:00Z") },
        hash,
      ),
    ).toBe(false);

    // Malformed digest string
    expect(verifyCertificateHash(certData, "invalid-digest-format")).toBe(false);
  });
});
