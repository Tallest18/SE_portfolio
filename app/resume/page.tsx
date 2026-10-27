import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { profileFacts, siteUrl } from "@/lib/profile";
import { PrintButton } from "@/components/resume/PrintButton";

// Generated from content.json on every request, so it always matches the site.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { site, hero } = await getContent();
  return {
    title: `Résumé — ${site.name}, ${site.title}`,
    description: hero.subheadline
  };
}

/** "https://github.com/Tallest18" → "github.com/Tallest18" */
function pretty(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7 print:mt-3.5">
      <h2 className="border-b border-ink-300 pb-1 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-copper-dark">
        {title}
      </h2>
      <div className="mt-3 print:mt-1.5">{children}</div>
    </section>
  );
}

export default async function ResumePage() {
  const content = await getContent();
  const { site, hero, experience, projects, skills, certifications, leadership, education } = content;
  const facts = profileFacts(content);
  const url = siteUrl(content);

  const summary = [
    facts.years !== null ? `${site.title} with ${facts.years}+ years of experience shipping software.` : `${site.title}.`,
    hero.subheadline,
    facts.storeApps.length
      ? `${facts.storeApps.length} apps live on Google Play${facts.onAppStore ? " and the App Store" : ""}: ${facts.storeApps.join(", ")}.`
      : "",
    `${site.availability}.`
  ]
    .filter(Boolean)
    .join(" ");

  const contactLinks = [
    site.email && { href: `mailto:${site.email}`, text: site.email },
    site.phone && { href: `tel:${site.phone.replace(/\s/g, "")}`, text: site.phone },
    url && { href: url, text: pretty(url) },
    site.links.github && { href: site.links.github, text: pretty(site.links.github) },
    site.links.linkedin && { href: site.links.linkedin, text: "LinkedIn" }
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <div className="min-h-screen bg-ink-200 py-6 text-ink-900 sm:py-10 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[820px] items-center justify-between gap-4 px-4 print:hidden">
        <a href="/" className="font-mono text-xs text-ink-700 transition-colors hover:text-copper">
          ← back to portfolio
        </a>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[820px] bg-white px-6 py-8 shadow-xl shadow-ink-900/10 sm:px-12 sm:py-12 print:max-w-none print:px-0 print:py-0 print:shadow-none print:[zoom:0.84]">
        <header>
          <h1 className="font-display text-3xl font-semibold text-ink-950 sm:text-4xl">{site.name}</h1>
          <p className="mt-1 text-lg text-ink-700">{site.title}</p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-700">
            <span>{site.location}</span>
            {contactLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-ink-900 underline decoration-ink-400 underline-offset-2 hover:text-copper">
                {l.text}
              </a>
            ))}
          </p>
        </header>

        <Section title="Summary">
          <p className="text-[15px] leading-relaxed text-ink-800 print:text-sm print:leading-snug">{summary}</p>
        </Section>

        <Section title={experience.heading}>
          <div className="space-y-5 print:space-y-2.5">
            {experience.items.map((item) => (
              <div key={item.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-ink-950">
                    {item.role} · {item.company}
                  </h3>
                  <span className="font-mono text-xs text-ink-600">{item.period}</span>
                </div>
                <p className="text-sm text-ink-600">{item.location}</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-800 marker:text-ink-400 print:mt-0.5 print:space-y-0 print:leading-snug">
                  {item.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Selected projects">
          <div className="space-y-4 print:space-y-2">
            {projects.items.map((p) => (
              <div key={p.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-ink-950">
                    {p.name} <span className="font-normal text-ink-600">· {p.tag}</span>
                  </h3>
                  <span className="flex gap-3 text-xs">
                    {[p.link, p.appStore].filter(Boolean).map((href) => (
                      <a key={href} href={href} className="text-ink-700 underline decoration-ink-400 underline-offset-2 hover:text-copper">
                        {/play\.google/.test(href!) ? "Google Play" : /apps\.apple/.test(href!) ? "App Store" : pretty(href!)}
                      </a>
                    ))}
                  </span>
                </div>
                {p.role && <p className="text-sm text-ink-600">{p.role}</p>}
                <p className="mt-1 text-sm leading-relaxed text-ink-800 print:mt-0 print:leading-snug">{p.description}</p>
                {/* The Skills section carries these keywords in print; keeps the PDF to two pages. */}
                <p className="mt-1 text-xs text-ink-600 print:hidden">
                  <span className="font-semibold text-ink-700">Stack:</span> {p.stack.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <dl className="space-y-1.5 text-sm">
            {skills.groups.map((g) => (
              <div key={g.name} className="sm:flex sm:gap-3">
                <dt className="font-semibold text-ink-950 sm:w-40 sm:shrink-0">{g.name}</dt>
                <dd className="text-ink-800">{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title={certifications.heading}>
          <ul className="grid gap-x-6 gap-y-1 text-sm text-ink-800 sm:grid-cols-2">
            {certifications.items.map((c, i) => (
              <li key={`${c.name}-${i}`}>
                <span className="text-ink-950">{c.name}</span>
                {(c.issuer || c.year) && (
                  <span className="text-ink-600">
                    {" "}
                    — {[c.issuer, c.year].filter(Boolean).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-x-8 sm:grid-cols-2">
          <Section title={leadership.heading}>
            {leadership.items.map((l) => (
              <div key={l.role} className="break-inside-avoid text-sm">
                <h3 className="font-semibold text-ink-950">{l.role}</h3>
                <p className="text-ink-600">
                  {l.org} · {l.period}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-800 marker:text-ink-400">
                  {l.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
          <Section title={education.heading}>
            {education.items.map((e) => (
              <div key={e.degree} className="break-inside-avoid text-sm">
                <h3 className="font-semibold text-ink-950">{e.degree}</h3>
                <p className="text-ink-600">
                  {e.school} · {e.period}
                </p>
              </div>
            ))}
          </Section>
        </div>
      </article>
    </div>
  );
}
