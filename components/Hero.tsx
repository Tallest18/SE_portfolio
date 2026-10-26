"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import type { HeroContent, SiteInfo, StatusContent } from "@/lib/types";
import { useWorld } from "@/lib/world/store";
import { Transit } from "./world/ui";

function useTypewriter(words: string[], enabled: boolean) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (!enabled || words.length === 0) return;
    const current = words[wordIndex % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 45);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1400);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 700);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 25);
      } else {
        setPhase("typing");
        setWordIndex((i) => (i + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, wordIndex, words, enabled]);

  return enabled ? text : (words[0] ?? "");
}

// MotionConfig (in World) drops the movement for reduced-motion users and keeps the fade.
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: 0.15 + delay, ease: [0.16, 1, 0.3, 1] as const }
});

export function Hero({
  hero,
  site,
  status
}: {
  hero: HeroContent;
  site: SiteInfo;
  status: StatusContent;
}) {
  // From the store rather than matchMedia so server and first client render agree.
  const reduce = useWorld((s) => s.reducedMotion);
  const typed = useTypewriter(hero.roles, !reduce);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      <div data-anchor="hero" className="pointer-events-none relative flex min-h-[100svh] flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-end px-4 pb-8 pt-[38svh] sm:px-8 lg:items-center lg:pt-28 short:items-center short:pt-20">
          <div className="hero-scrim pointer-events-auto max-w-xl lg:max-w-[30rem] xl:max-w-[40rem] short:max-w-[26rem]">
            <motion.p {...rise(0)} className="mb-5 font-mono text-xs tracking-wide text-copper-light">
              {hero.eyebrow}
            </motion.p>

            <motion.h1
              id="hero-title"
              {...rise(0.08)}
              className="text-balance font-display text-[2.4rem] font-semibold leading-[1.04] text-cream sm:text-6xl lg:text-[3.4rem] xl:text-[4.1rem] short:text-4xl"
            >
              {hero.headline}
            </motion.h1>

            <motion.p {...rise(0.18)} className="mt-5 h-6 font-mono text-sm text-cream/80 sm:text-base">
              <span className="text-mist">const role = </span>
              <span className="text-signal">&quot;{typed}</span>
              <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-signal align-middle" />
              <span className="text-signal">&quot;</span>
            </motion.p>

            <motion.p {...rise(0.26)} className="mt-6 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
              {hero.subheadline}
            </motion.p>

            <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={hero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-full bg-copper px-5 py-3 font-medium text-cream shadow-[0_10px_40px_-10px_rgba(226,102,42,0.8)] transition-colors hover:bg-copper-light"
              >
                {hero.primaryCta.label}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={hero.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-night/40 px-5 py-3 font-medium text-cream backdrop-blur transition-colors hover:border-copper-light hover:text-copper-light"
              >
                <Mail size={16} />
                {hero.secondaryCta.label}
              </a>
            </motion.div>

            <motion.p {...rise(0.42)} className="mt-7 flex items-center gap-2 font-mono text-xs text-mist">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper-light opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-copper-light" />
              </span>
              {site.availability} · {site.location}
            </motion.p>
          </div>
        </div>

        <motion.div
          {...rise(0.55)}
          className="pointer-events-auto mx-auto w-full max-w-7xl px-4 pb-6 sm:px-8"
        >
          <div className="glass relative rounded-2xl px-5 py-4 sm:px-6">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {status.label}
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              {status.stats.map((stat) => (
                <li key={stat.id} className="min-w-0">
                  <p className="font-display text-2xl font-semibold text-cream sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-cream/75">{stat.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] leading-snug text-mist">{stat.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <a
          href="#about"
          className="pointer-events-auto mx-auto mb-5 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:text-cream lg:flex"
        >
          scroll to enter
          <ArrowDown size={14} className="motion-safe:animate-bounce" />
        </a>
      </div>
      <Transit />
    </section>
  );
}
