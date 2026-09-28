"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface InteractiveImageBackgroundProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  variant?: "hero" | "light-glass" | "dark-deep" | "subtle";
  enableParticles?: boolean;
  enableTilt?: boolean;
  enableSpotlight?: boolean;
  intensity?: number; // 1 to 10
  children?: React.ReactNode;
}

export function InteractiveImageBackground({
  src,
  alt,
  priority = false,
  className = "",
  variant = "hero",
  enableParticles = true,
  enableTilt = true,
  enableSpotlight = true,
  intensity = 5,
  children,
}: InteractiveImageBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth lerp state
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Mouse movement tracking
  useEffect(() => {
    if (reducedMotion || !enableTilt) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Normalized between -1 and 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      targetX.current = Math.max(-1, Math.min(1, x));
      targetY.current = Math.max(-1, Math.min(1, y));

      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      targetX.current = 0;
      targetY.current = 0;
      setIsHovering(false);
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Smooth animation loop
    const animate = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      const imgEl = container.querySelector<HTMLElement>(".interactive-bg-image");
      if (imgEl) {
        const moveScale = (intensity / 5) * 16; // Up to 16-25px shift
        const rotate = (intensity / 5) * 1.2; // Up to 1.5deg tilt
        imgEl.style.transform = `scale(1.08) translate3d(${-currentX.current * moveScale}px, ${-currentY.current * moveScale}px, 0) rotate3d(${currentY.current}, ${-currentX.current}, 0, ${rotate}deg)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion, enableTilt, intensity]);

  // Interactive Particle Constellation Canvas
  useEffect(() => {
    if (!enableParticles || reducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Particle pool
    const particleCount = Math.min(38, Math.floor((width * height) / 25000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.45 + 0.25,
      // alternating amber fire and cyan tech colors
      color: Math.random() > 0.4 ? "255, 120, 20" : "56, 189, 248",
    }));

    let mouseCanvasX = -1000;
    let mouseCanvasY = -1000;

    const trackMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseCanvasX = e.clientX - rect.left;
      mouseCanvasY = e.clientY - rect.top;
    };

    const clearMouse = () => {
      mouseCanvasX = -1000;
      mouseCanvasY = -1000;
    };

    container.addEventListener("mousemove", trackMouse, { passive: true });
    container.addEventListener("mouseleave", clearMouse, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce from walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction with mouse
        const dx = mouseCanvasX - p.x;
        const dy = mouseCanvasY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let alpha = p.baseAlpha;

        if (dist < 140) {
          // Gently push particle away or brighten
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
          alpha = Math.min(0.9, p.baseAlpha + force * 0.5);

          // Draw connector line to mouse
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseCanvasX, mouseCanvasY);
          ctx.strokeStyle = `rgba(${p.color}, ${force * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 90) {
            const lineAlpha = (1 - d2 / 90) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 150, 50, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", trackMouse);
      container.removeEventListener("mouseleave", clearMouse);
    };
  }, [enableParticles, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={
        enableSpotlight
          ? ({
              "--mouse-px": `${mousePos.x * 100}%`,
              "--mouse-py": `${mousePos.y * 100}%`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Background image container with 3D tilt */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="interactive-bg-image absolute -inset-6 transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: "scale(1.06)",
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            priority={priority}
            className="object-cover object-center"
          />
        </div>

        {/* Dynamic Interactive Spotlight that tracks cursor */}
        {enableSpotlight && (
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              isHovering ? "opacity-100" : "opacity-40"
            }`}
            style={{
              background:
                variant === "dark-deep"
                  ? `radial-gradient(circle 380px at var(--mouse-px, 50%) var(--mouse-py, 50%), rgba(255, 120, 0, 0.22), rgba(37, 99, 235, 0.12), transparent 70%)`
                  : `radial-gradient(circle 420px at var(--mouse-px, 50%) var(--mouse-py, 50%), rgba(255, 130, 0, 0.16), rgba(56, 189, 248, 0.08), transparent 70%)`,
            }}
          />
        )}

        {/* Variant specific overlays to guarantee text legibility & theme balance */}
        {variant === "hero" && (
          <>
            {/* Blurry white luminous overlay for crisp text */}
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[3px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/65 to-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-white/70 to-surface/90" />
            {/* Ambient orange glow in the top-center */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          </>
        )}

        {variant === "light-glass" && (
          <>
            <div className="absolute inset-0 bg-[#f8f9fc]/82 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fc]/95 via-[#f8f9fc]/70 to-[#f8f9fc]" />
            {/* Tech grid hint */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </>
        )}

        {variant === "dark-deep" && (
          <>
            <div className="absolute inset-0 bg-navy/88 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/15 via-transparent to-transparent" />
          </>
        )}

        {variant === "subtle" && (
          <>
            <div className="absolute inset-0 bg-white/88 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
          </>
        )}

        {/* Canvas for interactive particle constellations */}
        {enableParticles && !reducedMotion && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-70"
          />
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
