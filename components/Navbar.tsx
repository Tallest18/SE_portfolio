"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import type { SiteInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "#about", label: "about" },
  { href: "#skills", label: "stack" },
  { href: "#experience", label: "experience" },
  { href: "#projects", label: "projects" },
  { href: "#contact", label: "contact" }
];

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

export function Navbar({ site }: { site: SiteInfo }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors ${
        scrolled || menuOpen ? "bg-ink-50/85 backdrop-blur border-b border-ink-300" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-mono text-sm text-ink-900"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt={site.name}
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-full"
          />
          <span className="hidden sm:inline">{site.name}</span>
        </a>
        <ul className="hidden md:flex items-center gap-7 font-mono text-xs text-ink-700">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="hover:text-copper transition-colors">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`mailto:${site.email}`}
          className="hidden md:inline-block font-mono text-xs rounded-md border border-ink-500 px-3 py-1.5 text-ink-900 hover:border-copper hover:text-copper transition-colors"
        >
          say hi
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="md:hidden relative z-50 h-8 w-8 text-ink-900"
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
              className="md:hidden fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm"
            />
            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden fixed inset-y-0 right-0 z-50 flex h-dvh w-[80%] max-w-xs flex-col border-l border-ink-300 bg-ink-50 shadow-2xl"
            >
              <div className="absolute inset-0 bg-grid bg-[length:32px_32px] opacity-40 pointer-events-none" />

              <div className="relative flex items-center justify-between px-6 py-4 border-b border-ink-300">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt={site.name} width={28} height={28} className="h-7 w-7 rounded-full" />
                  <span className="font-mono text-xs text-ink-600">{site.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="text-ink-700 hover:text-copper transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative flex flex-col gap-1 px-6 py-6 font-mono text-lg text-ink-800"
              >
                {NAV_ITEMS.map((item, i) => (
                  <motion.li key={item.href} variants={itemVariants}>
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-baseline gap-3 py-2.5 hover:text-copper transition-colors"
                    >
                      <span className="text-xs text-copper/70 group-hover:text-copper">
                        0{i + 1}
                      </span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="relative mt-auto px-6 py-6 border-t border-ink-300">
                <a
                  href={`mailto:${site.email}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 font-mono text-xs text-ink-50 hover:bg-copper-light transition-colors"
                >
                  <Mail size={14} />
                  say hi
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
