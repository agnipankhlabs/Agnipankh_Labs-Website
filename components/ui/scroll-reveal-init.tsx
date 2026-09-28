"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Initialises scroll-reveal for all `.reveal` and `.reveal-scale` elements
 * across route transitions and dynamically rendered content.
 */
export function ScrollRevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId: number | null = null;
    const observeElements = (observer?: IntersectionObserver) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const elements = document.querySelectorAll<HTMLElement>(
          ".reveal:not(.revealed), .reveal-scale:not(.revealed)"
        );
        if (!elements.length) return;

        const vh = window.innerHeight;
        elements.forEach((el) => {
          if (prefersReduced) {
            el.classList.add("revealed");
            return;
          }

          const rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add("revealed");
          } else if (observer) {
            observer.observe(el);
          } else {
            el.classList.add("revealed");
          }
        });
      });
    };

    if (prefersReduced || !("IntersectionObserver" in window)) {
      observeElements();
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    // Initial check & observe immediately
    observeElements(observer);

    // Debounced mutation observer to catch async-rendered elements without spamming
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        observeElements(observer);
      }, 100);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
