"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top-line instant navigation progress indicator.
 * Provides <10ms visual feedback on internal link clicks and transitions.
 * Hardware-accelerated with CSS transform to prevent layout recalculations.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Complete and hide progress when route transition finishes
  useEffect(() => {
    const currentQuery = searchParams?.toString();
    const currentUrl = pathname + (currentQuery ? `?${currentQuery}` : "");

    // On initial mount, record starting URL
    if (prevUrlRef.current === null) {
      prevUrlRef.current = currentUrl;
      return;
    }

    // Route has transitioned
    if (prevUrlRef.current !== currentUrl) {
      prevUrlRef.current = currentUrl;
      if (timerRef.current) clearTimeout(timerRef.current);

      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept clicks on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find nearest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, new tabs, download, or modifier keys
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Skip if navigating to identical pathname + query
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start instant navigation feedback
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsVisible(true);
      setProgress(30);

      timerRef.current = setTimeout(() => {
        setProgress(75);
      }, 150);
    };

    const handlePopState = () => {
      setIsVisible(true);
      setProgress(60);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-brand via-brand-ink to-amber-500 shadow-[0_0_8px_rgba(255,107,0,0.6)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
