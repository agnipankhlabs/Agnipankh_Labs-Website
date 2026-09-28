import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { CertificateType } from "@/lib/generated/prisma/client";

/**
 * ============================================================================
 * CERTIFICATE IDENTITY & INTEGRITY — FROZEN
 * ============================================================================
 * Certificates are permanently retained (Cybersecurity Framework AL-SEC-001)
 * and printed on documents that leave our control. Once one is issued, none of
 * the below can change without invalidating it. Read this file before touching
 * anything in it.
 *
 * Three decisions are encoded here:
 *
 * 1. IDs are RANDOM, not sequential.
 *    Sequential IDs let anyone enumerate every credential ever issued, and leak
 *    exactly how many we have issued — which, pre-launch, is zero.
 *
 * 2. IDs use Crockford Base32, not hex or full alphanumerics.
 *    People read these off a printed certificate and type them into a box. The
 *    alphabet omits I, L, O and U, so the classic 0/O and 1/I/l transcription
 *    errors are impossible, and `normalizeCertificateId` maps the mistakes
 *    people still make back to the correct character.
 *
 * 3. The integrity digest is an HMAC, not a bare SHA-256.
 *    The build plan specified sha256(id + name + program + dates + issuedAt).
 *    Every one of those inputs is printed on the certificate itself, so a bare
 *    hash is publicly recomputable — anyone could mint a forged certificate
 *    with a perfectly valid-looking digest. Keying it with a server-side secret
 *    means only we can produce a digest that verifies. The algorithm is still
 *    SHA-256 as specified; it is the key that makes it evidence.
 */

// --- ID generation ---------------------------------------------------------

/** Crockford Base32: no I, L, O or U. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Two-letter prefix per type, so a support agent can triage from the ID alone. */
const TYPE_PREFIX: Record<CertificateType, string> = {
  INTERNSHIP: "IN",
  COURSE: "CO",
  EXCELLENCE: "EX",
  RECOGNITION: "RE",
  LEADERSHIP: "LE",
  CITATION: "CI",
};

const RANDOM_LENGTH = 10; // 32^10 ≈ 1.1e15 — collision-free at any plausible volume

/**
 * `AL-IN26-K7M2QX9P4T`
 *      │ │  └ 10 random Crockford Base32 chars
 *      │ └ two-digit issue year
 *      └ certificate type
 *
 * Uniqueness is enforced by the unique index on Certificate.certificateId, not
 * by trusting the RNG. Callers must retry on constraint violation.
 */
export function generateCertificateId(
  type: CertificateType,
  issuedAt: Date = new Date(),
): string {
  const year = String(issuedAt.getUTCFullYear()).slice(-2);

  // Rejection sampling keeps the distribution uniform. Taking `byte % 32` would
  // bias the first 8 letters of the alphabet, which is a real (if small) dent in
  // the entropy of an identifier we are relying on to be unguessable.
  const chars: string[] = [];
  while (chars.length < RANDOM_LENGTH) {
    for (const byte of randomBytes(RANDOM_LENGTH)) {
      if (byte >= 256 - (256 % ALPHABET.length)) continue;
      chars.push(ALPHABET[byte % ALPHABET.length]);
      if (chars.length === RANDOM_LENGTH) break;
    }
  }

  return `AL-${TYPE_PREFIX[type]}${year}-${chars.join("")}`;
}

const ID_PATTERN = /^AL-(IN|CO|EX|RE|LE|CI)\d{2}-[0-9A-HJKMNP-TV-Z]{10}$/;

/**
 * Repair what a human plausibly typed when reading an ID off a printed
 * certificate. The three segments have DIFFERENT alphabets, so substitution is
 * applied per segment — a blanket replace would turn the literal `AL-` prefix
 * into `A1-` and the `IN` type code into `1N`, breaking every valid ID.
 *
 *   AL          literal, letters only
 *   IN26        two type letters + two year digits
 *   K7M2QX9P4T  Crockford Base32 — no I, L, O or U
 *
 * Hyphens and spaces are optional in the input; the canonical form is rebuilt.
 * Q, V and W are never remapped — all three are valid Base32 characters here.
 */
