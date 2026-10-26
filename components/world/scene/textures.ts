import { CanvasTexture, SRGBColorSpace } from "three";
import type { ExperienceItem, HeroContent, ProjectItem, SiteInfo } from "@/lib/types";
import type { Credential } from "@/lib/world/layout";

/**
 * Everything written inside the 3D world is drawn onto 2D canvases with the
 * site's own fonts, then uploaded as textures. No font files are fetched by
 * the 3D layer and all text comes straight from content.json.
 */

export const INK = {
  night: "#0A1020",
  panel: "#101A30",
  line: "rgba(244,239,230,0.12)",
  cream: "#F4EFE6",
  muted: "#9AA4B8",
  copper: "#E2662A",
  teal: "#4FB3BC",
  gold: "#D4A74A"
};

type Ctx = CanvasRenderingContext2D;

interface Fonts {
  display: string;
  body: string;
  mono: string;
}

let fontCache: Fonts | null = null;
function fonts(): Fonts {
  if (fontCache) return fontCache;
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  fontCache = {
    display: read("--font-display", "system-ui, sans-serif"),
    body: read("--font-body", "system-ui, sans-serif"),
    mono: read("--font-mono", "ui-monospace, monospace")
  };
  return fontCache;
}

function font(kind: keyof Fonts, size: number, weight = 400) {
  return `${weight} ${size}px ${fonts()[kind]}`;
}

