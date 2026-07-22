import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { ExperienceContent } from "@/lib/types";

export function Experience({ experience }: { experience: ExperienceContent }) {
  return (
    <section id="experience" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel index="03" name="experience.log" />
        </Reveal>

        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-ink-400" />
          <div className="space-y-10">
            {experience.items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06} className="relative">
                <span
                  className={`absolute -left-8 sm:-left-10 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                    item.current
                      ? "bg-copper border-copper shadow-[0_0_0_4px_rgba(193,68,14,0.18)]"
                      : "bg-ink-200 border-ink-500"
                  }`}
                />
                <div className="rounded-xl border border-ink-400 bg-ink-200/40 p-6 hover:border-ink-500 transition-colors">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-ink-950">
                      {item.role}
                    </h3>
                    <span className="font-mono text-xs text-ink-600">{item.period}</span>
                  </div>
                  <p className="text-sm text-teal mb-4">
                    {item.company} · {item.location}
                  </p>
                  <ul className="space-y-2">
                    {item.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-ink-800 leading-relaxed">
                        <span className="mt-2 h-1 w-1 rounded-full bg-ink-600 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
