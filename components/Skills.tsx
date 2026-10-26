"use client";

import clsx from "clsx";
import type { SkillsContent } from "@/lib/types";
import { isHighlighted, setHighlight, useWorld } from "@/lib/world/store";
import { AnchorBlock, StationTag, Transit } from "./world/ui";

export function Skills({ skills }: { skills: SkillsContent }) {
  const highlight = useWorld((s) => s.highlight);
  const total = skills.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative">
      <AnchorBlock anchor="skills" align="left" panelClassName="lg:max-w-[28rem] xl:max-w-[34rem]">
        <StationTag index="02" label="stack" extra={`${total} tools · ${skills.groups.length} orbits`} />
        <h2 id="skills-title" className="font-display text-3xl font-semibold text-cream sm:text-4xl">
          {skills.heading}
        </h2>
        <ul className="mt-6 space-y-2">
          {skills.groups.map((group, i) => {
            const active = isHighlighted(highlight, "skill", i);
            return (
              <li
                key={group.name}
                onMouseEnter={() => setHighlight("skill", i)}
                onMouseLeave={() => setHighlight("skill", null)}
                className={clsx(
                  "rounded-xl border px-4 py-3 transition-colors",
                  active ? "border-signal/50 bg-signal/[0.08]" : "border-cream/[0.08] bg-cream/[0.02]"
                )}
              >
                <p className="mb-2 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className={active ? "text-signal" : "text-cream/85"}>{group.name}</span>
                  <span className="text-mist">{String(group.items.length).padStart(2, "0")}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-cream/10 bg-night/50 px-2 py-0.5 text-xs text-cream/90"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </AnchorBlock>
      <Transit />
    </section>
  );
}
