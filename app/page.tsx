import { getContent } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Certifications } from "@/components/Certifications";
import { LeadershipEducation } from "@/components/LeadershipEducation";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <Navbar site={content.site} />
      <main>
        <Hero hero={content.hero} site={content.site} status={content.status} />
        <About about={content.about} />
        <Skills skills={content.skills} />
        <Experience experience={content.experience} />
        <Projects projects={content.projects} />
        <Certifications certifications={content.certifications} />
        <LeadershipEducation leadership={content.leadership} education={content.education} />
        <Contact contact={content.contact} />
      </main>
      <Footer site={content.site} />
    </>
  );
}
