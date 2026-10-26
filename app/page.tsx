import { getContent } from "@/lib/content";
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

export default async function Home() {
  const content = await getContent();

  return (
    <World content={content}>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-copper px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar site={content.site} />
      <JourneyRail />
      {/* Pointer events pass through to the 3D scene; panels opt back in. */}
      <main id="main" className="pointer-events-none relative z-10">
        <Hero hero={content.hero} site={content.site} status={content.status} />
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
