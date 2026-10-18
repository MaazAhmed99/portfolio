"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { projects, displayClient, type Project } from "@/content/projects";
import type { FitInfo } from "@/components/three/DeviceScene";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import {
  useDeviceTier,
  usePrefersReducedMotion,
} from "@/hooks/useCapabilities";

const loadDeviceScene = () => import("@/components/three/DeviceScene");
const DeviceScene = dynamic(loadDeviceScene, { ssr: false });

const shown: Project[] = projects.filter((p) => p.featured);

export function Showcase() {
  const { ref, progress, inView, near } = useScrollProgress<HTMLDivElement>();
  const tier = useDeviceTier();
  const reducedMotion = usePrefersReducedMotion();

  const useStatic = tier === "low" || tier === "pending" || reducedMotion;

  const [fit, setFit] = useState<FitInfo | null>(null);
  const handleFit = useCallback((info: FitInfo) => setFit(info), []);

  // Start fetching the three.js chunk on the visitor's first scroll or touch,
  // so it is usually ready by the time the showcase arrives. Not on a timer:
  // evaluating three.js is a ~350 ms task on a mid-range phone, and an idle
  // visitor reading the hero shouldn't pay for it. Textures still wait for
  // `near`: they are the bulk of the bytes.
  useEffect(() => {
    if (useStatic) return;
    const events = ["scroll", "pointerdown", "keydown"] as const;
    const start = () => {
      for (const e of events) window.removeEventListener(e, start);
      void loadDeviceScene();
    };
    for (const e of events) {
      window.addEventListener(e, start, { once: true, passive: true });
    }
    return () => {
      for (const e of events) window.removeEventListener(e, start);
    };
  }, [useStatic]);

  const count = shown.length;
  const index = Math.min(count - 1, Math.floor(progress * count * 0.9999));

  if (useStatic) {
    return (
      <>
        <StaticShowcase pending={tier === "pending" && !reducedMotion} />
        <ScrollDebug
          tier={tier}
          reducedMotion={reducedMotion}
          progress={0}
          index={0}
          inView={false}
          path="static"
        />
      </>
    );
  }

  return (
    <section
      id="work"
      aria-label="Project showcase"
      className="relative scroll-mt-16 border-y border-white/10 bg-base"
    >
      <ScrollDebug
        tier={tier}
        reducedMotion={reducedMotion}
        progress={progress}
        index={index}
        inView={inView}
        path="webgl"
        fit={fit}
      />

      <div ref={ref} style={{ height: `${(count + 1) * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Layered radial light behind the devices, sitting where the rig
              sits rather than dead centre (the lower band is under the copy
              scrim).

              `mix-blend-screen` is what makes this read as emitted light: the
              layers add to the dark stage instead of painting flat translucent
              discs over it, which is why the earlier version looked dim even at
              higher opacity. Three stops — wide indigo halo, sky-blue body,
              tight near-white core — give the falloff a real bloom. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[46%] left-1/2 h-[68rem] w-[68rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 mix-blend-screen blur-[170px]"
            style={{
              background: "radial-gradient(circle, #4f46e5 0%, transparent 66%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[43%] left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-75 mix-blend-screen blur-[110px]"
            style={{
              background: "radial-gradient(circle, #38bdf8 0%, transparent 68%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[42%] left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 mix-blend-screen blur-[80px]"
            style={{
              background: "radial-gradient(circle, #a5f3fc 0%, transparent 70%)",
            }}
          />

          {/* The canvas owns the FULL stage. Previously it shared a flex column
              with the copy and only got ~55% of the height, which capped how
              large the laptop could ever be — the copy is overlaid instead, and
              the rig's fit reserves the lower band for it. */}
          <div className="absolute inset-0">
            {near && (
            <Suspense fallback={null}>
              <DeviceScene
                slugs={shown.map((p) => p.slug)}
                index={index}
                progress={progress}
                active={inView}
                onFit={handleFit}
              />
            </Suspense>
            )}
          </div>

          {/* eyebrow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-[4.5rem] md:px-10 md:pt-20 2xl:px-16">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
              <h2 className="font-mono text-xs tracking-[0.22em] text-accent uppercase">
                Selected work
              </h2>
            </div>
          </div>

          {/* copy overlay, with a scrim so text stays legible over the render */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-base via-base/92 to-transparent px-5 pt-28 pb-5 md:px-10 md:pb-7 2xl:px-16">
            <div className="relative">
              {shown.map((project, i) => (
                <div
                  key={project.slug}
                  aria-hidden={i !== index}
                  className={`transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    i === index
                      ? "relative opacity-100"
                      : "pointer-events-none invisible absolute inset-0 opacity-0"
                  }`}
                >
                  <div className="grid gap-x-10 gap-y-2 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-6">
                      <p className="font-mono text-[11px] tracking-[0.18em] text-accent md:text-xs">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(count).padStart(2, "0")}
                        <span className="ml-3 text-white/50">
                          {displayClient(project)}
                        </span>
                      </p>
                      <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-balance text-white md:mt-2 md:text-4xl xl:text-5xl">
                        {project.title}
                      </h3>
                    </div>

                    <div className="md:col-span-6">
                      <p className="text-sm leading-relaxed text-white/85 md:text-base">
                        {project.tagline}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-4">
                        <ul className="flex flex-wrap gap-1.5 md:gap-2">
                          {project.stack.slice(0, 4).map((s) => (
                            <li
                              key={s}
                              className="rounded border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/75 md:py-1 md:text-[11px]"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href={`/work/${project.slug}`}
                          className="ml-auto inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                        >
                          Read the case study
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ul className="mt-4 flex gap-1.5 md:mt-5" aria-hidden="true">
              {shown.map((p, i) => (
                <li
                  key={p.slug}
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    i <= index ? "bg-accent" : "bg-white/20"
                  }`}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Development-only readout. Stripped from production by the NODE_ENV check. */
function ScrollDebug({
  tier,
  reducedMotion,
  progress,
  index,
  inView,
  path,
  fit,
}: {
  tier: string;
  reducedMotion: boolean;
  progress: number;
  index: number;
  inView: boolean;
  path: "webgl" | "static";
  fit?: FitInfo | null;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  const rows: [string, string][] = [
    ["path", path],
    ["tier", tier],
    ["inView", String(inView)],
    ["progress", progress.toFixed(3)],
    ["index", String(index)],
    ["fitScale", fit ? fit.scale.toFixed(3) : "-"],
    ["stage", fit ? `${fit.vw} x ${fit.vh}` : "-"],
  ];

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-50 rounded border border-white/20 bg-black/80 p-2.5 font-mono text-[10px] leading-relaxed text-white/70 backdrop-blur">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span className="text-white/40">{k}</span>
          <span className={v === "false" ? "text-white/40" : "text-accent"}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

/** No-WebGL path. Same projects, same copy, CSS device frames. */
function StaticShowcase({ pending }: { pending: boolean }) {
  return (
    <section
      id="work"
      aria-label="Project showcase"
      className="scroll-mt-16 border-y border-white/10 bg-base py-24 md:py-32"
      data-tier={pending ? "pending" : "low"}
    >
      <div className="container-page">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
          <h2 className="font-mono text-xs tracking-[0.22em] text-accent uppercase">
            Selected work
          </h2>
        </div>

        <div className="mt-14 space-y-20">
          {shown.map((project, i) => (
            <article key={project.slug} className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="rounded-t-xl border border-b-0 border-white/15 bg-white/5 p-2">
                  <div className="relative aspect-[2/1] overflow-hidden rounded-md bg-black">
                    <Image
                      src={project.screenshots[0].src}
                      alt={project.screenshots[0].alt}
                      fill
                      sizes="(min-width: 768px) 58vw, 100vw"
                      className="object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="mx-auto h-2 w-[112%] max-w-none -translate-x-[5%] rounded-b-xl border border-white/15 bg-white/5"
                />
              </div>

              <div className="md:col-span-5">
                <p className="font-mono text-xs tracking-[0.18em] text-accent">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(shown.length).padStart(2, "0")}
                  <span className="ml-3 text-white/50">
                    {displayClient(project)}
                  </span>
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-4 leading-relaxed text-white/85">
                  {project.tagline}
                </p>
                <Link
                  href={`/work/${project.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                >
                  Read the case study <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
