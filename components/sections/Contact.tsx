import { profile, projectEmailHref, socials } from "@/content/profile";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The page's one call to action, set in a lit panel so it reads as the
 * destination of every "Start a project" link above it.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-24 overflow-hidden py-24 md:py-32"
    >
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#0c3a5e] p-8 md:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-[120px]"
              style={{
                background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-4">
                <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
                <p className="font-mono text-xs tracking-[0.22em] text-accent uppercase">
                  Contact
                </p>
              </div>

              <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Have a project in mind?
              </h2>

              <p className="mt-5 max-w-xl leading-relaxed text-white/85">
                Tell me what you are building and when you need it. {profile.responseTime}{" "}
                with questions or a rough plan and estimate.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={projectEmailHref}
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#1e1b4b] transition-transform hover:-translate-y-0.5"
                >
                  Email me
                </a>
                <a
                  href={profile.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Message on WhatsApp
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

              <a
                href={projectEmailHref}
                className="mt-9 inline-block font-mono text-lg break-all text-white underline decoration-white/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-white md:text-2xl"
              >
                {profile.email}
              </a>

              <dl className="mt-12 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-3">
                <div>
                  <dt className="font-mono text-xs tracking-wider text-white/60 uppercase">
                    Working hours
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-white/85">
                    {profile.hours}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs tracking-wider text-white/60 uppercase">
                    WhatsApp
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={profile.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white transition-opacity hover:opacity-75"
                    >
                      {profile.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs tracking-wider text-white/60 uppercase">
                    Elsewhere
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {socials
                      .filter((s) => !s.href.startsWith("mailto:"))
                      .map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white transition-opacity hover:opacity-75"
                        >
                          {s.label}
                        </a>
                      ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
