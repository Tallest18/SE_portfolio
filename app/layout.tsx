import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getContent } from "@/lib/content";

// Fonts are self-hosted (latin subset, variable weight) so dev and build
// never depend on reaching Google Fonts.
const display = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "500 700",
  variable: "--font-display"
});

const body = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 600",
  variable: "--font-body"
});

const mono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono"
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { site } = content;
  return {
    title: `${site.name} ${site.role} — ${site.title}`,
    description: content.hero.subheadline,
    icons: { icon: "/favicon.svg" }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink-50 text-ink-900 font-body antialiased selection:bg-copper/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
