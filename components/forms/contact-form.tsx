"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact } from "@/app/actions/leads";
import type { FormState } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormBanner,
  Honeypot,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} aria-disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initial);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  // On success the form is replaced entirely — leaving a filled-in form beside a
  // success banner invites a duplicate submission.
  if (state.status === "success") {
    return <FormBanner status="success" message={state.message} />;
  }

  return (
    <form action={formAction} className="relative space-y-5" noValidate>
      <Honeypot />

      {state.status === "error" && !errors ? (
        <FormBanner status="error" message={state.message} />
      ) : null}

      <div>
        <Label htmlFor="name" required>
          Your name
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={errors?.name ? "name-error" : undefined}
          className="mt-1.5"
        />
        <FieldError id="name-error" errors={errors?.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" required>
            Email
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
          />
          <FieldError id="email-error" errors={errors?.email} />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            aria-invalid={Boolean(errors?.phone)}
            aria-describedby={errors?.phone ? "phone-error" : undefined}
            className="mt-1.5"
          />
          <FieldError id="phone-error" errors={errors?.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="message" required>
          How can we help?
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          aria-invalid={Boolean(errors?.message)}
          aria-describedby={errors?.message ? "message-error" : undefined}
          className="mt-1.5"
        />
        <FieldError id="message-error" errors={errors?.message} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors?.consent)}
            aria-describedby={errors?.consent ? "consent-error" : undefined}
            className="mt-1 size-4 shrink-0 rounded border-navy/30 accent-[var(--color-brand-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          />
          <Label htmlFor="consent" className="font-normal text-body">
            I agree to the{" "}
            <a
              href="/privacy"
              className="text-brand-ink underline underline-offset-2 hover:text-brand-hover"
            >
              Privacy Policy
            </a>{" "}
            and consent to being contacted about my enquiry.
          </Label>
        </div>
        <FieldError id="consent-error" errors={errors?.consent} />
      </div>

      <SubmitButton />
    </form>
  );
}
