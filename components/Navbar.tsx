"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Box, FileText, Mail, Square, X } from "lucide-react";
import type { SiteInfo } from "@/lib/types";
import { STATIONS } from "@/lib/world/layout";
import { toggle3D, useWorld } from "@/lib/world/store";

const NAV_ITEMS = STATIONS.filter((s) => s.id !== "top");

const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 34 }
  },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" as const } }
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } }
};

export function Navbar({ site, resumeHref }: { site: SiteInfo; resumeHref: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const station = useWorld((s) => s.station);
  const mode = useWorld((s) => s.mode);
  const supported = useWorld((s) => s.supported);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300",
        scrolled || menuOpen ? "border-b border-cream/[0.07] bg-night/70 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-mono text-sm text-cream"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt={site.name}
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-full ring-1 ring-gold/40"
          />
          <span className="hidden sm:inline md:hidden lg:inline">{site.name}</span>
        </a>
        <ul className="hidden items-center gap-1 font-mono text-xs md:flex">
          {NAV_ITEMS.map((item) => {
            const active = station === item.id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active ? "location" : undefined}
                  className={clsx(
                    "relative rounded-full px-2.5 py-1.5 transition-colors lg:px-3.5",
                    active ? "text-cream" : "text-mist hover:text-cream"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-cream/10 bg-cream/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 font-mono text-xs text-mist transition-colors hover:text-cream lg:inline-flex"
          >
            <FileText size={13} aria-hidden="true" />
            résumé
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-copper-light/60 px-3.5 py-1.5 font-mono text-xs text-cream transition-colors hover:bg-copper hover:text-cream"
          >
            <Mail size={13} aria-hidden="true" />
            say hi
          </a>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative z-50 h-8 w-8 text-cream md:hidden"
        >
          <span
            className={`absolute left-1/2 top-1/2 block h-px w-5 -translate-x-1/2 bg-current transition-transform duration-300 ${
              menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[6px]"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 block h-px w-5 -translate-x-1/2 bg-current transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 block h-px w-5 -translate-x-1/2 bg-current transition-transform duration-300 ${
              menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[6px]"
            }`}
          />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[82%] max-w-xs flex-col border-l border-cream/10 bg-night-900 shadow-2xl md:hidden"
            >
              <div className="relative flex items-center justify-between border-b border-cream/10 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
                  <span className="font-mono text-xs text-mist">{site.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="text-mist transition-colors hover:text-copper-light"
                >
                  <X size={18} />
                </button>
              </div>

              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative flex flex-col gap-1 px-6 py-6 font-mono text-lg text-cream"
              >
                {NAV_ITEMS.map((item, i) => (
                  <motion.li key={item.href} variants={itemVariants}>
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={station === item.id ? "location" : undefined}
                      className={clsx(
                        "group flex items-baseline gap-3 py-2.5 transition-colors hover:text-copper-light",
                        station === item.id && "text-copper-light"
                      )}
                    >
                      <span className="text-xs text-copper-light/70 group-hover:text-copper-light">0{i + 1}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative mt-auto flex flex-col gap-3 border-t border-cream/10 px-6 py-6"
              >
                <button
                  type="button"
                  onClick={toggle3D}
                  disabled={!supported}
                  className="inline-flex items-center gap-2 self-start font-mono text-xs text-mist transition-colors hover:text-cream disabled:opacity-50"
                >
                  {mode === "3d" ? <Square size={14} /> : <Box size={14} />}
                  {supported ? (mode === "3d" ? "switch to flat view" : "switch to 3D world") : "3D unavailable on this device"}
                </button>
                <a
                  href={`mailto:${site.email}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-copper px-4 py-2.5 font-mono text-xs text-cream transition-colors hover:bg-copper-light"
                >
                  <Mail size={14} />
                  say hi
                </a>
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 self-start font-mono text-xs text-mist transition-colors hover:text-cream"
                >
                  <FileText size={14} />
                  view résumé
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
