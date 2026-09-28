"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerForEventAction } from "@/app/actions/event-registration";

interface EventRegistrationFormProps {
  event: {
    id: string;
    slug: string;
    title: string;
  };
}

export function EventRegistrationForm({ event }: EventRegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setSubmitMessage(null);

    const formData = new FormData();
    formData.set("eventId", event.id);
    formData.set("name", name);
    formData.set("email", email);
    if (phone) formData.set("phone", phone);

    startTransition(async () => {
      const res = await registerForEventAction(null, formData);
      if (res.success) {
        setSubmitMessage({
          type: "success",
          text: res.message ?? "Registration successful!",
        });
        setName("");
        setEmail("");
        setPhone("");
      } else {
        if (res.fieldErrors) setFormErrors(res.fieldErrors);
        setSubmitMessage({
          type: "error",
          text: res.message ?? "Registration failed.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitMessage && (
        <div
          role="alert"
          className={`rounded-xl p-4 text-sm font-medium flex items-center gap-2 ${
            submitMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {submitMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span>{submitMessage.text}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs font-semibold text-navy">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
            formErrors.name
              ? "border-red-500 bg-red-50/20"
              : "border-navy/15 bg-white"
          }`}
        />
        {formErrors.name && (
          <p className="text-[11px] text-red-600">{formErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-navy"
        >
          Email Address <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
            formErrors.email
              ? "border-red-500 bg-red-50/20"
              : "border-navy/15 bg-white"
          }`}
        />
        {formErrors.email && (
          <p className="text-[11px] text-red-600">{formErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="phone"
          className="block text-xs font-semibold text-navy"
        >
          Phone Number (Indian mobile)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
            formErrors.phone
              ? "border-red-500 bg-red-50/20"
              : "border-navy/15 bg-white"
          }`}
        />
        {formErrors.phone && (
          <p className="text-[11px] text-red-600">{formErrors.phone[0]}</p>
        )}
        <p className="text-[11px] text-navy/50">
          Optional. Used for event reminders via SMS/WhatsApp.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full gap-2 py-3 text-sm font-semibold"
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                strokeOpacity="1"
                strokeLinecap="round"
              />
            </svg>
            Registering...
          </>
        ) : (
          <>
            <ArrowRight className="h-5 w-5" />
            Register Now
          </>
        )}
      </Button>

      <p className="text-center text-[11px] text-navy/50">
        By registering, you agree to our{" "}
        <Link href="/privacy" className="underline hover:text-brand-ink">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline hover:text-brand-ink">
          Terms of Service
        </Link>
        .
      </p>
    </form>
  );
}
