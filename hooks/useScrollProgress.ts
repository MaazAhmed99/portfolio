"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Progress of a tall element through the viewport, 0 → 1.
 *
 * 0 = the element's top has just reached the top of the viewport
 * 1 = the element's bottom has just reached the bottom of the viewport
 *
 * This is exactly the window during which an inner `sticky` child is pinned, so
 * the value maps onto the pinned phase.
 *
 * IMPORTANT — why this uses a callback ref and not `useRef`:
 * the consumer may render a different subtree on its first pass (e.g. a static
 * fallback while device capability is still being measured), so the target node
 * does not exist at mount. With `useRef`, the effect would run once against
 * `null`, bail out, and never re-run — leaving no scroll listener at all. State
 * holds the node instead, so attaching it re-runs the effect.
 *
 * Reads are rAF-throttled and passive, keeping scroll off the critical path.
 *
 * `near` latches true the first time the element enters the viewport, and
 * stays true. Heavy content (the 3D scene and its ~1 MB of textures) mounts on
 * it, so none of that competes with the hero on first load. No look-ahead
 * margin: the hero is exactly one viewport tall, so any margin would put the
 * element "near" at load and defeat the point.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [near, setNear] = useState(false);

  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (!node) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const raw = -rect.top / scrollable;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) measure();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(node);

    const nearIo = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearIo.disconnect();
        }
      },
      { rootMargin: "0px" },
    );
    nearIo.observe(node);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();

    return () => {
      io.disconnect();
      nearIo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [node]);

  return { ref, progress, inView, near };
}
