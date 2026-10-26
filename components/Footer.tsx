import type { SiteInfo } from "@/lib/types";

export function Footer({ site }: { site: SiteInfo }) {
  return (
    <footer className="relative z-10 px-4 pb-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-cream/10 pt-6 font-mono text-xs text-mist sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name} {site.role}. Built with Next.js, Three.js & Tailwind.
        </p>
        <div className="flex gap-5">
          {site.links.github && (
            <a href={site.links.github} className="transition-colors hover:text-copper-light">
              github
            </a>
          )}
          {site.links.linkedin && (
            <a href={site.links.linkedin} className="transition-colors hover:text-copper-light">
              linkedin
            </a>
          )}
          {site.links.playstore && (
            <a href={site.links.playstore} className="transition-colors hover:text-copper-light">
              play store
            </a>
          )}
          <a href="/admin" className="transition-colors hover:text-copper-light">
            admin
          </a>
        </div>
      </div>
    </footer>
  );
}
