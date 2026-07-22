# Blessing Aighangbe — Portfolio

A senior-engineer-grade portfolio site built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Framer Motion — with a built-in admin panel so you can update every section (hero, about, skills, experience, projects, certifications, leadership, education, contact) without touching code.

## Design direction

The site is built around an "engineer's workspace" idea: the hero reads like a terminal window, section labels look like file names (`experience.log`, `stack.json`), and the hero's live stat panel echoes your real production metrics (150+ vendors, 99.9% uptime, -40% latency, +20% retention). Palette is a deep graphite ink background with a signal-teal accent and a warm amber secondary; type pairs Space Grotesk (display) with Inter (body) and JetBrains Mono (labels/data).

## Getting started

**Requirements:** Node.js 18.17 or newer.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and set two things:

```
ADMIN_PASSWORD=pick-a-strong-password
SESSION_SECRET=a-long-random-string
```

Generate a good `SESSION_SECRET` with:

```bash
openssl rand -base64 32
```

Then run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin` to sign in to the admin panel.

## Editing content

Everything shown on the site lives in `data/content.json`. You have two ways to edit it:

1. **Admin panel (recommended):** go to `/admin`, sign in with `ADMIN_PASSWORD`, edit any section, and click **Save changes**. The public site reads fresh content on every request, so changes appear immediately — no rebuild or redeploy needed.
2. **Directly:** open `data/content.json` in your editor and edit the JSON by hand. Useful for bulk edits or version-controlling your content.

Add your real links before you share this: GitHub, LinkedIn, portfolio, Play Store, and a resume URL, all editable from the **Site & hero** tab in `/admin`.

## Deployment — read this before you deploy

The admin panel saves edits by writing to `data/content.json` on disk. That works great when you self-host on a server with persistent storage:

- A VPS (DigitalOcean, Hetzner, etc.) running `npm run build && npm run start`
- Render, Railway, Fly.io, or similar platforms with a persistent filesystem

**It will NOT persist on serverless platforms with a read-only, ephemeral filesystem** — most notably **Vercel** and Netlify functions. On those, your edits will save successfully for the current server instance but disappear on the next deploy or cold start, because each deploy resets the filesystem back to what's in your repo.

If you want to deploy to Vercel and keep the admin panel working long-term, swap the storage layer in `lib/content.ts` for something persistent — for example:

- **Vercel KV / Upstash Redis** — small change, a few lines in `getContent`/`saveContent`
- **A hosted Postgres/SQLite (Turso, Neon, Supabase)** — better if you expect the content to grow a lot
- Simplest zero-cost option: keep editing locally and `git push` your changes — the site rebuilds from `data/content.json` in the repo

Everything else about the site (the public pages, the design, the animations) works identically wherever you deploy it — this caveat only affects whether admin edits persist across deploys/cold starts.

## Project structure

```
app/
  layout.tsx            Fonts, metadata
  page.tsx              Public homepage — assembles all sections
  admin/
    page.tsx             Admin login
    dashboard/page.tsx    Admin dashboard (protected)
  api/admin/
    login/route.ts        Checks password, sets session cookie
    logout/route.ts        Clears session cookie
    content/route.ts       GET/PUT data/content.json (protected)
components/
  Hero.tsx, About.tsx, Skills.tsx, Experience.tsx, Projects.tsx,
  Certifications.tsx, LeadershipEducation.tsx, Contact.tsx, ...
  admin/AdminDashboard.tsx  Tabbed content editor
data/content.json        Single source of truth for all site content
lib/
  content.ts             Reads/writes content.json
  auth.ts                Signed session cookie helpers
  types.ts               TypeScript schema for content.json
middleware.ts            Protects /admin/dashboard and the content API
```

## Customizing further

- **Colors/fonts:** `tailwind.config.ts` (colors) and `app/layout.tsx` (fonts).
- **Add a section:** create a component in `components/`, add its data shape to `lib/types.ts` and `data/content.json`, render it in `app/page.tsx`, and add an editor tab in `components/admin/AdminDashboard.tsx`.
- **Projects with live links/screenshots:** add an `image` field to `ProjectItem` in `lib/types.ts`, drop images in `public/projects/`, and reference them with `next/image` in `components/Projects.tsx`.

## Security notes

- The admin password is a single shared secret (`ADMIN_PASSWORD`) — fine for a personal site with one editor. Don't reuse a password you use elsewhere.
- Sessions are signed JWTs stored in an HTTP-only cookie, valid for 7 days.
- `data/content.json` accepts arbitrary text — it's rendered as text/attributes, not executed, so there's no injection risk from editing it.
