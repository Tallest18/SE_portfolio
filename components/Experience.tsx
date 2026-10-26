"use client";

import clsx from "clsx";
import type {
  CertificationsContent,
  EducationContent,
  ExperienceContent,
  LeadershipContent
} from "@/lib/types";
import { isHighlighted, scrollToAnchor, setHighlight, useWorld } from "@/lib/world/store";
import { AnchorBlock, StationTag, Transit } from "./world/ui";

const pad = (n: number) => String(n).padStart(2, "0");

export function Experience({
  experience,
  certifications,
  leadership,
  education
}: {
  experience: ExperienceContent;
  certifications: CertificationsContent;
  leadership: LeadershipContent;
  education: EducationContent;
}) {
  const highlight = useWorld((s) => s.highlight);
  const certCount = certifications.items.length;
  const leadCount = leadership.items.length;
  // Same order as the vault tiles: certifications, then leadership, then education.
  const hover = (k: number) => ({
    onMouseEnter: () => setHighlight("credential", k),
    onMouseLeave: () => setHighlight("credential", null)
  });
  const lit = (k: number) => isHighlighted(highlight, "credential", k);

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative">
      <AnchorBlock anchor="experience" align="left" panelClassName="lg:max-w-[28rem] xl:max-w-[32rem]">
        <StationTag index="04" label="experience" extra="now → first" />
        <h2 id="experience-title" className="font-display text-3xl font-semibold text-cream sm:text-4xl">
          {experience.heading}
        </h2>
        <p className="mt-3 text-sm text-cream/70">
          The rail runs from today back to where it started. Each pylon is a role.
        </p>
        <ol className="mt-5 divide-y divide-cream/[0.07] border-y border-cream/[0.07]">
          {experience.items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToAnchor(`role-${i}`)}
                onMouseEnter={() => setHighlight("role", i)}
                onMouseLeave={() => setHighlight("role", null)}
                className="group grid w-full grid-cols-[auto_1fr] items-baseline gap-x-4 py-2.5 text-left sm:grid-cols-[auto_1fr_auto]"
              >
                <span className="font-mono text-[11px] text-copper-light">{pad(i + 1)}</span>
                <span className="text-sm text-cream/90 transition-colors group-hover:text-cream">
                  {item.company}
                  <span className="text-mist"> · {item.role}</span>
                </span>
                <span className="col-start-2 font-mono text-[10px] text-mist sm:col-start-auto">{item.period}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => scrollToAnchor("credentials")}
              className="group grid w-full grid-cols-[auto_1fr] items-baseline gap-x-4 py-2.5 text-left"
            >
              <span className="font-mono text-[11px] text-signal">++</span>
              <span className="text-sm text-cream/90 transition-colors group-hover:text-cream">
                {certifications.heading}, {leadership.heading.toLowerCase()} & {education.heading.toLowerCase()}
              </span>
            </button>
          </li>
        </ol>
      </AnchorBlock>

      {experience.items.map((item, i) => (
        <article
          key={item.id}
          aria-label={`${item.role} at ${item.company}`}
          onMouseEnter={() => setHighlight("role", i)}
          onMouseLeave={() => setHighlight("role", null)}
        >
          <AnchorBlock
            anchor={`role-${i}`}
            align={i % 2 === 0 ? "left" : "right"}
            panelClassName={clsx(
              "lg:max-w-[28rem] xl:max-w-[31rem] transition-[border-color,box-shadow] duration-300",
              isHighlighted(highlight, "role", i) && "glass-active"
            )}
          >
            <div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
              <span className="text-copper-light">
                {pad(i + 1)} / {pad(experience.items.length)}
              </span>
              <span className="text-mist">{item.period}</span>
              {item.current && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-copper-light">
                  <span className="h-1.5 w-1.5 rounded-full bg-copper-light" />
                  current
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl font-semibold text-cream sm:text-3xl">{item.role}</h3>
            <p className="mt-1.5 text-sm text-signal">
              {item.company} · {item.location}
            </p>
            <ul className="mt-5 space-y-2.5">
              {item.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-cream/85">
                  <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-cream/50" />
                  {point}
                </li>
              ))}
            </ul>
          </AnchorBlock>
        </article>
      ))}

      <AnchorBlock
        anchor="credentials"
        id="credentials"
        align="left"
        panelClassName="lg:max-w-[30rem] xl:max-w-[40rem]"
      >
        <StationTag index="04.5" label="credentials" />
        <h3 className="font-display text-2xl font-semibold text-cream sm:text-3xl">{certifications.heading}</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {certifications.items.map((cert, k) => (
            <li
              key={`${cert.name}-${k}`}
              {...hover(k)}
              className={clsx(
                "rounded-lg border px-3.5 py-2.5 transition-colors",
                lit(k) ? "border-signal/50 bg-signal/[0.08]" : "border-cream/[0.08] bg-cream/[0.02]"
              )}
            >
              <p className="text-sm leading-snug text-cream">{cert.name}</p>
              {(cert.issuer || cert.year) && (
                <p className="mt-1 font-mono text-[10px] text-mist">
                  {cert.issuer}
                  {cert.issuer && cert.year ? " · " : ""}
                  <span className={/progress/i.test(cert.year) ? "text-gold" : undefined}>{cert.year}</span>
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-5 border-t border-cream/10 pt-5 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-copper-light">{leadership.heading}</p>
            {leadership.items.map((item, i) => (
              <div
                key={item.role}
                {...hover(certCount + i)}
                className={clsx("rounded-lg p-1 transition-colors", lit(certCount + i) && "bg-cream/[0.05]")}
              >
                <p className="text-sm font-medium text-cream">{item.role}</p>
                <p className="mt-0.5 text-xs text-signal">{item.org}</p>
                <p className="mt-0.5 font-mono text-[10px] text-mist">{item.period}</p>
                <ul className="mt-2 space-y-1">
                  {item.points.map((p, idx) => (
                    <li key={idx} className="text-xs leading-relaxed text-cream/75">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{education.heading}</p>
            {education.items.map((item, i) => (
              <div
                key={item.degree}
                {...hover(certCount + leadCount + i)}
                className={clsx(
                  "rounded-lg p-1 transition-colors",
                  lit(certCount + leadCount + i) && "bg-cream/[0.05]"
                )}
              >
                <p className="text-sm font-medium text-cream">{item.degree}</p>
                <p className="mt-0.5 text-xs text-cream/75">{item.school}</p>
                <p className="mt-0.5 font-mono text-[10px] text-mist">{item.period}</p>
              </div>
            ))}
          </div>
        </div>
      </AnchorBlock>
      <Transit />
    </section>
  );
}
