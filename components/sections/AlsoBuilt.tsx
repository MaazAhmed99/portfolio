import Link from "next/link";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The smaller builds. Featured work lives in <Showcase /> — listing it twice
 * would just make the page longer without telling anyone anything new.
 */
export function AlsoBuilt() {
  const other = projects.filter((p) => !p.featured);
  if (other.length === 0) return null;

  return (
    <section id="more-work" className="scroll-mt-24 py-20 md:py-24">
      <div className="container-page">
        <Reveal>
          <h2 className="font-mono text-xs tracking-[0.22em] text-white/70 uppercase">
            Also built
          </h2>
          <ul className="mt-6 divide-y divide-white/20 border-t border-b border-white/20">
            {other.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 text-white transition-colors hover:text-accent"
                >
                  <span className="font-semibold">{project.title}</span>
                  <span className="font-mono text-xs text-white/60">
                    {project.stack.slice(0, 3).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
