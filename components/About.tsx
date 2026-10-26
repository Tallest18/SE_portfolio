"use client";

import clsx from "clsx";
import type { AboutContent } from "@/lib/types";
import { isHighlighted, setHighlight, useWorld } from "@/lib/world/store";
import { AnchorBlock, StationTag, Transit } from "./world/ui";

export function About({ about }: { about: AboutContent }) {
  const highlight = useWorld((s) => s.highlight);

  return (
    <section id="about" aria-labelledby="about-title" className="relative">
      <AnchorBlock anchor="about" align="right" panelClassName="lg:max-w-[28rem] xl:max-w-[36rem]">
        <StationTag index="01" label="about" />
        <h2 id="about-title" className="font-display text-3xl font-semibold text-cream sm:text-4xl">
          {about.heading}
        </h2>
        <div className="mt-5 space-y-4">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-cream/80 sm:text-base">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-7 border-t border-cream/10 pt-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">focus areas</p>
          <ul className="space-y-1">
            {about.focusAreas.map((item, i) => {
              const active = isHighlighted(highlight, "focus", i);
              return (
                <li
                  key={item}
                  onMouseEnter={() => setHighlight("focus", i)}
                  onMouseLeave={() => setHighlight("focus", null)}
                  className={clsx(
                    "flex cursor-default items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    active ? "bg-cream/[0.07] text-cream" : "text-cream/85"
                  )}
                >
                  <span className="w-5 font-mono text-[11px] text-copper-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className={clsx("h-px transition-all", active ? "w-6 bg-copper-light" : "w-3 bg-cream/30")}
                  />
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </AnchorBlock>
      <Transit />
    </section>
  );
}
