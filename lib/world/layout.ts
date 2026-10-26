import type {
  CertificationItem,
  EducationItem,
  LeadershipItem,
  PortfolioContent,
  ProjectItem
} from "@/lib/types";

/**
 * World layout: where every station sits in 3D space and where the camera
 * stands to look at it. Everything is derived from content counts, so adding
 * a project or role in the admin panel grows the world instead of breaking it.
 *
 * The camera travels roughly down -Z: gate → layer stack → constellation →
 * project gallery → experience rail (turning west along -X) → credential
 * vault → contact beacon.
 */

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export interface Pose {
  /** Camera position. */
  pos: Vec3;
  /** Point the camera looks at (the station's focal point). */
  look: Vec3;
  /** Where `look` lands on screen, in NDC, on wide (side-by-side) layouts. */
  shift: Vec2;
  /** Same, on narrow layouts where panels stack below the scene. */
  shiftM: Vec2;
  /** Narrow layouts see less horizontally, so the camera backs off by this factor. */
  pullM?: number;
}

export type StationId = "top" | "about" | "skills" | "projects" | "experience" | "contact";

export const STATIONS: { id: StationId; label: string; href: string }[] = [
  { id: "top", label: "start", href: "#top" },
  { id: "about", label: "about", href: "#about" },
  { id: "skills", label: "stack", href: "#skills" },
  { id: "projects", label: "projects", href: "#projects" },
  { id: "experience", label: "experience", href: "#experience" },
  { id: "contact", label: "contact", href: "#contact" }
];

export const ACCENTS = ["#E2662A", "#4FB3BC", "#D4A74A"] as const;

export function isPhoneProject(project: ProjectItem): boolean {
  return (
    /react native|flutter|expo|android|ios/i.test(project.stack.join(" ")) ||
    /play\.google\.com|apps\.apple\.com/i.test(project.link)
  );
}

export type Credential =
  | { kind: "cert"; item: CertificationItem }
  | { kind: "lead"; item: LeadershipItem }
  | { kind: "edu"; item: EducationItem };

/** Certifications, leadership and education as one list; the vault tiles and DOM share these indices. */
export function buildCredentials(content: PortfolioContent): Credential[] {
  return [
    ...content.certifications.items.map((item) => ({ kind: "cert" as const, item })),
    ...content.leadership.items.map((item) => ({ kind: "lead" as const, item })),
    ...content.education.items.map((item) => ({ kind: "edu" as const, item }))
  ];
}

export function stationOfAnchor(id: string): StationId {
  if (id === "hero") return "top";
  if (id.startsWith("project")) return "projects";
  if (id === "experience" || id.startsWith("role-") || id === "credentials") return "experience";
  return id as StationId;
}

export type World = ReturnType<typeof buildWorld>;

export function buildWorld(content: PortfolioContent) {
  const projects = content.projects.items;
  const roles = content.experience.items;

  const gate = { pos: [0, 3.4, 0] as Vec3, radius: 3.2 };
  const stack = { pos: [-7.5, 2.7, -23] as Vec3 };
  const constellation = { pos: [8.5, 4, -46] as Vec3 };

  const GALLERY_Z = -70;
  // The camera stands further back from a (wider) browser, so it needs a longer gap
  // in front of it; otherwise the previous exhibit is still beside the camera.
  const GALLERY_GAP = { phone: 9, browser: 15 };
  let z = GALLERY_Z;
  const screens = projects.map((project, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const kind = isPhoneProject(project) ? ("phone" as const) : ("browser" as const);
    if (i > 0) z -= GALLERY_GAP[kind];
    return {
      side,
      kind,
      pos: [side * (kind === "phone" ? 2.8 : 3.7), 2.8, z] as Vec3,
      rotY: -side * 0.3
    };
  });
  const galleryEnd = z;

  const RAIL_Z = galleryEnd - 24;
  const PYLON_GAP = 8;
  const pylons = roles.map((_, i) => ({ pos: [-4 - i * PYLON_GAP, 0, RAIL_Z] as Vec3, side: i % 2 === 0 ? 1 : -1 }));
  const railEnd = -4 - Math.max(0, roles.length - 1) * PYLON_GAP;

  const vault = { pos: [railEnd - 13, 3.4, RAIL_Z - 9] as Vec3, rotY: 0.4 };
  const beacon = { pos: [vault.pos[0] + 3, 0, RAIL_Z - 44] as Vec3 };

  const poses: Record<string, Pose> = {
    hero: { pos: [0, 2.9, 11.5], look: [0, 3.2, 0], shift: [0.34, 0], shiftM: [0, 0.4], pullM: 1.25 },
    about: { pos: [-1.6, 5.6, -12.5], look: [-7.5, 2.7, -23], shift: [-0.34, 0.02], shiftM: [0, 0.4], pullM: 1.25 },
    skills: { pos: [1.4, 5.4, -29], look: [8.5, 4, -46], shift: [0.4, 0], shiftM: [0, 0.38], pullM: 1.25 },
    projects: {
      pos: [0, 6.5, GALLERY_Z + 18],
      look: [0, 2.6, GALLERY_Z - 12],
      shift: [0.26, 0],
      shiftM: [0, 0.3]
    },
    experience: {
      pos: [4, 7.5, RAIL_Z + 16],
      look: [(railEnd - 4) / 2, 3, RAIL_Z],
      shift: [0.24, 0],
      shiftM: [0, 0.3],
      pullM: 1.2
    },
    credentials: {
      pos: [
        vault.pos[0] + Math.sin(vault.rotY) * 15,
        4,
        vault.pos[2] + Math.cos(vault.rotY) * 15
      ],
      look: vault.pos,
      shift: [0.46, 0],
      shiftM: [0, 0.36],
      pullM: 1.35
    },
    contact: {
      pos: [beacon.pos[0], 2.2, beacon.pos[2] + 20],
      look: [beacon.pos[0], 6.8, beacon.pos[2]],
      shift: [0, 0.12],
      shiftM: [0, 0.3]
    }
  };

  screens.forEach((s, i) => {
    poses[`project-${i}`] = {
      pos: [0, 3, s.pos[2] + (s.kind === "browser" ? 11 : 7.5)],
      look: [s.pos[0] * 0.95, 2.8, s.pos[2]],
      shift: [s.side * 0.3, 0],
      shiftM: [0, 0.36],
      pullM: s.kind === "browser" ? 1.3 : 1.1
    };
  });

  pylons.forEach((p, i) => {
    // Even roles: text panel on the left, pylon + its in-world label on the right. Odd: mirrored.
    const side = p.side;
    poses[`role-${i}`] = {
      pos: [p.pos[0] + 2.4 * side, 3.4, RAIL_Z + 9.5],
      look: [p.pos[0] + 0.9 * side, 3.3, RAIL_Z],
      shift: [0.3 * side, 0],
      shiftM: [0, 0.36],
      pullM: 1.25
    };
  });

  /** Anchor ids in the order they appear on the page. */
  const order = [
    "hero",
    "about",
    "skills",
    "projects",
    ...screens.map((_, i) => `project-${i}`),
    "experience",
    ...pylons.map((_, i) => `role-${i}`),
    "credentials",
    "contact"
  ];

  return { gate, stack, constellation, screens, pylons, railZ: RAIL_Z, railEnd, vault, beacon, poses, order };
}