export function makeTexture(width: number, height: number, draw: (ctx: Ctx, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Word-wraps text to `maxWidth`, ending with an ellipsis if it runs past `maxLines`. */
function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines = Infinity): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

function fit(ctx: Ctx, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function drawLines(ctx: Ctx, lines: string[], x: number, y: number, lineHeight: number) {
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

/** Draws pill chips left-to-right, wrapping; returns the y below the last row. */
function chips(ctx: Ctx, items: string[], x: number, y: number, maxWidth: number, size: number, color: string) {
  ctx.font = font("mono", size);
  ctx.textBaseline = "middle";
  const h = size * 1.9;
  const padX = size * 0.7;
  let cx = x;
  let cy = y;
  for (const item of items) {
    const w = ctx.measureText(item).width + padX * 2;
    if (cx + w > x + maxWidth && cx > x) {
      cx = x;
      cy += h + size * 0.5;
    }
    roundRect(ctx, cx, cy, w, h, h / 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK.cream;
    ctx.fillText(item, cx + padX, cy + h / 2 + 1);
    cx += w + size * 0.5;
  }
  ctx.textBaseline = "alphabetic";
  return cy + h;
}

function gridBackdrop(ctx: Ctx, w: number, h: number, step: number, alpha = 0.05) {
  ctx.save();
  ctx.strokeStyle = `rgba(244,239,230,${alpha})`;
  ctx.lineWidth = 1;
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function screenBackground(ctx: Ctx, w: number, h: number, accent: string) {
  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, "#0E1830");
  g.addColorStop(1, "#070C18");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.05, 0, w * 0.85, h * 0.05, w * 0.9);
  glow.addColorStop(0, `${accent}55`);
  glow.addColorStop(1, `${accent}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function statusBar(ctx: Ctx, w: number) {
  ctx.fillStyle = INK.cream;
  ctx.font = font("mono", 26, 500);
  ctx.fillText("9:41", 48, 58);
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(w - 150 + i * 12, 58 - 8 - i * 5, 7, 8 + i * 5);
  }
  roundRect(ctx, w - 88, 38, 44, 22, 6);
  ctx.strokeStyle = INK.cream;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillRect(w - 84, 42, 30, 14);
}

function hostOf(link: string) {
  try {
    return new URL(link).host;
  } catch {
    return "";
  }
}

export function phoneScreenTexture(project: ProjectItem, accent: string, index: number, total: number) {
  return makeTexture(600, 1240, (ctx, w, h) => {
    screenBackground(ctx, w, h, accent);
    statusBar(ctx, w);

    let y = 120;
    ctx.font = font("mono", 22, 500);
    const tag = project.tag.toUpperCase();
    const tagW = ctx.measureText(tag).width + 32;
    roundRect(ctx, 48, y, tagW, 42, 21);
    ctx.fillStyle = `${accent}26`;
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillText(tag, 64, y + 29);
    ctx.fillStyle = INK.muted;
    ctx.textAlign = "right";
    ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, w - 48, y + 29);
    ctx.textAlign = "left";

    y += 110;
    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 60, 600);
    y = drawLines(ctx, wrap(ctx, project.name, w - 96, 2), 48, y, 66);

    y += 10;
    const cardH = 330;
    const card = ctx.createLinearGradient(48, y, w - 48, y + cardH);
    card.addColorStop(0, `${accent}`);
    card.addColorStop(1, `${accent}66`);
    roundRect(ctx, 48, y, w - 96, cardH, 28);
    ctx.fillStyle = card;
    ctx.fill();
    ctx.fillStyle = "rgba(7,12,24,0.35)";
    ctx.fill();
    ctx.fillStyle = INK.cream;
    ctx.font = font("body", 27, 400);
    drawLines(ctx, wrap(ctx, project.description, w - 160, 8), 80, y + 58, 36);
    y += cardH + 56;

    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 22, 500);
    ctx.fillText("HIGHLIGHTS", 48, y);
    y += 22;
    for (const item of project.highlights.slice(0, 3)) {
      roundRect(ctx, 48, y, w - 96, 112, 22);
      ctx.fillStyle = "rgba(244,239,230,0.06)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(92, y + 56, 18, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(84, y + 56);
      ctx.lineTo(90, y + 63);
      ctx.lineTo(101, y + 49);
      ctx.stroke();
      ctx.fillStyle = INK.cream;
      ctx.font = font("body", 24, 400);
      const lines = wrap(ctx, item, w - 220, 2);
      drawLines(ctx, lines, 132, y + 56 - (lines.length - 1) * 15 + 8, 30);
      y += 128;
    }

    chips(ctx, project.stack, 48, Math.max(y + 10, 1020), w - 96, 21, accent);

    roundRect(ctx, w / 2 - 90, h - 34, 180, 8, 4);
    ctx.fillStyle = "rgba(244,239,230,0.5)";
    ctx.fill();
  });
}

export function browserScreenTexture(project: ProjectItem, accent: string, index: number, total: number) {
  return makeTexture(1280, 800, (ctx, w, h) => {
    screenBackground(ctx, w, h, accent);
    ctx.fillStyle = "#0B1324";
    ctx.fillRect(0, 0, w, 72);
    ["#ef5350", "#f2a93b", "#2fd9b8"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(40 + i * 30, 36, 9, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    roundRect(ctx, 260, 16, w - 520, 40, 20);
    ctx.fillStyle = "rgba(244,239,230,0.07)";
    ctx.fill();
    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 20);
    ctx.textAlign = "center";
    ctx.fillText(hostOf(project.link) || project.name.toLowerCase().replace(/\s+/g, "-"), w / 2, 43);
    ctx.textAlign = "left";

    const left = 72;
    let y = 150;
    ctx.font = font("mono", 22, 500);
    const tag = project.tag.toUpperCase();
    const tagW = ctx.measureText(tag).width + 32;
    roundRect(ctx, left, y - 30, tagW, 42, 21);
    ctx.fillStyle = `${accent}26`;
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillText(tag, left + 16, y - 1);
    ctx.fillStyle = INK.muted;
    ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, left + tagW + 20, y - 1);

    y += 90;
    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 76, 600);
    y = drawLines(ctx, wrap(ctx, project.name, 640, 2), left, y, 82);
    ctx.font = font("body", 28);
    ctx.fillStyle = "rgba(244,239,230,0.82)";
    y = drawLines(ctx, wrap(ctx, project.description, 640, 7), left, y + 20, 40);

    chips(ctx, project.stack, left, Math.min(Math.max(y + 30, 600), h - 110), 680, 22, accent);

    const cx = 820;
    let cy = 120;
    for (const item of project.highlights.slice(0, 3)) {
      roundRect(ctx, cx, cy, w - cx - 64, 150, 24);
      const g = ctx.createLinearGradient(cx, cy, w - 64, cy + 150);
      g.addColorStop(0, `${accent}40`);
      g.addColorStop(1, "rgba(244,239,230,0.04)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(cx + 28, cy + 30, 36, 4);
      ctx.fillStyle = INK.cream;
      ctx.font = font("body", 26);
      drawLines(ctx, wrap(ctx, item, w - cx - 128, 3), cx + 28, cy + 72, 34);
      cy += 172;
    }
  });
}

export function heroPhoneTexture(site: SiteInfo, hero: HeroContent) {
  const accent = INK.copper;
  return makeTexture(600, 1240, (ctx, w, h) => {
    screenBackground(ctx, w, h, accent);
    statusBar(ctx, w);
    const cx = w / 2;
    ctx.beginPath();
    ctx.arc(cx, 280, 110, 0, Math.PI * 2);
    const ring = ctx.createLinearGradient(cx - 110, 170, cx + 110, 390);
    ring.addColorStop(0, INK.copper);
    ring.addColorStop(1, INK.gold);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 84, 600);
    ctx.textAlign = "center";
    const initials = site.name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    ctx.fillText(initials, cx, 310);
    ctx.font = font("display", 50, 600);
    let y = drawLines(ctx, wrap(ctx, site.name, w - 96, 2), cx, 470, 58);
    ctx.fillStyle = accent;
    ctx.font = font("mono", 24, 500);
    y = drawLines(ctx, wrap(ctx, site.title, w - 96, 2), cx, y + 14, 32);
    ctx.textAlign = "left";

    y += 40;
    for (const role of hero.roles.slice(0, 4)) {
      roundRect(ctx, 48, y, w - 96, 84, 20);
      ctx.fillStyle = "rgba(244,239,230,0.06)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(88, y + 42, 8, 0, Math.PI * 2);
      ctx.fillStyle = INK.teal;
      ctx.fill();
      ctx.fillStyle = INK.cream;
      ctx.font = font("body", 26);
      ctx.fillText(fit(ctx, role, w - 180), 116, y + 51);
      y += 100;
    }
    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 20);
    ctx.textAlign = "center";
    drawLines(ctx, wrap(ctx, `${site.location}`, w - 96, 1), cx, Math.min(y + 40, h - 80), 28);
    ctx.textAlign = "left";
    roundRect(ctx, w / 2 - 90, h - 34, 180, 8, 4);
    ctx.fillStyle = "rgba(244,239,230,0.5)";
    ctx.fill();
  });
}

export function heroCodeTexture(site: SiteInfo, hero: HeroContent) {
  return makeTexture(1280, 800, (ctx, w, h) => {
    ctx.fillStyle = "#0A1222";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0D172B";
    ctx.fillRect(0, 0, w, 64);
    ["#ef5350", "#f2a93b", "#2fd9b8"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(36 + i * 28, 32, 8, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = "#132038";
    ctx.fillRect(150, 10, 220, 54);
    ctx.fillStyle = INK.copper;
    ctx.fillRect(150, 60, 220, 4);
    ctx.font = font("mono", 22);
    ctx.fillStyle = INK.cream;
    ctx.fillText("engineer.ts", 180, 44);

    const C = { key: "#8FB8FF", str: "#E8B36A", kw: "#E2662A", punc: "#9AA4B8", com: "#5D6B84" };
    type Tok = [string, string];
    const lines: Tok[][] = [
      [[`// ${hero.eyebrow.replace(/^\/\/\s*/, "")}`, C.com]],
      [["export const ", C.kw], ["engineer", C.key], [" = {", C.punc]],
      [["  name", C.key], [": ", C.punc], [`"${site.name}"`, C.str], [",", C.punc]],
      [["  title", C.key], [": ", C.punc], [`"${site.title}"`, C.str], [",", C.punc]],
      [["  based", C.key], [": ", C.punc], [`"${site.location}"`, C.str], [",", C.punc]],
      [["  roles", C.key], [": [", C.punc]],
      ...hero.roles.slice(0, 4).map((r): Tok[] => [[`    "${r}"`, C.str], [",", C.punc]]),
      [["  ]", C.punc], [",", C.punc]],
      [["  status", C.key], [": ", C.punc], [`"${site.availability}"`, C.str], [",", C.punc]],
      [["};", C.punc]]
    ];
    ctx.font = font("mono", 27);
    const lh = 44;
    lines.forEach((tokens, i) => {
      const y = 130 + i * lh;
      ctx.fillStyle = "#3A4A66";
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), 74, y);
      ctx.textAlign = "left";
      let x = 108;
      for (const [text, color] of tokens) {
        ctx.fillStyle = color;
        const t = fit(ctx, text, w - x - 40);
        ctx.fillText(t, x, y);
        x += ctx.measureText(t).width;
      }
    });
    const caretY = 130 + lines.length * lh;
    ctx.fillStyle = INK.copper;
    ctx.fillRect(108, caretY - 26, 14, 32);
  });
}

