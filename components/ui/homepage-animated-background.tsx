"use client";

import { useEffect, useRef, useState } from "react";

export function InteractiveHoverParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Mouse spotlight coordinates
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
        containerRef.current.style.setProperty("--spotlight-opacity", "1");
      }
    };

    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--spotlight-opacity", "0");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  // Full-page interactive constellation & particle hover animation
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

    // Node count scaled to screen size
    const count = Math.min(55, Math.floor((width * height) / 22000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.4 + 0.25,
      // Brand innovation orange and royal blue
      color:
        Math.random() > 0.45
          ? "235, 94, 0" // Agnipankh Orange
          : Math.random() > 0.4
          ? "37, 99, 235" // Royal Blue
          : "14, 165, 233", // Electric Cyan
      pulseSpeed: Math.random() * 0.025 + 0.015,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Interactive mouse trail sparks
    interface MouseSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }
    const mouseSparks: MouseSpark[] = [];

    let mouseX = -1000;
    let mouseY = -1000;
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    let isMouseMoving = false;
    let mouseTimeout: NodeJS.Timeout;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;

      // Spawn energetic sparks on mouse movement
      if (lastMouseX !== -1000) {
        const speed = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        if (speed > 4 && mouseSparks.length < 24) {
          mouseSparks.push({
            x: mouseX + (Math.random() - 0.5) * 10,
            y: mouseY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 0,
            maxLife: Math.random() * 25 + 15,
            color: Math.random() > 0.5 ? "235, 94, 0" : "37, 99, 235",
            size: Math.random() * 2 + 1,
          });
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;

      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
      }, 150);
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      lastMouseX = -1000;
      lastMouseY = -1000;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // Periodic shooting energy streak across the background
    interface ShootingStreak {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      life: number;
      maxLife: number;
    }
    const streaks: ShootingStreak[] = [];

    const spawnStreak = () => {
      if (streaks.length >= 2) return;
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.6),
        length: Math.random() * 90 + 60,
        speed: Math.random() * 7 + 5,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        alpha: 0.65,
        life: 0,
        maxLife: Math.random() * 45 + 35,
      });
    };

    let nextStreakTime = Date.now() + 3000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Periodic cosmic streak
      if (Date.now() > nextStreakTime) {
        spawnStreak();
        nextStreakTime = Date.now() + Math.random() * 5000 + 3500;
      }

      // Draw & update streaks
      for (let s = streaks.length - 1; s >= 0; s--) {
        const str = streaks[s];
        str.x += Math.cos(str.angle) * str.speed;
        str.y += Math.sin(str.angle) * str.speed;
        str.life++;

        const currentAlpha =
          str.life < 8
            ? (str.life / 8) * str.alpha
            : ((str.maxLife - str.life) / (str.maxLife - 8)) * str.alpha;

        if (str.life >= str.maxLife) {
          streaks.splice(s, 1);
          continue;
        }

        const tailX = str.x - Math.cos(str.angle) * str.length;
        const tailY = str.y - Math.sin(str.angle) * str.length;

        const grad = ctx.createLinearGradient(tailX, tailY, str.x, str.y);
        grad.addColorStop(0, "rgba(235, 94, 0, 0)");
        grad.addColorStop(0.7, `rgba(37, 99, 235, ${currentAlpha * 0.7})`);
        grad.addColorStop(1, `rgba(235, 94, 0, ${currentAlpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(str.x, str.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Draw & update mouse trail sparks
      for (let m = mouseSparks.length - 1; m >= 0; m--) {
        const spark = mouseSparks[m];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life++;

        const sparkAlpha = (1 - spark.life / spark.maxLife) * 0.75;
        if (spark.life >= spark.maxLife) {
          mouseSparks.splice(m, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${spark.color}, ${sparkAlpha})`;
        ctx.fill();
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

        // Interaction with mouse hover
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let dynamicAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.12;

        if (dist < 180) {
          const force = (180 - dist) / 180;
          // Gentle attraction/deflection to hover
          p.x += (dx / dist) * force * 0.8;
          p.y += (dy / dist) * force * 0.8;
          dynamicAlpha = Math.min(0.95, p.baseAlpha + force * 0.55);

          // Glowing connector line directly to cursor
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${p.color}, ${force * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 120) {
            const lineAlpha = (1 - d2 / 120) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(235, 94, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${dynamicAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.7)`;
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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(mouseTimeout);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
    >
      {/* Interactive cursor spotlight that only shows and tracks on hover */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: "var(--spotlight-opacity, 0.4)",
          background:
            "radial-gradient(circle 380px at var(--mouse-x, 50vw) var(--mouse-y, 40vh), rgba(255, 107, 0, 0.08), rgba(37, 99, 235, 0.05), transparent 70%)",
        }}
      />

      {/* Interactive constellation & particle canvas floating over content */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

export const HomePageAnimatedBackground = InteractiveHoverParticles;

