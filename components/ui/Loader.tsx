"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { usePrefersReducedMotion } from "@/hooks/useCapabilities";

const COLUMNS = 6;
/**
 * Minimum time on screen. Without a floor a fast load flashes the loader by
 * and it reads as a glitch. Kept short: this is a client's first look, and
 * every second of intro is a second they are not seeing the work.
 */
const MIN_VISIBLE_MS = 1200;
/** Never hold the page hostage if `load` somehow never fires. */
const MAX_VISIBLE_MS = 4000;
const SEEN_KEY = "intro-seen";

/**
 * Runs inline, before the loader markup paints: a returning visitor in the
 * same session gets a class on <html> that hides the loader via CSS. Doing
 * this in an effect instead painted the loader and then tore it down a frame
 * later, which showed as a flash.
 */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}"))document.documentElement.classList.add("${SEEN_KEY}")}catch(e){}`;

/**
 * Full-screen intro loader.
 *
 * Behaviour notes:
 *
 * - Server-rendered, so it covers the page from the very first paint rather
 *   than appearing after hydration (which would flash the content first).
 * - A <noscript> rule in the root layout hides it outright, so a JS-disabled
 *   visitor is never stuck behind a loader that can never dismiss itself.
 * - Home page only, and once per browser session: SEEN_SCRIPT hides it for
 *   repeat views before first paint, so there is no flash.
 * - Under `prefers-reduced-motion` it holds for 1s and skips the wipe.
 *
 * The progress figure eases toward 90% while the document loads and only
 * completes on the real `load` event. It's an easing curve rather than true
 * byte progress, which is standard — but it never claims 100% before the page
 * is actually ready.
 */
export function Loader() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains(SEEN_KEY)) {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked (private mode): the intro just plays every time.
    }

    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    let raf = 0;
    let exitTimer = 0;
    let finished = false;
    let eased = 0;

    const tick = () => {
      // Approach 90 asymptotically: fast at first, slowing as it climbs.
      eased += (90 - eased) * 0.055 + 0.35;
      setProgress(Math.min(90, eased));
      raf = requestAnimationFrame(tick);
    };

    const exit = () => {
      if (reducedMotion) {
        root.style.overflow = previousOverflow;
        setGone(true);
        return;
      }

      setExiting(true);
      // Matches the longest column transition plus its stagger.
      exitTimer = window.setTimeout(() => {
        root.style.overflow = previousOverflow;
        setGone(true);
      }, 1100);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);

      const elapsed = Date.now() - startedAt.current;
      // Reduced-motion still gets a hold, just a shorter one. Dismissing
      // instantly would flash the loader for a frame or two, which is more
      // jarring than a brief, still screen.
      const minVisible = reducedMotion ? 1000 : MIN_VISIBLE_MS;
      const wait = Math.max(0, minVisible - elapsed);

      // Snapping to 100% and then idling for the rest of the minimum duration
      // looks stalled. Instead, ramp whatever is left across the remaining
      // time so the dial reaches 100 exactly as the wipe begins.
      if (wait > 0) {
        const from = eased;
        const rampStart = performance.now();

        const ramp = () => {
          const t = Math.min(1, (performance.now() - rampStart) / wait);
          const easeOut = 1 - Math.pow(1 - t, 3);
          setProgress(from + (100 - from) * easeOut);

          if (t < 1) {
            raf = requestAnimationFrame(ramp);
          } else {
            exit();
          }
        };

        raf = requestAnimationFrame(ramp);
        return;
      }

      setProgress(100);
      exit();
    };

    raf = requestAnimationFrame(tick);

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }

    const bail = window.setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bail);
      window.clearTimeout(exitTimer);
      window.removeEventListener("load", finish);
      root.style.overflow = previousOverflow;
    };
  }, [reducedMotion]);

  if (gone) return null;

  const shown = Math.round(progress);
  const circumference = 2 * Math.PI * 46;

  return (
    <>
    <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />
    <div
      id="site-loader"
      role="progressbar"
      aria-label="Loading site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Wipe columns. Each slides up on exit with a stagger, so the reveal
          reads as a curtain rather than a single flat fade. */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div
            key={i}
            className="h-full flex-1 transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              /* Each column carries the FULL page gradient, scaled to the
                 viewport and offset by its own index, so the six of them read
                 as one continuous surface until they split apart on exit. */
              backgroundImage:
                "linear-gradient(135deg, #0b1b3f 0%, #1e1b4b 55%, #312e81 100%)",
              backgroundSize: `${COLUMNS * 100}% 100%`,
              backgroundPosition: `${(i / (COLUMNS - 1)) * 100}% 0`,
              transform: exiting ? "translateY(-101%)" : "translateY(0)",
              transitionDelay: `${exiting ? i * 55 : 0}ms`,
            }}
          />
        ))}
      </div>

      {/* glow behind the dial */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 mix-blend-screen blur-[120px] transition-opacity duration-500 ${
          exiting ? "opacity-0" : ""
        }`}
        style={{
          background: "radial-gradient(circle, #ffffff 0%, transparent 66%)",
        }}
      />

      <div
        className={`relative flex h-full flex-col items-center justify-center transition-all duration-500 ${
          exiting ? "-translate-y-4 opacity-0" : "opacity-100"
        }`}
      >
        {/* progress dial */}
        <div className="relative h-32 w-32 md:h-40 md:w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#loader-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 260ms linear" }}
            />
            <defs>
              <linearGradient id="loader-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a5f3fc" />
              </linearGradient>
            </defs>
          </svg>

          {/* counter-rotating tick ring for depth */}
          <div
            aria-hidden="true"
            className="loader-orbit absolute inset-2 rounded-full border border-dashed border-white/30"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-mono text-2xl font-semibold tabular-nums md:text-3xl"
              style={{ color: "#ffffff" }}
            >
              {shown}
              <span style={{ color: "rgba(255,255,255,0.6)" }}>%</span>
            </span>
          </div>
        </div>

        {/* name, letter by letter */}
        <div className="mt-9 flex overflow-hidden">
          {profile.name.split("").map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="loader-letter font-mono text-sm tracking-[0.34em] uppercase md:text-base"
              // Colour set inline, not by class: this sits on a bright gradient
              // and must not depend on an inherited value resolving as expected.
              style={{ animationDelay: `${i * 55}ms`, color: "#ffffff" }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </div>

        <p
          className="mt-3 font-mono text-[10px] tracking-[0.3em] uppercase md:text-xs"
          style={{ color: "rgba(255,255,255,0.78)" }}
        >
          {profile.title}
        </p>
      </div>
    </div>
    </>
  );
}
