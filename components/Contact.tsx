"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, FileText, Github, Globe, Linkedin, Mail, MapPin, Phone, Play } from "lucide-react";
import type { ContactContent, SiteInfo } from "@/lib/types";
import { AnchorBlock, StationTag } from "./world/ui";

export function Contact({ contact, site }: { contact: ContactContent; site: SiteInfo }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const profiles = [
    { href: site.links.github, label: "GitHub", Icon: Github },
    { href: site.links.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: site.links.playstore, label: "Google Play", Icon: Play },
    { href: site.links.portfolio, label: "Portfolio", Icon: Globe },
    { href: site.resumeUrl || "/resume", label: "Résumé", Icon: FileText }
  ].filter((p) => p.href);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative">
      <AnchorBlock
        anchor="contact"
        align="center"
        className="lg:[&>div]:items-end lg:[&>div]:pb-20"
        panelClassName="lg:max-w-2xl text-center"
      >
        <StationTag index="05" label="contact" />
        <h2 id="contact-title" className="font-display text-3xl font-semibold text-cream sm:text-5xl">
          {contact.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-cream/80">{contact.message}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex max-w-full items-center gap-2 rounded-full bg-copper px-4 py-3 text-sm font-medium text-cream shadow-[0_10px_40px_-10px_rgba(226,102,42,0.8)] transition-colors hover:bg-copper-light sm:px-5 sm:text-base"
          >
            <Mail size={16} aria-hidden="true" />
            {contact.email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-3 text-sm text-cream transition-colors hover:border-copper-light hover:text-copper-light"
          >
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cream/80">
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-copper-light"
          >
            <Phone size={14} className="text-copper-light" aria-hidden="true" />
            {contact.phone}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} className="text-copper-light" aria-hidden="true" />
            {contact.location}
          </span>
        </div>

        {profiles.length > 0 && (
          <ul className="mt-7 flex flex-wrap justify-center gap-2 border-t border-cream/10 pt-6">
            {profiles.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-cream/15 bg-night/40 px-4 py-2 text-sm text-cream/90 transition-colors hover:border-signal/60 hover:text-cream"
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                  <ArrowUpRight size={13} className="text-mist transition-colors group-hover:text-signal" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </AnchorBlock>
    </section>
  );
}
