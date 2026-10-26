# Blessing Aighangbe — Portfolio

A portfolio site built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion and Three.js (React Three Fiber) — with a built-in admin panel so you can update every section (hero, about, skills, experience, projects, certifications, leadership, education, contact) without touching code.

## Design direction

The public site is a scroll-driven 3D world (Three.js via React Three Fiber). Scrolling moves a camera along a path through six stations, each built from your real content:

| Station | Section | In the world |
| --- | --- | --- |
| 00 | Hero | A ring gate framing a phone (name, title, roles) and a code window. The camera flies through it on the first scroll and the devices part like doors. |
| 01 | About | Your focus areas as a stack of glass layers that fan open as you arrive. Hovering a focus area lifts its layer. |
| 02 | Stack | Each skill group is an orbit around a core; every technology is a labelled node. Hover a group (in the panel or the scene) to light its orbit. |
| 03 | Projects | A gallery of floating devices (phone or browser, picked from each project's stack/link) showing the project's name, description, highlights and stack. Click a device to travel to it. |
| 04 | Experience | A rail with a pylon per role, running from now back to your first year, then a honeycomb vault of certifications, leadership and education. |
| 05 | Contact | A transmitter beacon whose signal rings power up as you arrive. |

How it fits together:

- **Native scrolling drives everything.** Each page block carries a `data-anchor`; `components/world/scene/CameraRig.tsx` maps the viewport position between anchors to a camera pose from `lib/world/layout.ts`. There is no scroll-jacking, so keyboard, nav links, find-in-page and screen readers behave normally.
- **Text stays in the DOM.** All content is real HTML in glass panels beside (wide screens) or below (narrow screens) each station's focal object. The 3D layer repeats it visually but is `aria-hidden`.
- **Linked hover.** Hovering a focus area, skill group, project, role or credential in the text highlights its object in the scene, and vice versa (`lib/world/store.ts`).
- **Quality tiers.** Desktop GPUs get shadows and bloom; phones, low-memory devices and software renderers get a lighter scene. If the frame rate drops, the scene steps itself down. Append `?tier=high` or `?tier=low` to pin a tier.
- **Fallbacks.** Without WebGL2 (or with Data Saver on) the site shows a static backdrop with identical content. Visitors can switch to the flat view from the bottom-right toggle (or the mobile menu); the choice is remembered. `?mode=flat` forces it.
- **Reduced motion.** With `prefers-reduced-motion`, the camera cuts between stations instead of flying, and idle animation, pointer parallax and the typewriter stop.
- **Loading.** three.js loads only after the page has painted and fonts are ready, then fades in behind the content.

Palette: night navy world with the existing copper and teal accents plus the logo's gold. Type pairs Space Grotesk (display) with Inter (body) and JetBrains Mono (labels/data); in-world text is drawn with the same fonts.

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
  page.tsx              Public homepage — the world plus every section
  admin/                Admin login + dashboard (protected)
  api/admin/            Login, logout, content GET/PUT
components/
  Hero.tsx, About.tsx, Skills.tsx, Projects.tsx, Experience.tsx, Contact.tsx
                        Page sections (the DOM panels for each station)
  Navbar.tsx            Top nav with active-station highlight + mobile menu
  JourneyRail.tsx       Right-edge station rail, camera readout, 3D toggle
  world/
    World.tsx           Capability detection, deferred scene loading, fallbacks
    ui.tsx              AnchorBlock (one stop on the journey), glass panels
    scene/              Everything WebGL: Scene (canvas), CameraRig,
                        Environment (sky, floor, fog, lights, trail, particles),
                        one file per station, Bloom, canvas text textures
  admin/AdminDashboard.tsx  Tabbed content editor
data/content.json        Single source of truth for all site content
lib/
  content.ts             Reads/writes content.json
  auth.ts                Signed session cookie helpers
  types.ts               TypeScript schema for content.json
  world/layout.ts        Station positions + camera poses, derived from content
  world/store.ts         Shared DOM <-> scene state (hover links, station, mode)
middleware.ts            Protects /admin/dashboard and the content API
```

## Customizing further

- **Colors/fonts:** `tailwind.config.ts` (colors) and `app/layout.tsx` (fonts).
- **Add a section:** create a component in `components/` built from `AnchorBlock`s, add its data shape to `lib/types.ts` and `data/content.json`, render it in `app/page.tsx`, and add an editor tab in `components/admin/AdminDashboard.tsx`. To give it a place in the world, add a camera pose for its anchor id in `lib/world/layout.ts` and a station component under `components/world/scene/`.
- **Move things around in the world:** station positions and camera poses live in `lib/world/layout.ts`. `shift`/`shiftM` set where the focal point lands on screen so it sits beside (wide) or above (narrow) the text panel.
- **Projects with live links/screenshots:** add an `image` field to `ProjectItem` in `lib/types.ts`, drop images in `public/projects/`, and reference them with `next/image` in `components/Projects.tsx`.

## Security notes

- The admin password is a single shared secret (`ADMIN_PASSWORD`) — fine for a personal site with one editor. Don't reuse a password you use elsewhere.
- Sessions are signed JWTs stored in an HTTP-only cookie, valid for 7 days.
- `data/content.json` accepts arbitrary text — it's rendered as text/attributes, not executed, so there's no injection risk from editing it.
