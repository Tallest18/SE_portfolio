import type { PortfolioContent } from "./types";

/**
 * Recruiter-facing facts derived from content.json, so they stay true as the
 * content is edited in /admin (no hand-maintained numbers to go stale).
 */

const STORE = /play\.google\.com|apps\.apple\.com/i;

export interface ProfileFacts {
  /** Earliest year in the experience periods, e.g. 2023. */
  since: number | null;
  /** Whole years since `since`. */
  years: number | null;
  /** Projects with a Google Play or App Store listing. */
  storeApps: string[];
  /** True when at least one project links an App Store listing. */
  onAppStore: boolean;
  /** Companies of current roles, freelance excluded. */
  currentCompanies: string[];
}

export function profileFacts(content: PortfolioContent, now = new Date()): ProfileFacts {
  const years = content.experience.items.flatMap((i) =>
    (i.period.match(/\b(?:19|20)\d{2}\b/g) ?? []).map(Number)
  );
  const since = years.length ? Math.min(...years) : null;

  const seen = new Set<string>();
  const storeApps: string[] = [];
  for (const p of content.projects.items) {
    const links = [p.link, p.appStore ?? ""].filter((l) => STORE.test(l));
    if (!links.length || links.every((l) => seen.has(l))) continue;
    links.forEach((l) => seen.add(l));
    storeApps.push(p.name);
  }

  return {
    since,
    years: since === null ? null : Math.max(1, now.getFullYear() - since),
    storeApps,
    onAppStore: content.projects.items.some((p) => !!p.appStore),
    currentCompanies: content.experience.items
      .filter((i) => i.current && !/freelance|self-employed/i.test(`${i.role} ${i.company}`))
      .map((i) => i.company)
  };
}

/** Where the résumé lives: an uploaded file if one is set in /admin, else the generated page. */
export function resumeHref(content: PortfolioContent) {
  return content.site.resumeUrl || "/resume";
}

/** Canonical site URL for absolute links (Open Graph, JSON-LD). */
export function siteUrl(content: PortfolioContent): string | undefined {
  const raw = process.env.SITE_URL || content.site.links.portfolio;
  if (!raw) return undefined;
  try {
    return new URL(raw).origin;
  } catch {
    return undefined;
  }
}
