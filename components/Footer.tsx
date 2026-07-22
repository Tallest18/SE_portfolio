import type { SiteInfo } from "@/lib/types";

export function Footer({ site }: { site: SiteInfo }) {
  return (
    <footer className="border-t border-ink-300 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-600">
        <p>
          © {new Date().getFullYear()} {site.name} {site.role}. Built with Next.js & Tailwind.
        </p>
        <div className="flex gap-5">
          {site.links.github && (
            <a href={site.links.github} className="hover:text-copper transition-colors">
              github
            </a>
          )}
          {site.links.linkedin && (
            <a href={site.links.linkedin} className="hover:text-copper transition-colors">
              linkedin
            </a>
          )}
          {site.links.playstore && (
            <a href={site.links.playstore} className="hover:text-copper transition-colors">
              play store
            </a>
          )}
          <a href="/admin" className="hover:text-copper transition-colors">
            admin
          </a>
        </div>
      </div>
    </footer>
  );
}
