import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import type { CertificationsContent } from "@/lib/types";

export function Certifications({ certifications }: { certifications: CertificationsContent }) {
  return (
    <section id="certifications" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel index="05" name="certifications.md" />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.items.map((cert, i) => (
            <Reveal key={cert.name} delay={i * 0.04}>
              <div className="h-full rounded-lg border border-ink-400 bg-ink-200/40 p-5 hover:border-ink-500 transition-colors">
                <p className="text-sm font-medium text-ink-950 leading-snug mb-2">{cert.name}</p>
                <p className="font-mono text-[11px] text-ink-600">
                  {cert.issuer}
                  {cert.issuer && cert.year ? " · " : ""}
                  {cert.year}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
