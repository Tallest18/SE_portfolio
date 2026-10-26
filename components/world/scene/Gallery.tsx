"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, MathUtils, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ACCENTS, type World } from "@/lib/world/layout";
import type { ProjectItem } from "@/lib/types";
import { focusOf, runtime, scrollToAnchor, world as worldStore } from "@/lib/world/store";
import { Glow, hoverProps, useCull } from "./common";
import { browserScreenTexture, phoneScreenTexture } from "./textures";

/**
 * Station 03 — projects. A gallery of floating devices along the path, one
 * per project, each showing the project's real name, description, highlights
 * and stack. The device in front of the visitor is lit; the rest wait in the
 * fog. Clicking a device travels to it.
 */

const SIZES = {
  phone: { body: [1.95, 3.95, 0.16, 0.2], screen: [1.8, 3.72] },
  browser: { body: [5.2, 3.3, 0.12, 0.12], screen: [5.04, 3.15] }
} as const;

export function Gallery({
  world,
  projects,
  animate,
  shadows
}: {
  world: World;
  projects: ProjectItem[];
  animate: boolean;
  shadows: boolean;
}) {
  const root = useRef<Group>(null);
  const devices = useRef<(Group | null)[]>([]);
  const hover = useRef<number[]>([]);
  const mid = world.screens.length
    ? world.screens[Math.floor(world.screens.length / 2)].pos
    : world.poses.projects.look;
  useCull(root, mid, 110);

  const geometries = useMemo(() => {
    const make = ([w, h, d, r]: readonly number[]) => new RoundedBoxGeometry(w, h, d, 4, r);
    return { phone: make(SIZES.phone.body), browser: make(SIZES.browser.body) };
  }, []);

  const items = useMemo(
    () =>
      projects.map((project, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        const screen = world.screens[i];
        const texture =
          screen.kind === "phone"
            ? phoneScreenTexture(project, accent, i, projects.length)
            : browserScreenTexture(project, accent, i, projects.length);
        return {
          screen,
          accent: new Color(accent),
          accentHex: accent,
          display: new MeshBasicMaterial({ map: texture, toneMapped: false }),
          frame: new MeshStandardMaterial({
            color: "#0A0F1C",
            metalness: 0.85,
            roughness: 0.3,
            emissive: new Color(accent),
            emissiveIntensity: 0
          }),
          beam: new MeshBasicMaterial({ color: new Color(accent), transparent: true, toneMapped: false })
        };
      }),
    [projects, world.screens]
  );

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const overview = focusOf("projects");
    const h = worldStore.get().highlight;
    items.forEach((item, i) => {
      const g = devices.current[i];
      if (!g) return;
      const f = focusOf(`project-${i}`);
      const hv = (hover.current[i] = MathUtils.damp(
        hover.current[i] ?? 0,
        h?.kind === "project" && h.index === i ? 1 : 0,
        8,
        dt
      ));
      const lit = Math.max(f, overview * 0.55, 0.22);
      const { side, rotY, pos } = item.screen;

      g.position.set(pos[0] - side * f * 0.35, pos[1] + Math.sin(t * 0.8 + i * 1.7) * 0.07, pos[2] + f * 0.4);
      // Turn to face the visitor as they arrive, with a little pointer tilt when active.
      const px = animate ? runtime.pointer.x : 0;
      const py = animate ? runtime.pointer.y : 0;
      g.rotation.y = MathUtils.damp(g.rotation.y, rotY * (1 - 0.45 * f) + px * 0.12 * f, 4, dt);
      g.rotation.x = MathUtils.damp(g.rotation.x, -py * 0.06 * f, 4, dt);
      g.scale.setScalar(1 + hv * 0.04);

      item.display.color.setScalar(0.35 + 0.65 * lit);
      item.frame.emissiveIntensity = 0.04 + f * 0.22 + hv * 0.6;
      item.beam.color.copy(item.accent).multiplyScalar(0.5 + lit * 2 + hv * 2);
      item.beam.opacity = 0.25 + lit * 0.6;
    });
  });

  return (
    <group ref={root}>
      {items.map((item, i) => {
        const { kind, pos } = item.screen;
        const size = SIZES[kind];
        const bottom = pos[1] - size.body[1] / 2;
        return (
          <group key={i}>
            <group
              ref={(el) => {
                devices.current[i] = el;
              }}
              position={pos}
              rotation-y={item.screen.rotY}
              {...hoverProps("project", i, () => scrollToAnchor(`project-${i}`))}
            >
              <mesh geometry={geometries[kind]} material={item.frame} castShadow={shadows} />
              <mesh position={[0, 0, size.body[2] / 2 + 0.004]} material={item.display}>
                <planeGeometry args={[size.screen[0], size.screen[1]]} />
              </mesh>
              <Glow color={item.accentHex} size={size.body[0] * 2.2 + 2} opacity={0.2} position={[0, 0, -0.5]} />
            </group>

            {/* Pedestal: a lit disc on the floor with a thin beam up to the device. */}
            <group position={[pos[0], 0, pos[2]]}>
              <mesh position={[0, 0.12, 0]} receiveShadow={shadows} castShadow={shadows}>
                <cylinderGeometry args={[0.95, 1.15, 0.24, 48]} />
                <meshStandardMaterial color="#0C1426" metalness={0.7} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.245, 0]} rotation-x={-Math.PI / 2} material={item.beam}>
                <ringGeometry args={[0.7, 0.8, 64]} />
              </mesh>
              <mesh position={[0, (bottom + 0.25) / 2, 0]} material={item.beam}>
                <cylinderGeometry args={[0.012, 0.012, Math.max(0.01, bottom - 0.25), 6]} />
              </mesh>
              <Glow color={item.accentHex} size={4.5} opacity={0.3} position={[0, 0.03, 0]} flat />
            </group>
          </group>
        );
      })}
    </group>
  );
}
