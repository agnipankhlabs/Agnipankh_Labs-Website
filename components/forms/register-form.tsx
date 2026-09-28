"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerStudent } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormBanner,
  Honeypot,
  Input,
  Label,
} from "@/components/ui/field";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? "Creating account…" : "Create Student Account"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerStudent, initial);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <FormBanner status="success" message={state.message} />
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-4" noValidate>
      <Honeypot />

      {state.status === "error" && !errors ? (
        <FormBanner status="error" message={state.message} />
      ) : null}

      <div>
        <Label htmlFor="name" required>
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={errors?.name ? "name-error" : undefined}
          className="mt-1"
          placeholder="e.g. Rahul Sharma"
        />
        <FieldError id="name-error" errors={errors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? "email-error" : undefined}
            className="mt-1"
            placeholder="name@example.com"
          />
          <FieldError id="email-error" errors={errors?.email} />
        </div>

        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            aria-invalid={Boolean(errors?.phone)}
            aria-describedby={errors?.phone ? "phone-error" : undefined}
            className="mt-1"
          />
          <FieldError id="phone-error" errors={errors?.phone} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(errors?.password)}
            aria-describedby={errors?.password ? "password-error" : undefined}
            className="mt-1"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
          <FieldError id="password-error" errors={errors?.password} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(errors?.confirmPassword)}
            aria-describedby={errors?.confirmPassword ? "confirmPassword-error" : undefined}
            className="mt-1"
          />
          <FieldError id="confirmPassword-error" errors={errors?.confirmPassword} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="college">College / University</Label>
          <Input
            id="college"
            name="college"
            placeholder="e.g. Pune Institute of Computer Technology"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="graduationYear">Graduation year</Label>
          <Input
            id="graduationYear"
            name="graduationYear"
            placeholder="e.g. 2026"
            className="mt-1"
          />
          <FieldError id="graduationYear-error" errors={errors?.graduationYear} />
        </div>
      </div>

      <div>
        <Label htmlFor="referralCode">Referral code (optional)</Label>
        <Input
          id="referralCode"
          name="referralCode"
          placeholder="e.g. ABC123XY"
          className="mt-1"
          aria-invalid={Boolean(errors?.referralCode)}
          aria-describedby={errors?.referralCode ? "referralCode-error" : undefined}
        />
        <FieldError id="referralCode-error" errors={errors?.referralCode} />
      </div>

      <div>
        <div className="flex items-start gap-3 pt-1">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors?.consent)}
            aria-describedby={errors?.consent ? "consent-error" : undefined}
            className="mt-1 size-4 shrink-0 rounded border-navy/30 accent-[var(--color-brand-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          />
          <Label htmlFor="consent" className="font-normal text-xs leading-relaxed text-body">
            I agree to the{" "}
            <Link href="/terms" className="text-brand-ink underline hover:text-brand-hover">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-ink underline hover:text-brand-hover">
              Privacy Policy
            </Link>
            , and consent to student account creation.
          </Label>
        </div>
        <FieldError id="consent-error" errors={errors?.consent} />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
