import { skillGroups, profile } from "@/content/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Background and toolkit: the bio beside the grouped skill list. */
export function Skills() {
  return (
    <section
      id="about"
      className="relative isolate scroll-mt-24 overflow-hidden py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 78%)",
        }}
      />

      <div className="container-page">
        <SectionHeading eyebrow="About" title="The developer behind the work" />

        <div className="mt-12 grid gap-14 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <div className="space-y-5">
              {profile.bio.map((para) => (
                <p key={para} className="leading-relaxed text-white/85">
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal className="md:col-span-7" delay={80}>
            <dl className="divide-y divide-white/20 border-t border-b border-white/20">
              {skillGroups.map((group) => (
                <div
                  key={group.label}
                  className="grid gap-2 py-4 md:grid-cols-4 md:gap-4"
                >
                  <dt className="font-mono text-xs tracking-wider text-white uppercase md:col-span-1">
                    {group.label}
                  </dt>
                  <dd className="md:col-span-3">
                    <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-white/85 last:[&>span]:hidden"
                        >
                          {item}
                          <span aria-hidden="true" className="ml-2 text-white/30">
                            /
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
