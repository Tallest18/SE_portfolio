import { Mail, MapPin, Phone } from "lucide-react";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { TerminalWindow } from "./TerminalWindow";
import type { ContactContent } from "@/lib/types";

export function Contact({ contact }: { contact: ContactContent }) {
  return (
    <section id="contact" className="py-20 sm:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <SectionLabel index="08" name="contact.ts" />
        </Reveal>
        <Reveal delay={0.05}>
          <TerminalWindow tabs={["contact.ts"]}>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 mb-3">
              {contact.heading}
            </h2>
            <p className="text-ink-700 leading-relaxed max-w-xl mb-8">{contact.message}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 rounded-lg border border-ink-400 px-4 py-3 hover:border-copper transition-colors"
              >
                <Mail size={16} className="text-copper shrink-0" />
                <span className="text-sm text-ink-900 truncate">{contact.email}</span>
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-lg border border-ink-400 px-4 py-3 hover:border-copper transition-colors"
              >
                <Phone size={16} className="text-copper shrink-0" />
                <span className="text-sm text-ink-900">{contact.phone}</span>
              </a>
              <div className="flex items-center gap-3 rounded-lg border border-ink-400 px-4 py-3">
                <MapPin size={16} className="text-copper shrink-0" />
                <span className="text-sm text-ink-900">{contact.location}</span>
              </div>
            </div>
          </TerminalWindow>
        </Reveal>
      </div>
    </section>
  );
}
