import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
