import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProject, displayClient } from "@/content/projects";
import { profile, projectEmailHref } from "@/content/profile";
import { pngSize } from "@/content/imageSize";
import { Nav } from "@/components/ui/Nav";
import { Reveal } from "@/components/ui/Reveal";
import { Footer } from "@/components/sections/Footer";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [{ url: project.screenshots[0].src }],
    },
  };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const lead = project.screenshots[0];
  const leadSize = pngSize(lead.src);
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <Nav />
      {/* Dark, matching the showcase stage: the work itself always sits on
          dark, while the page-level gradient is reserved for the homepage. */}
      <main id="main" className="min-h-screen pt-28 pb-24 md:pt-36">
        <article className="container-page">
          <Link
            href="/#work"
            className="font-mono text-xs tracking-wider text-ink-faint uppercase transition-colors hover:text-accent"
          >
            ← All work
          </Link>

          <header className="mt-8 border-b border-line pb-12">
            <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
              {displayClient(project)}
              {project.year ? ` · ${project.year}` : ""}
            </p>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
              {project.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-dim">
              {project.tagline}
            </p>

            <dl className="mt-10 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-xs tracking-wider text-ink-faint uppercase">
                  Role
                </dt>
                <dd className="mt-2 text-sm">{project.role}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-wider text-ink-faint uppercase">
                  Stack
                </dt>
                <dd className="mt-2 text-sm text-ink-dim">
                  {project.stack.join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-wider text-ink-faint uppercase">
                  Live
                </dt>
                <dd className="mt-2 text-sm">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline decoration-accent-deep underline-offset-4"
                    >
                      Visit site
                    </a>
                  ) : (
                    <span className="text-ink-faint">Not public</span>
                  )}
                </dd>
              </div>
            </dl>
          </header>

          {/* lead screenshot, at its real aspect ratio: these are desktop
              captures with logos and buttons at the edges, so any crop cuts
              something off. Not wrapped in <Reveal>: it is the LCP image and
              must not wait on JS to become visible. */}
          <figure className="mt-12">
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <Image
                src={lead.src}
                alt={lead.alt}
                width={leadSize.width}
                height={leadSize.height}
                sizes="(min-width: 1408px) 1312px, 100vw"
                className="h-auto w-full"
                priority
              />
            </div>
            {lead.caption && (
              <figcaption className="mt-3 font-mono text-xs text-ink-faint">
                {lead.caption}
              </figcaption>
            )}
          </figure>

          {/* the writing — this is what gets him interviewed, not the images */}
          <div className="mt-20 grid gap-14 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-5">
              <h2 className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                The problem
              </h2>
              <p className="mt-5 leading-relaxed text-ink-dim">
                {project.problem}
              </p>
            </Reveal>

            <Reveal className="md:col-span-7" delay={80}>
              <h2 className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                What I built
              </h2>
              <ul className="mt-5 space-y-4">
                {project.contribution.map((item) => (
                  <li key={item} className="relative pl-6 leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="absolute top-2.5 left-0 h-1.5 w-1.5 rounded-full bg-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              {project.outcome && (
                <p className="mt-8 rounded-lg border border-accent-deep/40 bg-surface p-5 leading-relaxed">
                  <span className="font-mono text-xs tracking-wider text-accent uppercase">
                    Outcome
                  </span>
                  <br />
                  <span className="mt-2 inline-block text-ink-dim">
                    {project.outcome}
                  </span>
                </p>
              )}
            </Reveal>
          </div>

          {/* remaining screenshots */}
          {project.screenshots.length > 1 && (
            <div className="mt-20 space-y-12">
              {project.screenshots.slice(1).map((shot) => {
                const size = pngSize(shot.src);
                return (
                <Reveal key={shot.src} as="section">
                  <figure>
                    <div className="overflow-hidden rounded-lg border border-line bg-surface">
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        width={size.width}
                        height={size.height}
                        sizes="(min-width: 1408px) 1312px, 100vw"
                        className="h-auto w-full"
                        loading="lazy"
                      />
                    </div>
                    <figcaption className="mt-3 font-mono text-xs text-ink-faint">
                      {shot.caption ?? shot.alt}
                    </figcaption>
                  </figure>
                </Reveal>
                );
              })}
            </div>
          )}

          {project.confidential && (
            <p className="mt-16 border-l-2 border-line-bright pl-4 text-sm leading-relaxed text-ink-faint">
              Client name withheld and screenshots limited to public-facing
              screens. Happy to walk through the implementation in detail on a
              call.
            </p>
          )}

          {/* every case study ends on the ask */}
          <section
            aria-labelledby="cta-heading"
            className="mt-20 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#0c3a5e] p-8 md:p-12"
          >
            <h2
              id="cta-heading"
              className="text-2xl font-bold tracking-tight md:text-3xl"
            >
              Need something like this built?
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-white/80">
              Tell me about your project. {profile.responseTime} with
              questions or a rough plan and estimate.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={projectEmailHref}
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#1e1b4b] transition-transform hover:-translate-y-0.5"
              >
                Email me
              </a>
              <a
                href={profile.upwork}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Hire me on Upwork
              </a>
            </div>
          </section>

          {/* next project */}
          <Link
            href={`/work/${next.slug}`}
            className="group mt-24 flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-8"
          >
            <span>
              <span className="font-mono text-xs tracking-wider text-ink-faint uppercase">
                Next project
              </span>
              <span className="mt-2 block text-2xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                {next.title}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-accent transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}