export function normalizeCertificateId(input: string): string {
  const raw = input.toUpperCase().replace(/[^0-9A-Z]/g, "");

  // AL(2) + type(2) + year(2) + random(10)
  if (raw.length !== 16) return raw;

  const lettersOnly = (s: string) => s.replace(/0/g, "O").replace(/1/g, "I");
  const digitsOnly = (s: string) => s.replace(/O/g, "0").replace(/[IL]/g, "1");
  const base32 = (s: string) => s.replace(/O/g, "0").replace(/[IL]/g, "1");

  const prefix = lettersOnly(raw.slice(0, 2)); // "A1" -> "AI"... see below
  const type = lettersOnly(raw.slice(2, 4));
  const year = digitsOnly(raw.slice(4, 6));
  const random = base32(raw.slice(6));

  // `lettersOnly` maps 1 -> I, which is right for the type code (CI, LE) but
  // wrong for the fixed "AL" prefix, where the intended letter is L.
  const brand = prefix === "AI" ? "AL" : prefix;

  return `${brand}-${type}${year}-${random}`;
}

export function isValidCertificateIdFormat(input: string): boolean {
  return ID_PATTERN.test(input);
}

// --- Integrity digest ------------------------------------------------------

/**
 * Prefixed onto every digest. If the canonical input below ever must change,
 * bump this and keep the old branch — previously issued certificates must keep
 * verifying forever.
 */
const HASH_VERSION = "v1";

export interface CertificateHashInput {
  certificateId: string;
  verifiedFullLegalName: string;
  programName: string;
  trackName: string | null;
  cohortStartDate: Date | null;
  cohortEndDate: Date | null;
  issuedAtUtc: Date;
}

/**
 * Canonical serialization. Field order and separator are part of the frozen
 * contract; `` (ASCII unit separator) cannot occur in any input, so no
 * field value can impersonate a delimiter.
 */
function canonicalize(input: CertificateHashInput): string {
  const date = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
  return [
    HASH_VERSION,
    input.certificateId,
    input.verifiedFullLegalName.trim().replace(/\s+/g, " "),
    input.programName.trim(),
    input.trackName?.trim() ?? "",
    date(input.cohortStartDate),
    date(input.cohortEndDate),
    input.issuedAtUtc.toISOString(),
  ].join("");
}

function secret(): string {
  const value = process.env.CERTIFICATE_HASH_SECRET;
  if (!value) {
    throw new Error(
      "CERTIFICATE_HASH_SECRET is not set. Certificates cannot be issued or " +
        "verified without it. See .env.example — this value is frozen at first " +
        "issuance and rotating it invalidates every certificate already issued.",
    );
  }
  return value;
}

/** Returns `v1:<64 hex chars>`. Stored in Certificate.sha256Hash. */
export function computeCertificateHash(input: CertificateHashInput): string {
  const digest = createHmac("sha256", secret())
    .update(canonicalize(input), "utf8")
    .digest("hex");
  return `${HASH_VERSION}:${digest}`;
}

/**
 * Recompute from the stored record and compare against the stored digest.
 * A mismatch means a row was edited outside the issuance path — which is exactly
 * the tamper case the verify page exists to catch.
 *
 * Compared with `timingSafeEqual` so response time cannot be used to hunt for a
 * digest that passes.
 */
export function verifyCertificateHash(
  input: CertificateHashInput,
  storedHash: string,
): boolean {
  if (!storedHash.startsWith(`${HASH_VERSION}:`)) return false;

  const expected = Buffer.from(computeCertificateHash(input), "utf8");
  const actual = Buffer.from(storedHash, "utf8");
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

/**
 * The canonical public verify URL — this exact string is what the printed QR
 * code encodes, so it is permanent. NEXT_PUBLIC_SITE_URL must be the real
 * production origin before the first certificate is issued.
 */
export function certificateVerifyUrl(certificateId: string): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://agnipankhlabs.com"
  ).replace(/\/$/, "");
  return `${base}/verify/${certificateId}`;
}
