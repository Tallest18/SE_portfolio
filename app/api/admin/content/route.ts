import { NextRequest, NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/content";
import type { PortfolioContent } from "@/lib/types";

// Note: this route is protected by middleware.ts, which checks for a valid
// admin session cookie before requests ever reach here.

// Without this, Next prerenders GET at build time and serves stale content.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Could not read content." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as PortfolioContent;

    // Minimal shape check so a malformed request can't wipe the file.
    const requiredKeys: (keyof PortfolioContent)[] = [
      "site",
      "hero",
      "status",
      "about",
      "skills",
      "experience",
      "projects",
      "certifications",
      "leadership",
      "education",
      "contact"
    ];
    for (const key of requiredKeys) {
      if (!(key in body)) {
        return NextResponse.json(
          { error: `Missing "${key}" in submitted content.` },
          { status: 400 }
        );
      }
    }

    await saveContent(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not save content. Check the server logs." },
      { status: 500 }
    );
  }
}
