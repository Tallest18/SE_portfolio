"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { ProjectsContent } from "@/lib/types";

export function Projects({ projects }: { projects: ProjectsContent }) {
  return (
    <section id="projects" className="py-20 sm:py-28 px-6 bg-ink-100/40 border-y border-ink-300">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel index="04" name="projects/" />
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.items.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group h-full rounded-xl border border-ink-400 bg-ink-200/50 p-6 hover:border-copper/50 hover:shadow-[0_0_0_1px_rgba(193,68,14,0.18)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="font-mono text-[11px] text-teal border border-teal/30 rounded px-2 py-0.5">
                    {project.tag}
                  </span>
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-600 group-hover:text-copper transition-colors"
                      aria-label={`Open ${project.name}`}
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  ) : null}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-950 mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed mb-4">{project.description}</p>
                <ul className="space-y-1.5 mb-4">
                  {project.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-ink-700">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-copper shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] text-ink-700 border border-ink-400 rounded px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
