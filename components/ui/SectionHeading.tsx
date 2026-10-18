import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  note?: string;
  /** "light" for sections sitting on the bright gradient. */
  tone?: "dark" | "light";
};

export function SectionHeading({ eyebrow, title, note, tone = "dark" }: Props) {
  const light = tone === "light";

  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span
          className={`h-px w-8 shrink-0 ${light ? "bg-white/70" : "bg-accent"}`}
          aria-hidden="true"
        />
        <p
          className={`font-mono text-xs tracking-[0.22em] uppercase ${
            light ? "text-white/85" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        className={`mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl ${
          light ? "text-white" : ""
        }`}
      >
        {title}
      </h2>
      {note && (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            light ? "text-white/85" : "text-ink-dim"
          }`}
        >
          {note}
        </p>
      )}
    </Reveal>
  );
}
