"use client";

import clsx from "clsx";
import { ArrowUpRight, Github, Monitor, Smartphone } from "lucide-react";
import type { ProjectItem, ProjectsContent } from "@/lib/types";
import { isPhoneProject } from "@/lib/world/layout";
import { isHighlighted, scrollToAnchor, setHighlight, useWorld } from "@/lib/world/store";
import { AnchorBlock, Chip, StationTag, Transit } from "./world/ui";

function linkLabel(link: string) {
  if (/play\.google\.com/i.test(link)) return "View on Google Play";
  if (/apps\.apple\.com/i.test(link)) return "View on the App Store";
  if (/github\.com/i.test(link)) return "View on GitHub";
  return "Visit live site";
}

const pad = (n: number) => String(n).padStart(2, "0");

function ProjectPanel({ project, index, total }: { project: ProjectItem; index: number; total: number }) {
  const phone = isPhoneProject(project);
  const Device = phone ? Smartphone : Monitor;
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
        <span className="text-copper-light">
          {pad(index + 1)} / {pad(total)}
        </span>
        <Chip tone="signal">{project.tag}</Chip>
        <span className="ml-auto flex items-center gap-1.5 text-mist">
          <Device size={13} aria-hidden="true" />
          {phone ? "mobile" : "web"}
        </span>
      </div>
      <h3 className="font-display text-2xl font-semibold text-cream sm:text-3xl">{project.name}</h3>
      {project.role && (
        <p className="mt-1.5 text-sm text-signal">
          <span className="sr-only">My role: </span>
          {project.role}
        </p>
      )}
      <p className="mt-3 text-[15px] leading-relaxed text-cream/80">{project.description}</p>
      {project.highlights.length > 0 && (
        <ul className="mt-5 space-y-2">
          {project.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-cream/85">
              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-copper-light" />
              {h}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
      {(project.link || project.appStore) && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[project.link, project.appStore].filter(Boolean).map((href, i) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={clsx(
                "group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-cream transition-colors",
                i === 0 ? "bg-copper hover:bg-copper-light" : "border border-cream/25 hover:border-copper-light hover:text-copper-light"
              )}
            >
              {linkLabel(href!)}
              <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function Projects({ projects, github }: { projects: ProjectsContent; github: string }) {
  const highlight = useWorld((s) => s.highlight);
  const total = projects.items.length;

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative">
      <AnchorBlock anchor="projects" align="left" panelClassName="lg:max-w-[28rem] xl:max-w-[32rem]">
        <StationTag index="03" label="projects" extra={`${total} builds`} />
        <h2 id="projects-title" className="font-display text-3xl font-semibold text-cream sm:text-4xl">
          {projects.heading}
        </h2>
        <p className="mt-3 text-sm text-cream/70">
          Keep scrolling to walk the gallery, or jump straight to a build.
        </p>
        <ol className="mt-5 divide-y divide-cream/[0.07] border-y border-cream/[0.07]">
          {projects.items.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => scrollToAnchor(`project-${i}`)}
                onMouseEnter={() => setHighlight("project", i)}
                onMouseLeave={() => setHighlight("project", null)}
                className="group flex w-full items-center gap-4 py-2.5 text-left"
              >
                <span className="font-mono text-[11px] text-copper-light">{pad(i + 1)}</span>
                <span className="flex-1 text-sm text-cream/90 transition-colors group-hover:text-cream">{p.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">{p.tag}</span>
              </button>
            </li>
          ))}
        </ol>
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-mist transition-colors hover:text-cream"
          >
            <Github size={14} aria-hidden="true" />
            more on GitHub
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        )}
      </AnchorBlock>

      {projects.items.map((project, i) => (
        <article
          key={project.id}
          aria-label={project.name}
          onMouseEnter={() => setHighlight("project", i)}
          onMouseLeave={() => setHighlight("project", null)}
        >
          <AnchorBlock
            anchor={`project-${i}`}
            align={i % 2 === 0 ? "left" : "right"}
            panelClassName={clsx(
              "lg:max-w-[28rem] xl:max-w-[31rem] transition-[border-color,box-shadow] duration-300",
              isHighlighted(highlight, "project", i) && "glass-active"
            )}
          >
            <ProjectPanel project={project} index={i} total={total} />
          </AnchorBlock>
        </article>
      ))}
      <Transit />
    </section>
  );
}
