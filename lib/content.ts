import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { PortfolioContent } from "./types";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

/**
 * Reads the current portfolio content from data/content.json.
 * This file is the single source of truth for everything rendered on the
 * public site, and it's what the admin panel edits.
 */
export async function getContent(): Promise<PortfolioContent> {
  const raw = await fs.readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as PortfolioContent;
}

/**
 * Overwrites data/content.json with new content.
 *
 * IMPORTANT: this writes to the local filesystem. That works when you run
 * `npm run dev`/`npm run start` on your own machine or a server with
 * persistent disk (a VPS, Railway, Render, etc). It will NOT persist on
 * serverless hosts with a read-only filesystem (Vercel, Netlify functions),
 * because each deploy resets the filesystem. See README.md for how to swap
 * this for a database if you deploy there.
 */
export async function saveContent(content: PortfolioContent): Promise<void> {
  const json = JSON.stringify(content, null, 2);
  await fs.writeFile(CONTENT_PATH, json, "utf-8");
}