export function plateTexture(text: string, index: number, total: number, accent: string) {
  return makeTexture(1024, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    gridBackdrop(ctx, w, h, 64, 0.06);
    ctx.fillStyle = accent;
    ctx.font = font("mono", 40, 500);
    ctx.fillText(String(index + 1).padStart(2, "0"), 64, 110);
    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 26);
    ctx.textAlign = "right";
    ctx.fillText(`layer ${index + 1}/${total}`, w - 64, 106);
    ctx.textAlign = "left";
    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 74, 600);
    const lines = wrap(ctx, text, w - 128, 3);
    drawLines(ctx, lines, 64, h - 80 - (lines.length - 1) * 84, 84);
  });
}

export function pylonTexture(item: ExperienceItem, index: number) {
  return makeTexture(1024, 600, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(16,26,48,0.92)");
    g.addColorStop(1, "rgba(8,13,26,0.85)");
    roundRect(ctx, 4, 4, w - 8, h - 8, 36);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(244,239,230,0.16)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = INK.copper;
    ctx.fillRect(4, 80, 8, 120);

    ctx.font = font("mono", 30, 500);
    ctx.fillStyle = INK.muted;
    ctx.fillText(`${String(index + 1).padStart(2, "0")} · ${item.period}`, 64, 96);
    if (item.current) {
      ctx.fillStyle = INK.copper;
      ctx.textAlign = "right";
      ctx.fillText("● now", w - 64, 96);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 76, 600);
    let y = drawLines(ctx, wrap(ctx, item.company, w - 128, 2), 64, 210, 82);
    ctx.fillStyle = INK.teal;
    ctx.font = font("body", 40, 500);
    y = drawLines(ctx, wrap(ctx, item.role, w - 128, 2), 64, y + 10, 50);
    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 28);
    ctx.fillText(item.location, 64, Math.min(y + 30, h - 50));
  });
}

