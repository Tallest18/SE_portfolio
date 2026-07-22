import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { SkillsContent } from "@/lib/types";

export function Skills({ skills }: { skills: SkillsContent }) {
  return (
    <section id="skills" className="py-20 sm:py-28 px-6 bg-ink-100/40 border-y border-ink-300">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel index="02" name="stack.json" />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.groups.map((group, i) => (
            <Reveal key={group.name} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-ink-400 bg-ink-200/50 p-6 hover:border-copper/50 transition-colors">
                <p className="font-mono text-xs text-teal mb-4">{group.name}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-ink-500 bg-ink-300/50 px-2.5 py-1 text-xs text-ink-900"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
