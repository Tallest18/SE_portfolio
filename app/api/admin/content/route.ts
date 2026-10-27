import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content";
import type { PortfolioContent } from "@/lib/types";

// middleware.ts turns away requests without a session, but each handler checks
// again so the route stays protected even if middleware is skipped.

// Without this, Next prerenders GET at build time and serves stale content.
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
}

export async function GET() {
  if (!(await hasAdminSession())) return unauthorized();
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Could not read content." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminSession())) return unauthorized();
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