export function credentialTitle(c: Credential) {
  return c.kind === "cert" ? c.item.name : c.kind === "lead" ? c.item.role : c.item.degree;
}

export function credentialColor(c: Credential) {
  if (c.kind === "lead") return INK.copper;
  if (c.kind === "edu") return INK.gold;
  return /progress/i.test(c.item.year) ? INK.gold : INK.teal;
}

export function hexTexture(c: Credential) {
  const color = credentialColor(c);
  return makeTexture(512, 512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ctx.lineTo(cx + Math.cos(a) * 250, cy + Math.sin(a) * 250);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#14203A");
    g.addColorStop(1, "#0A1122");
    ctx.fillStyle = g;
    ctx.fill();

    const label = c.kind === "cert" ? "CERTIFICATION" : c.kind === "lead" ? "LEADERSHIP" : "EDUCATION";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = font("mono", 20, 500);
    ctx.fillText(label, cx, 150);

    ctx.fillStyle = INK.cream;
    ctx.font = font("display", 34, 600);
    const lines = wrap(ctx, credentialTitle(c), 330, 4);
    const top = cy - ((lines.length - 1) * 40) / 2 + 4;
    drawLines(ctx, lines, cx, top, 40);

    const meta =
      c.kind === "cert"
        ? [c.item.issuer, c.item.year].filter(Boolean).join(" · ")
        : c.kind === "lead"
          ? c.item.period
          : c.item.period;
    ctx.fillStyle = INK.muted;
    ctx.font = font("mono", 20);
    ctx.fillText(fit(ctx, meta, 300), cx, 400);
    ctx.textAlign = "left";
  });
}

export function labelTexture(
  text: string,
  { size = 44, color = INK.cream, mono = false, weight = 500 }: { size?: number; color?: string; mono?: boolean; weight?: number } = {}
) {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font(mono ? "mono" : "body", size, weight);
  const textW = Math.ceil(probe.measureText(text).width);
  const padX = Math.round(size * 0.6);
  const width = textW + padX * 2;
  const height = Math.round(size * 1.8);
  const texture = makeTexture(width, height, (ctx, w, h) => {
    roundRect(ctx, 2, 2, w - 4, h - 4, (h - 4) / 2);
    ctx.fillStyle = "rgba(8,13,26,0.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(244,239,230,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = font(mono ? "mono" : "body", size, weight);
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, padX, h / 2 + 2);
  });
  return { texture, aspect: width / height };
}

/** Soft white radial falloff, used for glows and contact shadows. */
export function radialTexture() {
  return makeTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}
