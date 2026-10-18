import { existsSync, statSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { profile, socials } from "@/content/profile";
import { ParticleField } from "@/components/hero/ParticleField";

// Server component, so this resolves at build time. The avatar is optional: if
// it has not been generated yet the hero renders without it, rather than
// shipping a broken <img>.
const AVATAR_PATH = path.join(process.cwd(), "public", "avatar.webp");
const hasAvatar = existsSync(AVATAR_PATH);

// Same idea for the CV: only link it once the PDF actually exists, so the
// link never 404s.
const hasCv = existsSync(path.join(process.cwd(), "public", profile.cvPath));

/**
 * Cache-buster keyed to the file's mtime.
 *
 * Regenerating the avatar keeps the same filename, so browsers and Next's
 * image optimiser both keep serving the previous version — which looks exactly
 * like "the new photo didn't apply". Appending the mtime makes the URL change
 * whenever the file does, so the swap is picked up without a hard refresh.
 */
const avatarSrc = hasAvatar
  ? `/avatar.webp?v=${Math.round(statSync(AVATAR_PATH).mtimeMs).toString(36)}`
  : "/avatar.webp";

/**
 * Server-rendered, no WebGL. This is the LCP element, so nothing here may wait
 * on JavaScript.
 *
 * The animated gradient is the deep end of the sky→indigo palette, so the
 * hero has colour and movement while white copy keeps 7:1+ contrast.
 */
export function Hero() {
  return (
    // min-h-screen so the hero always fills the first viewport on any device,
    // with the content vertically centred rather than pinned under the nav.
    // Background comes from <body>'s page-wide gradient.
    <section className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden pt-28 pb-24 md:pt-32 md:pb-28">
      {/* Slowly drifting gradient. Two layers at different tempos (28s / 41s)
          so they never resolve into a visible loop. Sits at -z-20, beneath the
          grid, particles and portrait. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      >
        <div className="hero-gradient-a" />
        <div className="hero-gradient-b" />
      </div>

      {/* light grid, drawn in white so it reads on the gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 40%, #000 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 40%, #000 30%, transparent 78%)",
        }}
      />

      {/* animated constellation layer */}
      <ParticleField />

      {/* soft highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 -z-10 h-[36rem] w-[36rem] rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
        }}
      />

      {/* The faded full-body portrait that used to sit here was removed: at low
          opacity it read as a smudge, and at high opacity it fought the copy.
          A sharp, small avatar carries the same "this is a real person" signal
          far better. */}

      {/* resolve into the dark stage below rather than cutting hard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-base"
      />

      <div className="container-page">
        {hasAvatar ? (
          <div className="mb-8 flex items-center gap-4">
            <div className="relative shrink-0">
              {/* soft halo so the circle separates from the moving gradient */}
              <span
                aria-hidden="true"
                className="absolute -inset-1.5 rounded-full bg-white/35 blur-lg"
              />
              <Image
                src={avatarSrc}
                alt={`${profile.name}, ${profile.title}`}
                width={512}
                height={512}
                priority
                sizes="176px"
                className="relative h-28 w-28 rounded-full object-cover shadow-2xl ring-2 ring-white/70 md:h-36 md:w-36 lg:h-44 lg:w-44"
              />
            </div>

            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-white/85 uppercase">
                {profile.location}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgb(52_211_153/0.2)]"
                />
                {profile.availability}
              </p>
            </div>
          </div>
        ) : (
          <p className="mb-5 font-mono text-xs tracking-[0.22em] text-white/80 uppercase">
            {profile.location}
          </p>
        )}

        <h1 className="max-w-4xl text-3xl leading-[1.02] font-bold tracking-tight text-balance text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {profile.name}
        </h1>

        <div className="mt-6 flex items-center gap-4">
          <span className="h-px w-10 shrink-0 bg-white/70" aria-hidden="true" />
          <p className="text-lg font-semibold text-white md:text-2xl">
            {profile.headline}
          </p>
        </div>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
          {profile.intro}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {profile.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm"
            >
              {tech}
            </li>
          ))}
        </ul>

        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {profile.stats.map((stat) => (
            // Value reads first visually; the label stays first in the DOM so
            // screen readers announce "label: value".
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs leading-snug text-white/70 md:text-sm">
                {stat.label}
              </dt>
              <dd className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="#contact"
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#1e1b4b] transition-transform hover:-translate-y-0.5"
          >
            Start a project
          </Link>
          <Link
            href="#work"
            className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            See my work
          </Link>
          {hasCv && (
            <a
              href={profile.cvPath}
              className="px-2 py-3 text-sm text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
            >
              Download CV
            </a>
          )}
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="font-mono text-sm text-white/75 underline decoration-white/40 decoration-1 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
