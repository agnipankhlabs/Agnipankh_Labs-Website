"use client";

import { useActionState } from "react";
import { ShieldCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { verifyMfa, type MfaActionResult } from "@/app/actions/mfa";
import { Button } from "@/components/ui/button";

export function MfaForm() {
  const [state, formAction, isPending] = useActionState<MfaActionResult | null, FormData>(
    verifyMfa,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-navy">
          6-Digit Security Code
        </label>
        <p className="mt-0.5 text-xs text-body">
          Enter the numerical code from your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password).
        </p>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          required
          autoFocus
          placeholder="123456"
          className="mt-3 block w-full tracking-widest text-center text-2xl font-mono font-bold rounded-xl border border-navy/20 bg-white px-3.5 py-3 text-navy shadow-xs focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isPending}
        className="w-full gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Verify & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="rounded-xl border border-navy/10 bg-muted/30 p-3.5 text-xs text-body">
        <p className="font-semibold text-navy">Cybersecurity Requirement AL-SEC-001</p>
        <p className="mt-0.5">
          Multi-factor authentication is strictly enforced for Finance, Quality, and Admin-tier roles.
        </p>
      </div>
    </form>
  );
}
