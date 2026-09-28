"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EventNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy/90 to-royal/90 p-8 sm:p-10 text-center text-white">
      <h3 className="font-heading text-2xl font-bold">Stay Updated on Events</h3>
      <p className="mt-2 text-white/80 max-w-xl mx-auto">
        Get notified about upcoming webinars, bootcamps, and workshops.
      </p>
      {subscribed ? (
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 text-sm font-medium text-white">
          <span>✓ Thank you for subscribing! We&apos;ll keep you posted.</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 max-w-md rounded-xl bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-2 focus:outline-brand-ink"
            aria-label="Email address"
          />
          <Button variant="secondary" type="submit" className="w-full sm:w-auto">
            Subscribe
          </Button>
        </form>
      )}
      <p className="mt-4 text-sm text-white/60">
        By subscribing, you agree to our{" "}
        <Link href="/privacy" className="underline hover:text-white">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
