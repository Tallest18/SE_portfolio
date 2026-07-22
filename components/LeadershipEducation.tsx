import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { LeadershipContent, EducationContent } from "@/lib/types";

export function LeadershipEducation({
  leadership,
  education
}: {
  leadership: LeadershipContent;
  education: EducationContent;
}) {
  return (
    <section id="leadership" className="py-20 sm:py-28 px-6 bg-ink-100/40 border-y border-ink-300">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        <div>
          <Reveal>
            <SectionLabel index="06" name="leadership.md" />
          </Reveal>
          <div className="space-y-6">
            {leadership.items.map((item, i) => (
              <Reveal key={item.role} delay={i * 0.05}>
                <div className="rounded-xl border border-ink-400 bg-ink-200/40 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                    <h3 className="font-display text-base font-semibold text-ink-950">{item.role}</h3>
                    <span className="font-mono text-xs text-ink-600">{item.period}</span>
                  </div>
                  <p className="text-sm text-teal mb-4">{item.org}</p>
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

        <div>
          <Reveal>
            <SectionLabel index="07" name="education.md" />
          </Reveal>
          <div className="space-y-6">
            {education.items.map((item, i) => (
              <Reveal key={item.degree} delay={i * 0.05}>
                <div className="rounded-xl border border-ink-400 bg-ink-200/40 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                    <h3 className="font-display text-base font-semibold text-ink-950">{item.degree}</h3>
                    <span className="font-mono text-xs text-ink-600">{item.period}</span>
                  </div>
                  <p className="text-sm text-ink-700">{item.school}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
