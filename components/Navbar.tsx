"use client";

import { useEffect, useState } from "react";
import type { SiteInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "#about", label: "about" },
  { href: "#skills", label: "stack" },
  { href: "#experience", label: "experience" },
  { href: "#projects", label: "projects" },
  { href: "#contact", label: "contact" }
];

export function Navbar({ site }: { site: SiteInfo }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors ${
        scrolled ? "bg-ink-50/85 backdrop-blur border-b border-ink-300" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono text-sm text-ink-900">
          <span className="text-copper">~/</span>
          {site.name.split(" ")[0].toLowerCase()}
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
          className="font-mono text-xs rounded-md border border-ink-500 px-3 py-1.5 text-ink-900 hover:border-copper hover:text-copper transition-colors"
        >
          say hi
        </a>
      </nav>
    </header>
  );
}
