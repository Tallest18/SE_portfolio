import { ImageResponse } from "next/og";
import data from "@/data/content.json";
import { profileFacts } from "@/lib/profile";
import type { PortfolioContent } from "@/lib/types";

// The card shown when the portfolio link is shared (LinkedIn, Slack, X, ...).
// Edge runtime: next/og's Node build can't load its font on Windows, which breaks
// `next build` there. Edge can't read files per request, so the card uses the
// content as of the last build; redeploy to refresh it after editing in /admin.
export const runtime = "edge";
export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const content = data as unknown as PortfolioContent;
  const { site, skills } = content;
  const facts = profileFacts(content);
  // Round-robin over the first few skill groups so web, mobile and backend all show.
  const groups = skills.groups.slice(0, 3).map((g) => g.items);
  const picked: string[] = [];
  for (let i = 0; picked.length < 5 && groups.some((g) => i < g.length); i++) {
    for (const g of groups) if (g[i] && picked.length < 5) picked.push(g[i]);
  }
  const stack = picked.join("  ·  ");
  const chips = [
    facts.years !== null ? `${facts.years}+ years shipping` : "",
    facts.storeApps.length ? `${facts.storeApps.length} apps live on Google Play` : "",
    ...facts.currentCompanies.slice(0, 2)
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(180deg, #03050C 0%, #0A1124 70%)",
          color: "#F4EFE6",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: 40,
            width: 560,
            height: 560,
            borderRadius: 9999,
            border: "6px solid #E2662A",
            boxShadow: "0 0 120px 20px rgba(226,102,42,0.45)",
            display: "flex"
          }}
        />
        <div style={{ display: "flex", fontSize: 26, color: "#E2662A", letterSpacing: 2 }}>{"// portfolio"}</div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ display: "flex", fontSize: 40, color: "#4FB3BC", marginTop: 12 }}>{site.title}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#9AA4B8", marginTop: 20 }}>{stack}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "10px 22px",
                borderRadius: 9999,
                border: "2px solid rgba(244,239,230,0.25)",
                background: "rgba(16,26,48,0.8)"
              }}
            >
              {c}
            </div>
          ))}
          <div style={{ display: "flex", fontSize: 24, padding: "10px 4px", color: "#9AA4B8" }}>
            {site.location}
          </div>
        </div>
      </div>
    ),
    size
  );
}
