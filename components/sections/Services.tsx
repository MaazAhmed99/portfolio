import Link from "next/link";
import { profile } from "@/content/profile";
import { services, workflow } from "@/content/services";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * What a client can hire for, placed right after the work so every offer has
 * just been backed by something they saw. Each card ends on proof, not a
 * promise.
 */
export function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Services"
          title="What I can build for you"
          note="Fixed-price projects or ongoing work. You deal with me directly, from the first call to the handover."
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.title} as="li" delay={i * 70}>
              <article className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-accent/40 md:p-8">
                <p className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white/80">
                  {service.body}
                </p>
                <p className="mt-6 border-t border-white/10 pt-4 text-sm text-white/60">
                  {service.proof}
                  {service.link && (
                    <>
                      {" "}
                      <Link
                        href={service.link.href}
                        aria-label={`See the case study: ${service.link.label}`}
                        className="whitespace-nowrap text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                      >
                        See the case study →
                      </Link>
                    </>
                  )}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-20">
          <h3 className="font-mono text-xs tracking-[0.22em] text-white/70 uppercase">
            How a project runs
          </h3>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, i) => (
              <li key={item.step} className="bg-base p-6">
                <p className="font-mono text-xs text-accent">
                  Step {i + 1}
                </p>
                <p className="mt-2 font-semibold">{item.step}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-white/60">
            {profile.hours} {profile.responseTime}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
