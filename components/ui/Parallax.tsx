"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useCapabilities";

type Props = {
  children: React.ReactNode;
  /**
   * Drift in px across a full viewport of scroll. Positive = element lags the
   * scroll (moves down). Vary it per sibling to get the layered effect.
   */
  speed?: number;
  className?: string;
};

/**
 * Translates its child as it passes through the viewport.
 *
 * Only listens while the element is on screen, and reads are rAF-throttled so
 * the handler never runs more than once per frame. Disabled outright under
 * `prefers-reduced-motion` — parallax is one of the most common triggers for
 * motion sickness, so it degrades to a plain static block.
 */
export function Parallax({ children, speed = 40, className = "" }: Props) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const ref = useCallback((el: HTMLDivElement | null) => setNode(el), []);

  useEffect(() => {
    if (!node || reducedMotion) return;

    let frame = 0;
    let listening = false;

    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      // -1 when the element sits at the top of the viewport, +1 at the bottom
      const t = (centre - window.innerHeight / 2) / window.innerHeight;
      setOffset(t * speed);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          listening = true;
          window.addEventListener("scroll", onScroll, { passive: true });
          measure();
        } else if (!entry.isIntersecting && listening) {
          listening = false;
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "15% 0px 15% 0px" },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [node, speed, reducedMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        reducedMotion
          ? undefined
          : {
              transform: `translate3d(0, ${offset.toFixed(2)}px, 0)`,
              willChange: "transform",
            }
      }
    >
      {children}
    </div>
  );
}
