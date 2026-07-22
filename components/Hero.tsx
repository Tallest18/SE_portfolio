"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { TerminalWindow } from "./TerminalWindow";
import type { HeroContent, SiteInfo, StatusContent } from "@/lib/types";

function useTypewriter(words: string[]) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
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
  }, [text, phase, wordIndex, words]);

  return text;
}

export function Hero({
  hero,
  site,
  status
}: {
  hero: HeroContent;
  site: SiteInfo;
  status: StatusContent;
}) {
  const typed = useTypewriter(hero.roles);

  return (
    <section id="top" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6">
      <div className="absolute inset-0 bg-grid bg-[length:44px_44px] grid-fade-mask opacity-60 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs text-copper mb-5 tracking-wide"
          >
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-semibold text-balance text-ink-950"
          >
            {hero.headline}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 font-mono text-sm sm:text-base text-ink-800 h-6"
          >
            <span className="text-ink-600">const role = </span>
            <span className="text-teal">&quot;{typed}</span>
            <span className="inline-block w-[2px] h-4 bg-teal align-middle ml-0.5 animate-blink" />
            <span className="text-teal">&quot;</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-ink-700 text-base sm:text-lg max-w-xl leading-relaxed"
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href={hero.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-lg bg-copper px-5 py-3 font-medium text-ink-50 hover:bg-copper-light transition-colors"
            >
              {hero.primaryCta.label}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-500 px-5 py-3 font-medium text-ink-900 hover:border-copper hover:text-copper transition-colors"
            >
              <Mail size={16} />
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 font-mono text-xs text-ink-600"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-copper mr-2 align-middle" />
            {site.availability} · {site.location}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <TerminalWindow tabs={["status.ts", "stack.json"]}>
            <p className="font-mono text-xs text-ink-600 mb-4">{status.label}</p>
            <div className="grid grid-cols-2 gap-5">
              {status.stats.map((stat) => (
                <div key={stat.id}>
                  <p className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">
                    {stat.value}
                  </p>
                  <p className="text-xs text-ink-700 mt-1">{stat.label}</p>
                  <p className="font-mono text-[10px] text-ink-500 mt-1 leading-snug">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  );
}
