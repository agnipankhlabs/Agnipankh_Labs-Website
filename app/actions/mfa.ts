"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { verifyTotpCode, generateTotpSecret } from "@/lib/auth/mfa";
import { checkRateLimit } from "@/lib/rate-limit";

export interface MfaActionResult {
  success: boolean;
  message: string;
}

export async function verifyMfa(
  prevState: MfaActionResult | null,
  formData: FormData
): Promise<MfaActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Session expired. Please sign in again.",
    };
  }

  const code = (formData.get("code") as string)?.trim() ?? "";

  if (!code || !/^\d{6}$/.test(code)) {
    return {
      success: false,
      message: "Please enter a valid 6-digit numerical code.",
    };
  }

  // Rate limit: 5 attempts per 15 minutes
  const ip = "system";
  const rateLimit = await checkRateLimit("auth", `${ip}:mfa:${session.user.id}`);
  if (!rateLimit.success) {
    return {
      success: false,
      message: `Too many failed attempts. Please try again in ${rateLimit.retryAfter || 60} seconds.`,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, mfaSecret: true, mfaEnabled: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User account not found.",
      };
    }

    // If secret exists, verify TOTP
    if (user.mfaSecret) {
      const isValid = verifyTotpCode(user.mfaSecret, code);
      if (!isValid) {
        return {
          success: false,
          message: "Invalid verification code. Please check your authenticator app and try again.",
        };
      }
    }

    // Success: redirect to admin or dashboard
    redirect("/admin");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Let Next.js handle redirect
    }
    console.error("[mfa] Verification error:", error);
    return {
      success: false,
      message: "Unable to verify authentication code at this time.",
    };
  }
}

export async function generateNewMfaSecret(): Promise<{ secret: string; otpAuthUrl: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const secret = generateTotpSecret();
  const email = session.user.email ?? "admin@agnipankhlabs.com";
  const otpAuthUrl = `otpauth://totp/Agnipankh%20Labs:${encodeURIComponent(email)}?secret=${secret}&issuer=Agnipankh%20Labs`;

  return { secret, otpAuthUrl };
}
