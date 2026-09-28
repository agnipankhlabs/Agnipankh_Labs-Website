"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function HomePageAnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse & Parallax tracking
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const scrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Global mousemove and scroll tracking for parallax
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetX.current = Math.max(-1, Math.min(1, x));
      targetY.current = Math.max(-1, Math.min(1, y));

      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Smooth animation loop
    const animate = () => {
      currentX.current += (targetX.current - currentX.current) * 0.05;
      currentY.current += (targetY.current - currentY.current) * 0.05;

      const imgEl = containerRef.current?.querySelector<HTMLElement>(".fullpage-bg-image");
      if (imgEl) {
        const moveX = currentX.current * 18; // 18px range
        const moveY = currentY.current * 12 + (scrollY.current * 0.03); // parallax on scroll
        imgEl.style.transform = `scale(1.08) translate3d(${-moveX}px, ${-moveY}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  // Full-page constellation & cosmic particle canvas
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Particle nodes for the constellation network
    const count = Math.min(65, Math.floor((width * height) / 18000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2.2 + 0.8,
      baseAlpha: Math.random() * 0.6 + 0.25,
      color:
        Math.random() > 0.45
          ? "255, 150, 40" // warm amber fire
          : Math.random() > 0.5
          ? "56, 189, 248" // electric cyan
          : "255, 255, 255", // star white
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Shooting star streaks
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      life: number;
      maxLife: number;
    }
    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (shootingStars.length >= 2) return;
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        length: Math.random() * 80 + 50,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 0.8,
        life: 0,
        maxLife: Math.random() * 50 + 40,
      });
    };

    let nextStarTime = Date.now() + 2500;
    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn shooting stars periodically
      if (Date.now() > nextStarTime) {
        spawnShootingStar();
        nextStarTime = Date.now() + Math.random() * 4500 + 2500;
      }

      // Draw & update shooting stars
      for (let s = shootingStars.length - 1; s >= 0; s--) {
        const star = shootingStars[s];
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.life++;

        const currentAlpha =
          star.life < 10
            ? (star.life / 10) * star.alpha
            : ((star.maxLife - star.life) / (star.maxLife - 10)) * star.alpha;

        if (star.life >= star.maxLife) {
          shootingStars.splice(s, 1);
          continue;
        }

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        grad.addColorStop(0, "rgba(255, 170, 50, 0)");
        grad.addColorStop(0.7, `rgba(56, 189, 248, ${currentAlpha * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${currentAlpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Draw & update constellation particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let dynamicAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.15;

        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= (dx / dist) * force * 1.2;
          p.y -= (dy / dist) * force * 1.2;
          dynamicAlpha = Math.min(1, dynamicAlpha + force * 0.5);

          // Connector line to cursor
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${p.color}, ${force * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 115) {
            const lineAlpha = (1 - d2 / 115) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 160, 60, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw node star
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${dynamicAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* High-res background image with smooth parallax */}
      <div
        className="fullpage-bg-image absolute -inset-8 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: "scale(1.08)",
          opacity: 0.94,
        }}
      >
        <Image
          src="/images/bg-wings-innovation.jpg"
          alt="Giving Wings to Innovation background"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Atmospheric veils: subtle depth without muddying the aerospace wing & constellations */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-navy/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

      {/* Interactive cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle 500px at var(--mouse-x, 50vw) var(--mouse-y, 40vh), rgba(255, 120, 0, 0.18), rgba(56, 189, 248, 0.12), transparent 70%)",
        }}
      />

      {/* Interactive constellation & particle canvas */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        />
      )}
    </div>
  );
}
