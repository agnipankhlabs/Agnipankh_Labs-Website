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

    const observeElements = (observer?: IntersectionObserver) => {
      const elements = document.querySelectorAll<HTMLElement>(
        ".reveal:not(.revealed), .reveal-scale:not(.revealed)"
      );

      elements.forEach((el) => {
        if (prefersReduced) {
          el.classList.add("revealed");
          return;
        }

        // Check if element is already within viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("revealed");
        } else if (observer) {
          observer.observe(el);
        } else {
          el.classList.add("revealed");
        }
      });
    };

    if (prefersReduced || !("IntersectionObserver" in window)) {
      observeElements();
      return;
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

    // Initial check & observe
    observeElements(observer);

    // Small delay backup check for slow-hydrating or image-rendering components
    const timer = setTimeout(() => observeElements(observer), 300);

    // Observe DOM mutations for async loaded data
    const mutationObserver = new MutationObserver(() => {
      observeElements(observer);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
