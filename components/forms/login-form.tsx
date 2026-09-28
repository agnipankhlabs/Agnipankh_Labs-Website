"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormBanner,
  Input,
  Label,
} from "@/components/ui/field";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? "Signing in…" : "Sign In"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && !errors ? (
        <FormBanner status="error" message={state.message} />
      ) : null}

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
          className="mt-1.5"
          placeholder="name@example.com"
        />
        <FieldError id="email-error" errors={errors?.email} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>
            Password
          </Label>
          <Link
            href="/contact"
            className="text-xs font-medium text-brand-ink hover:text-brand-hover hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(errors?.password)}
          aria-describedby={errors?.password ? "password-error" : undefined}
          className="mt-1.5"
          placeholder="••••••••"
        />
        <FieldError id="password-error" errors={errors?.password} />
      </div>

      <SubmitButton />
    </form>
  );
}
