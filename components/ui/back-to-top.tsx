"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 400; // Visible after scrolling 400px

/**
 * Floating Back-to-Top button.
 * - Passive scroll listener with zero re-renders during continuous scrolling
 * - Accessible with screen-reader text, visible focus ring, and tabIndex control
 * - Respects prefers-reduced-motion
 * - Positioned at bottom: 18px / right: 18px (mobile) and bottom: 24px / right: 24px (desktop)
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Passive scroll listener: single integer comparison, zero-rerender bail-out
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > SCROLL_THRESHOLD;
      setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync state on route changes
  useEffect(() => {
    const shouldShow = window.scrollY > SCROLL_THRESHOLD;
    setIsVisible(shouldShow);
  }, [pathname]);

  const scrollToTop = useCallback(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        // Fixed positioning: 18px on mobile, 24px on sm/desktop
        "fixed bottom-[18px] right-[18px] sm:bottom-6 sm:right-6 z-30",
        // Dimensions & Shape: 44px min touch target on mobile, 48px on sm
        "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full",
        // Styling matching design system
        "bg-brand-ink text-white shadow-md ring-1 ring-white/20",
        // Hover & Active micro-interactions
        "hover:bg-brand-hover hover:scale-105 hover:shadow-xl active:scale-95",
        // Accessible focus state
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
        // Hardware accelerated transition
        "transition-all duration-200 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
