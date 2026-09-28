"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitPartnership } from "@/app/actions/leads";
import type { FormState } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormBanner,
  Honeypot,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} aria-disabled={pending}>
      {pending ? "Submitting enquiry…" : "Submit partnership enquiry"}
    </Button>
  );
}

export function PartnershipForm() {
  const [state, formAction] = useActionState(submitPartnership, initial);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return <FormBanner status="success" message={state.message} />;
  }

  return (
    <form action={formAction} className="relative space-y-5" noValidate>
      <Honeypot />

      {state.status === "error" && !errors ? (
        <FormBanner status="error" message={state.message} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            Contact person name
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

        <div>
          <Label htmlFor="email" required>
            Official email
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone number</Label>
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

        <div>
          <Label htmlFor="partnerType" required>
            Partnership type
          </Label>
          <Select
            id="partnerType"
            name="partnerType"
            required
            defaultValue="COLLEGE"
            aria-invalid={Boolean(errors?.partnerType)}
            aria-describedby={errors?.partnerType ? "partnerType-error" : undefined}
            className="mt-1.5"
          >
            <option value="COLLEGE">College / University Institution</option>
            <option value="CORPORATE">Corporate / Hiring Employer</option>
            <option value="CSR">CSR Initiative / Foundation</option>
            <option value="SPONSOR">Event / Program Sponsor</option>
          </Select>
          <FieldError id="partnerType-error" errors={errors?.partnerType} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="organizationName" required>
            Organisation / Institution name
          </Label>
          <Input
            id="organizationName"
            name="organizationName"
            required
            aria-invalid={Boolean(errors?.organizationName)}
            aria-describedby={
              errors?.organizationName ? "organizationName-error" : undefined
            }
            className="mt-1.5"
          />
          <FieldError
            id="organizationName-error"
            errors={errors?.organizationName}
          />
        </div>

        <div>
          <Label htmlFor="city">City / Region</Label>
          <Input
            id="city"
            name="city"
            aria-invalid={Boolean(errors?.city)}
            aria-describedby={errors?.city ? "city-error" : undefined}
            className="mt-1.5"
          />
          <FieldError id="city-error" errors={errors?.city} />
        </div>
      </div>

      <div>
        <Label htmlFor="designation">Your designation / role</Label>
        <Input
          id="designation"
          name="designation"
          placeholder="e.g. Dean of Academics, TPO, HR Lead, CSR Director"
          aria-invalid={Boolean(errors?.designation)}
          aria-describedby={errors?.designation ? "designation-error" : undefined}
          className="mt-1.5"
        />
        <FieldError id="designation-error" errors={errors?.designation} />
      </div>

      <div>
        <Label htmlFor="message" required>
          Partnership objectives & scope
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Please describe how you'd like to collaborate with Agnipankh Labs (cohort size, target domains, timeline, etc.)"
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
            and consent to Agnipankh Labs contacting me regarding institutional collaboration.
          </Label>
        </div>
        <FieldError id="consent-error" errors={errors?.consent} />
      </div>

      <SubmitButton />
    </form>
  );
}
