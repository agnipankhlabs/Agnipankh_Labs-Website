"use client";

import { useEffect, useRef } from "react";

/**
 * Adds IntersectionObserver-based scroll-reveal to the returned ref.
 * When the element enters the viewport, the "revealed" class is added.
 *
 * Compatible with the `.reveal` and `.reveal-scale` CSS classes in globals.css.
 * Respects prefers-reduced-motion by checking the media query — if the user
 * prefers reduced motion, the class is added immediately (no animation plays
 * since the CSS transitions are disabled via the @media block).
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If reduced motion is preferred, reveal immediately without observing
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
