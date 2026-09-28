"use server";

import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { toFieldErrors, type FormState } from "@/lib/validation/forms";
import { SITE } from "@/content/site";
import { processReferralCodeAction } from "./referral";

const policyVersion = () => SITE.entity.policiesEffectiveDate ?? "unversioned";

export async function registerStudent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const h = await headers();
  const ip = clientIp(h);

  const limit = await checkRateLimit("auth", ip);
  if (!limit.success) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    return {
      status: "error",
      message: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    college: formData.get("college") ?? "",
    degree: formData.get("degree") ?? "",
    graduationYear: formData.get("graduationYear") ?? "",
    referralCode: formData.get("referralCode") ?? "",
    consent: formData.get("consent") === "on",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    if (fieldErrors.website) {
      return {
        status: "success",
        message: "Account created successfully. You can now sign in.",
      };
    }
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const { name, email, phone, password, college, degree, graduationYear, referralCode } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        status: "error",
        message: "An account with this email address already exists. Please log in.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let newUserId: string;

    await prisma.$transaction(async (tx) => {
      const studentRole = await tx.role.upsert({
        where: { key: "student" },
        create: { key: "student", name: "Student", isStaff: false },
        update: {},
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          roles: {
            create: {
              roleId: studentRole.id,
            },
          },
          profile: {
            create: {
              fullName: name,
              phone: phone || null,
              college: college || null,
              degree: degree || null,
              graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
            },
          },
          consents: {
            create: {
              purpose: "PRIVACY_POLICY",
              granted: true,
              policyVersion: policyVersion(),
              ipAddress: ip,
            },
          },
        },
      });
      newUserId = user.id;
    });

    // Process referral code if provided
    if (referralCode && referralCode.trim()) {
      await processReferralCodeAction(referralCode.trim().toUpperCase(), newUserId!);
    }

    return {
      status: "success",
      message: "Account created successfully! You can now sign in.",
    };
  } catch (error) {
    console.error("[registerStudent] Error creating user:", error);
    return {
      status: "error",
      message: "An error occurred while creating your account. Please try again or contact support.",
    };
  }
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const h = await headers();
  const ip = clientIp(h);

  const limit = await checkRateLimit("auth", ip);
  if (!limit.success) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    return {
      status: "error",
      message: `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter your email and password.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { status: "success", message: "Signed in successfully." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            status: "error",
            message: "Invalid email or password. Please try again.",
          };
        default:
          return {
            status: "error",
            message: "Sign-in failed. Please verify your credentials.",
          };
      }
    }

    console.error("[loginAction] Sign-in error:", error);
    return {
      status: "error",
      message: "An unexpected error occurred during sign in. Please try again.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
