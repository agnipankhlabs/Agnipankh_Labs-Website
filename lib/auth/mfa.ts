import crypto from "crypto";
import { ROLES } from "@/lib/auth/rbac";

export const MFA_REQUIRED_ROLES: string[] = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.FINANCE,
];

/**
 * Checks whether any of the assigned roles require mandatory MFA.
 * Mandated by Cybersecurity Framework AL-SEC-001.
 */
export function requiresMfa(roles: string[] = []): boolean {
  return roles.some((role) => MFA_REQUIRED_ROLES.includes(role));
}

/**
 * Generate a cryptographically secure 6-digit numerical code.
 */
export function generateMfaCode(): string {
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, "0");
}

/**
 * Generate a base32-encoded TOTP secret for authenticator apps (RFC 6238).
 */
export function generateTotpSecret(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += chars[bytes[i] % 32];
  }
  return secret;
}

/**
 * Generate a 6-digit TOTP code for a given secret at the current time step (30s window).
 */
export function getTotpCode(secret: string, timeStepWindow = 30): string {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / timeStepWindow);

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  // Compute HMAC-SHA1 per RFC 6238
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "utf-8"));
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verify a 6-digit TOTP code with clock drift tolerance (±1 step / 30s).
 */
export function verifyTotpCode(
  secret: string,
  token: string,
  timeStepWindow = 30,
  windowTolerance = 1
): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false;
  }

  const epoch = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(epoch / timeStepWindow);

  for (let i = -windowTolerance; i <= windowTolerance; i++) {
    const step = currentStep + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(step));

    const hmac = crypto.createHmac("sha1", Buffer.from(secret, "utf-8"));
    hmac.update(timeBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, "0");

    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(otp))) {
      return true;
    }
  }

  return false;
}
