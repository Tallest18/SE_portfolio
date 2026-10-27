import { getContent } from "@/lib/content";
import { profileFacts, resumeHref, siteUrl } from "@/lib/profile";
import type { PortfolioContent } from "@/lib/types";
import { World } from "@/components/world/World";
import { Navbar } from "@/components/Navbar";
import { JourneyRail } from "@/components/JourneyRail";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

/** schema.org Person, read by search engines and recruiting/sourcing tools. */
function personJsonLd(content: PortfolioContent) {
  const { site } = content;
  const url = siteUrl(content);
  const current = content.experience.items.filter((i) => i.current && !/self-employed/i.test(i.company));
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.title,
    description: content.hero.subheadline,
    email: `mailto:${site.email}`,
    ...(url ? { url } : {}),
    address: { "@type": "PostalAddress", addressLocality: site.location },
    sameAs: [site.links.github, site.links.linkedin, site.links.portfolio].filter(Boolean),
    worksFor: current.map((i) => ({ "@type": "Organization", name: i.company })),
    alumniOf: content.education.items.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    knowsAbout: content.skills.groups.flatMap((g) => g.items),
    hasCredential: content.certifications.items.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      ...(c.issuer ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {})
    }))
  };
  // Escape "<" so content can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function Home() {
  const content = await getContent();
  const facts = profileFacts(content);
  const resume = resumeHref(content);

  return (
    <World content={content}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(content) }} />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-copper px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar site={content.site} resumeHref={resume} />
      <JourneyRail />
      {/* Pointer events pass through to the 3D scene; panels opt back in. */}
      <main id="main" className="pointer-events-none relative z-10">
        <Hero hero={content.hero} site={content.site} status={content.status} facts={facts} resumeHref={resume} />
        <About about={content.about} />
        <Skills skills={content.skills} />
        <Projects projects={content.projects} github={content.site.links.github} />
        <Experience
          experience={content.experience}
          certifications={content.certifications}
          leadership={content.leadership}
          education={content.education}
        />
        <Contact contact={content.contact} site={content.site} />
      </main>
      <Footer site={content.site} />
    </World>
  );
}
