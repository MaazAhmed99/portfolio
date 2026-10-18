"use client";

import { useEffect, useState } from "react";

/** Live-tracks the OS-level reduced-motion preference. */
export function usePrefersReducedMotion(): boolean {
  // Start false so SSR markup matches the first client render; the effect
  // corrects it immediately. CSS already handles the visual case on its own.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export type DeviceTier = "pending" | "low" | "high";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * Decides whether this device should get the WebGL scene at all.
 *
 * The point is NOT to ship a degraded 3D experience to weak hardware — it is to
 * ship a *different*, static experience, because a stuttering canvas reads far
 * worse to a viewer than a clean static one.
 *
 * Returns "pending" until measured, so nothing renders on the server.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("pending");

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;

    // Respect an explicit data-saving request.
    if (nav.connection?.saveData) {
      setTier("low");
      return;
    }

    // Very slow connections: a texture payload is the wrong call.
    const effective = nav.connection?.effectiveType;
    if (effective === "slow-2g" || effective === "2g") {
      setTier("low");
      return;
    }

    const cores = nav.hardwareConcurrency ?? 0;
    const memory = nav.deviceMemory ?? 0;

    // Report low only on evidence, not on absence of evidence: deviceMemory is
    // Chromium-only, so a missing value must not count against Safari/Firefox.
    if (cores > 0 && cores < 4) {
      setTier("low");
      return;
    }
    if (memory > 0 && memory < 4) {
      setTier("low");
      return;
    }

    // Finally, confirm a real WebGL context can actually be created.
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");

      if (!gl) {
        setTier("low");
        return;
      }

      // Release it immediately; we only needed to know it was possible.
      const lose = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_lose_context",
      );
      lose?.loseContext();
    } catch {
      setTier("low");
      return;
    }

    setTier("high");
  }, []);

  return tier;
}
