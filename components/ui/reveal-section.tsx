"use client";

import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  /** "fade-up" (default) slides up while fading in; "scale" scales from 96% */
  variant?: "fade-up" | "scale" | "fade";
  /** Extra IntersectionObserver options */
  rootMargin?: string;
  /** Pass-through to the wrapper div */
  as?: "div" | "section" | "article";
}

/**
 * Wrapper that reveals its children with a subtle entrance animation
 * when the element scrolls into view.
 *
 * Usage:
 *   <RevealSection>
 *     <p>This paragraph will fade in when scrolled to.</p>
 *   </RevealSection>
 */
export function RevealSection({
  children,
  className,
  variant = "fade-up",
  rootMargin,
  as: Tag = "div",
}: RevealSectionProps) {
  const ref = useReveal<HTMLElement>({
    rootMargin: rootMargin ?? "0px 0px -48px 0px",
  });

  const revealClass =
    variant === "scale"
      ? "reveal-scale"
      : variant === "fade"
      ? "reveal [&.revealed]:translate-y-0 [&.revealed]:opacity-100"
      : "reveal";

  return (
    <Tag ref={ref as unknown as React.RefObject<HTMLDivElement>} className={cn(revealClass, className)}>
      {children}
    </Tag>
  );
}
