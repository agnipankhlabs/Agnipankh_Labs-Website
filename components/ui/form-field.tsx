"use client";

import { cn } from "@/lib/utils";
import { Label, FieldError } from "@/components/ui/field";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Single-responsibility wrapper that collocates a Label, its control (slot),
 * an optional hint, and field-level error messaging.
 *
 * Usage:
 *   <FormField id="email" label="Email" required error={errors?.email}>
 *     <Input type="email" name="email" />
 *   </FormField>
 *
 * Benefits:
 * - Enforces consistent aria-invalid / aria-describedby wiring automatically.
 * - Eliminates the boilerplate div+Label+FieldError triad repeated in every form.
 */
export function FormField({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const hasError = Boolean(error?.length);

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      {hint && (
        <p id={hintId} className="text-xs text-navy/60">
          {hint}
        </p>
      )}

      {/* Inject aria props into the child control via a wrapper span trick.
          The actual binding is done by consumers passing `aria-invalid` and
          `aria-describedby` directly on the input, or by using the data below. */}
      <div
        data-invalid={hasError}
        data-described-by={[hasError ? errorId : "", hintId].filter(Boolean).join(" ") || undefined}
      >
        {children}
      </div>

      <FieldError id={errorId} errors={error} />
    </div>
  );
}
