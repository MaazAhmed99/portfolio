"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useCapabilities";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

/**
 * Constellation particle field — 2D canvas, no library.
 *
 * Density scales with area rather than being a fixed count, so a phone doesn't
 * pay for a desktop's particle budget. The render loop stops entirely when the
 * hero scrolls out of view, and never starts under `prefers-reduced-motion`.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let running = true;

    // Pointer state, in canvas-local coordinates.
    const pointer = { x: 0, y: 0, active: false };
    const POINTER_RADIUS = 190;

    // Cap DPR — this is a decorative layer, not something to render at 3x.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Link distance shrinks on small screens so the mesh doesn't turn solid.
    const linkDist = () => (width < 700 ? 105 : 145);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~1 particle per 6800px², clamped. Dense enough to read as a network.
      const target = Math.round((width * height) / 6800);
      const count = Math.max(40, Math.min(220, target));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: Math.random() * 1.7 + 0.7,
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const max = linkDist();

      for (const p of particles) {
        // Drift toward the cursor when it is close, then ease back to the
        // ambient speed so the field doesn't accelerate without bound.
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const d = Math.hypot(dx, dy);

          if (d < POINTER_RADIUS && d > 1) {
            const pull = (1 - d / POINTER_RADIUS) * 0.045;
            p.vx += (dx / d) * pull;
            p.vy += (dy / d) * pull;
          }
        }

        // damp, then clamp — keeps the motion lively but bounded
        p.vx *= 0.985;
        p.vy *= 0.985;
        const speed = Math.hypot(p.vx, p.vy);
        const MAX = 1.5;
        if (speed > MAX) {
          p.vx = (p.vx / speed) * MAX;
          p.vy = (p.vy / speed) * MAX;
        } else if (speed < 0.08) {
          // re-seed drift so particles never stall completely
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;

        // wrap rather than bounce — bouncing creates visible edge clustering
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // links first, so dots sit on top
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > max) continue;

          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / max) * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // links from the cursor, drawn brighter so the interaction is legible
      if (pointer.active) {
        for (const p of particles) {
          const d = Math.hypot(pointer.x - p.x, pointer.y - p.y);
          if (d > POINTER_RADIUS) continue;
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / POINTER_RADIUS) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    build();
    draw();

    const onResize = () => {
      build();
    };
    window.addEventListener("resize", onResize, { passive: true });

    // The canvas is pointer-events:none so it never blocks the hero's links —
    // track on window and convert to canvas-local coordinates instead.
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x;
      pointer.y = y;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    // Stop entirely once the hero leaves the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          draw();
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
