/**
 * Verifies the frozen certificate contract. Run: npx tsx scripts/check-certificates.ts
 *
 * These are not decorative tests. Every assertion here corresponds to something
 * that becomes permanently unfixable the moment the first certificate is issued.
 */
import assert from "node:assert/strict";
import {
  certificateVerifyUrl,
  computeCertificateHash,
  generateCertificateId,
  isValidCertificateIdFormat,
  normalizeCertificateId,
  verifyCertificateHash,
  type CertificateHashInput,
} from "../lib/certificates/index.js";

process.env.CERTIFICATE_HASH_SECRET ??= "test-secret-do-not-use-in-production";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  PASS  ${name}`);
}

console.log("\n  Certificate contract\n");

check("ID matches the frozen format", () => {
  const id = generateCertificateId("INTERNSHIP", new Date("2026-04-01T00:00:00Z"));
  assert.match(id, /^AL-IN26-[0-9A-HJKMNP-TV-Z]{10}$/, `got ${id}`);
  assert.ok(isValidCertificateIdFormat(id));
});

check("every certificate type produces a valid ID", () => {
  for (const type of [
    "INTERNSHIP",
    "COURSE",
    "EXCELLENCE",
    "RECOGNITION",
    "LEADERSHIP",
    "CITATION",
  ] as const) {
    assert.ok(
      isValidCertificateIdFormat(generateCertificateId(type)),
      `${type} produced an invalid ID`,
    );
  }
});

check("IDs are not sequential and do not collide", () => {
  const ids = new Set(
    Array.from({ length: 20_000 }, () => generateCertificateId("COURSE")),
  );
  assert.equal(ids.size, 20_000, "collision in 20k IDs");
});

check("random segment uses the full alphabet without bias gaps", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i++) {
    for (const c of generateCertificateId("COURSE").split("-")[2]) seen.add(c);
  }
  // 32 possible characters; all must be reachable.
  assert.equal(seen.size, 32, `only ${seen.size}/32 characters ever appear`);
  for (const excluded of ["I", "L", "O", "U"]) {
    assert.ok(!seen.has(excluded), `excluded char ${excluded} appeared`);
  }
});

check("normalizing a valid ID is a no-op (round-trip)", () => {
  // The regression this guards: a blanket character replace turned the literal
  // "AL-" prefix into "A1-" and the "IN" type code into "1N", so every
  // correctly-typed ID failed lookup.
  for (const type of [
    "INTERNSHIP",
    "COURSE",
    "EXCELLENCE",
    "RECOGNITION",
    "LEADERSHIP",
    "CITATION",
  ] as const) {
    for (let i = 0; i < 500; i++) {
      const id = generateCertificateId(type);
      assert.equal(normalizeCertificateId(id), id, `round-trip broke for ${id}`);
    }
  }
});

check("normalizer repairs case, spacing and missing hyphens", () => {
  assert.equal(
    normalizeCertificateId(" al-in26-k7m2qx9p4t "),
    "AL-IN26-K7M2QX9P4T",
  );
  assert.equal(normalizeCertificateId("ALIN26K7M2QX9P4T"), "AL-IN26-K7M2QX9P4T");
  assert.equal(
    normalizeCertificateId("al in26 k7m2qx9p4t"),
    "AL-IN26-K7M2QX9P4T",
  );
});

check("normalizer repairs per-segment misreads", () => {
  // Digits misread as letters in the letters-only segments, and letters misread
  // as digits in the Base32 segment — each corrected in the right direction.
  assert.equal(normalizeCertificateId("A1-1N26-K7M2QX9P4T"), "AL-IN26-K7M2QX9P4T");
  assert.equal(normalizeCertificateId("AL-C026-K7M2QX9P4T"), "AL-CO26-K7M2QX9P4T");
  assert.equal(normalizeCertificateId("AL-C126-K7M2QX9P4T"), "AL-CI26-K7M2QX9P4T");
  assert.equal(normalizeCertificateId("AL-CO26-O0IL5678QV"), "AL-CO26-00115678QV");
});

check("normalizer does NOT corrupt valid Q, V or W", () => {
  assert.equal(
    normalizeCertificateId("AL-IN26-QVWQVWQVWQ"),
    "AL-IN26-QVWQVWQVWQ",
  );
});

check("garbage input fails format validation instead of throwing", () => {
  for (const bad of ["", "hello", "AL-XX99-TOOSHORT", "'; DROP TABLE certificates--"]) {
    assert.ok(!isValidCertificateIdFormat(normalizeCertificateId(bad)), bad);
  }
});

const base: CertificateHashInput = {
  certificateId: "AL-IN26-K7M2QX9P4T",
  verifiedFullLegalName: "Pratik Dinkar Nanavare",
  programName: "Web Development Internship",
  trackName: "Full Stack",
  cohortStartDate: new Date("2026-01-05T00:00:00Z"),
  cohortEndDate: new Date("2026-04-05T00:00:00Z"),
  issuedAtUtc: new Date("2026-04-10T09:30:00Z"),
};

check("hash is deterministic and version-tagged", () => {
  const a = computeCertificateHash(base);
  assert.equal(a, computeCertificateHash(base));
  assert.match(a, /^v1:[0-9a-f]{64}$/);
});

check("a genuine certificate verifies", () => {
  assert.ok(verifyCertificateHash(base, computeCertificateHash(base)));
});

check("tampering with ANY field is detected", () => {
  const good = computeCertificateHash(base);
  const mutations: Array<[string, CertificateHashInput]> = [
    ["name", { ...base, verifiedFullLegalName: "Someone Else" }],
    ["program", { ...base, programName: "AI/ML Internship" }],
    ["track", { ...base, trackName: "Backend" }],
    ["track cleared", { ...base, trackName: null }],
    ["cohort start", { ...base, cohortStartDate: new Date("2026-01-06T00:00:00Z") }],
    ["cohort end", { ...base, cohortEndDate: new Date("2026-05-05T00:00:00Z") }],
    ["issue time", { ...base, issuedAtUtc: new Date("2026-04-10T09:30:01Z") }],
    ["certificate id", { ...base, certificateId: "AL-IN26-AAAAAAAAAA" }],
  ];
  for (const [label, mutated] of mutations) {
    assert.ok(
      !verifyCertificateHash(mutated, good),
      `mutation of ${label} was NOT detected`,
    );
  }
});

check("field-shifting cannot forge a matching digest", () => {
  // Without a delimiter, "Web Development" + "Internship" and "Web" +
  // "DevelopmentInternship" would serialize identically. The unit separator
  // prevents that.
  const a = computeCertificateHash({ ...base, programName: "AB", trackName: "CD" });
  const b = computeCertificateHash({ ...base, programName: "ABCD", trackName: "" });
  assert.notEqual(a, b);
});

check("name whitespace is normalized, not significant", () => {
  assert.equal(
    computeCertificateHash(base),
    computeCertificateHash({
      ...base,
      verifiedFullLegalName: "  Pratik   Dinkar  Nanavare  ",
    }),
  );
});

check("a digest from a different secret is rejected", () => {
  const good = computeCertificateHash(base);
  const original = process.env.CERTIFICATE_HASH_SECRET;
  process.env.CERTIFICATE_HASH_SECRET = "an-attackers-guess";
  const forged = computeCertificateHash(base);
  process.env.CERTIFICATE_HASH_SECRET = original;

  assert.notEqual(forged, good);
  assert.ok(!verifyCertificateHash(base, forged), "forged digest verified");
});

check("malformed stored hashes are rejected, never thrown on", () => {
  for (const bad of ["", "v1:", "deadbeef", "v2:" + "a".repeat(64), "v1:zz"]) {
    assert.ok(!verifyCertificateHash(base, bad), `accepted malformed hash: ${bad}`);
  }
});

check("verify URL is the canonical origin", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://agnipankhlabs.com/";
  assert.equal(
    certificateVerifyUrl("AL-IN26-K7M2QX9P4T"),
    "https://agnipankhlabs.com/verify/AL-IN26-K7M2QX9P4T",
  );
});

console.log(`\n  ${passed} checks passed.\n`);
