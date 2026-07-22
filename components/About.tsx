import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { AboutContent } from "@/lib/types";

export function About({ about }: { about: AboutContent }) {
  return (
    <section id="about" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel index="01" name="about.tsx" />
        </Reveal>
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <Reveal delay={0.05}>
            <div className="space-y-5">
              {about.paragraphs.map((p, i) => (
                <p key={i} className="text-ink-800 leading-relaxed text-base sm:text-lg">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-xl border border-ink-400 bg-ink-200/50 p-6">
              <p className="font-mono text-xs text-ink-600 mb-4">focus areas</p>
              <ul className="space-y-3">
                {about.focusAreas.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-900">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-copper shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
