import { experience } from "@/content/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Parallax";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Experience() {
  return (
    <section
      id="experience"
      className="scroll-mt-24 border-t border-white/15 py-24 md:py-32"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Experience"
          title="Six years, one direction"
          note="Karachi-based throughout, moving from agency delivery into owning frontend architecture."
        />

        <ol className="mt-14 space-y-0">
          {experience.map((job, i) => (
            <Reveal
              key={`${job.company}-${job.period}`}
              as="li"
              delay={i * 90}
              className={i % 2 === 0 ? "from-left" : "from-right"}
            >
              {/* Alternating drift, decreasing with depth down the timeline —
                  the entries separate from each other as you scroll rather
                  than moving as one block. */}
              <Parallax speed={i % 2 === 0 ? 34 - i * 5 : -(28 - i * 4)}>
                <div className="relative grid gap-4 border-l border-white/25 py-8 pl-6 md:grid-cols-12 md:gap-8 md:pl-10">
                {/* node on the timeline */}
                <span
                  aria-hidden="true"
                  className={`absolute top-10 -left-[4.5px] h-2 w-2 rounded-full ${
                    i === 0 ? "bg-accent" : "bg-white/40"
                  }`}
                />

                <div className="md:col-span-4">
                  <p className="font-mono text-xs tracking-wider text-white">
                    {job.period}
                  </p>
                  <p className="mt-2 font-semibold text-white">{job.company}</p>
                  {"note" in job && job.note && (
                    <p className="mt-2 inline-block rounded border border-white/25 bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white/80">
                      {job.note}
                    </p>
                  )}
                </div>

                <div className="md:col-span-8">
                  <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                    {job.role}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {job.points.map((point) => (
                      <li
                        key={point}
                        className="relative pl-5 leading-relaxed text-white/85"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute top-2.5 left-0 h-1 w-1 rounded-full bg-white/70"
                        />
                        {point}
                      </li>
                    ))}
                    </ul>
                  </div>
                </div>
              </Parallax>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
