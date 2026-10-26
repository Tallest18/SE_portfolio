"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, MathUtils, MeshBasicMaterial, SpriteMaterial } from "three";
import { ACCENTS, type World } from "@/lib/world/layout";
import type { SkillGroup } from "@/lib/types";
import { focusOf, offsetOf, world as worldStore } from "@/lib/world/store";
import { Glow, hoverProps, useCull } from "./common";
import { INK, labelTexture } from "./textures";

/**
 * Station 02 — stack. Each skill group is an orbit around a shared core,
 * every technology a node on its orbit. Orbits brighten when their group is
 * hovered here or in the text panel; the whole system turns as you pass.
 */

const LABEL_H = 0.36;

export function Constellation({
  world,
  groups,
  animate
}: {
  world: World;
  groups: SkillGroup[];
  animate: boolean;
}) {
  const { pos } = world.constellation;
  const cam = world.poses.skills.pos;
  const yaw = Math.atan2(cam[0] - pos[0], cam[2] - pos[2]);
  const root = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const spins = useRef<(Group | null)[]>([]);
  const titles = useRef<(SpriteMaterial | null)[]>([]);
  const emphasis = useRef<number[]>([]);
  useCull(root, pos);

  const orbits = useMemo(
    () =>
      groups.map((group, gi) => {
        const accent = new Color(ACCENTS[gi % ACCENTS.length]);
        const radius = 1.7 + gi * 0.68;
        return {
          radius,
          accent,
          // Mostly facing the visitor (like an atom diagram) so labels spread over the disc.
          tilt: [(gi % 2 ? 0.5 : -0.42) + gi * 0.04, (gi - (groups.length - 1) / 2) * 0.32, gi * 0.7] as [
            number,
            number,
            number
          ],
          speed: (gi % 2 ? 1 : -1) * (0.06 + gi * 0.012),
          ring: new MeshBasicMaterial({ color: accent.clone(), transparent: true, toneMapped: false }),
          node: new MeshBasicMaterial({ color: accent.clone(), toneMapped: false }),
          title: labelTexture(`${group.name} · ${group.items.length}`, { size: 40, mono: true, color: INK.cream }),
          nodes: group.items.map((name, k) => {
            const a = (k / group.items.length) * Math.PI * 2 + gi * 0.9;
            const label = labelTexture(name, { size: 40 });
            return {
              name,
              position: [Math.cos(a) * radius, Math.sin(a) * radius, 0] as [number, number, number],
              labelPosition: [Math.cos(a) * (radius + 0.28), Math.sin(a) * (radius + 0.28) + 0.26, 0] as [
                number,
                number,
                number
              ],
              label,
              material: new SpriteMaterial({ map: label.texture, transparent: true, depthWrite: false, toneMapped: false })
            };
          })
        };
      }),
    [groups]
  );

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const arrive = focusOf("skills");
    const h = worldStore.get().highlight;
    const active = h?.kind === "skill" ? h.index : -1;

    if (turn.current) {
      turn.current.rotation.y = MathUtils.clamp(offsetOf("skills"), -1.2, 1.2) * 0.8 + Math.sin(t * 0.2) * 0.12;
    }

    orbits.forEach((orbit, gi) => {
      const target = active === -1 ? 0.55 + 0.25 * arrive : active === gi ? 1 : 0.12;
      const e = (emphasis.current[gi] = MathUtils.damp(emphasis.current[gi] ?? 0.5, target, 5, dt));
      const spin = spins.current[gi];
      if (spin && animate) spin.rotation.z += orbit.speed * dt;
      orbit.ring.opacity = 0.12 + e * 0.75;
      orbit.ring.color.copy(orbit.accent).multiplyScalar(0.6 + e * 1.8);
      orbit.node.color.copy(orbit.accent).multiplyScalar(0.7 + e * 2.6);
      for (const node of orbit.nodes) node.material.opacity = 0.15 + e * 0.85;
      const title = titles.current[gi];
      if (title) title.opacity = MathUtils.damp(title.opacity, active === gi ? 1 : 0, 8, dt);
    });
  });

  return (
    <group ref={root} position={pos} rotation-y={yaw}>
      <group ref={turn}>
        <mesh>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshBasicMaterial color={INK.copper} wireframe transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.42, 32, 16]} />
          <meshStandardMaterial color="#0B1222" emissive={INK.teal} emissiveIntensity={3} />
        </mesh>
        <Glow color={INK.teal} size={4.5} opacity={0.4} />

        {orbits.map((orbit, gi) => (
          <group key={gi} rotation={orbit.tilt}>
            <mesh material={orbit.ring}>
              <torusGeometry args={[orbit.radius, 0.012, 6, 180]} />
            </mesh>
            {/* Wide invisible torus so a thin orbit is still easy to hover. */}
            <mesh {...hoverProps("skill", gi)}>
              <torusGeometry args={[orbit.radius, 0.22, 6, 64]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
            <group
              ref={(el) => {
                spins.current[gi] = el;
              }}
            >
              {orbit.nodes.map((node) => (
                <group key={node.name}>
                  <mesh position={node.position} material={orbit.node} {...hoverProps("skill", gi)}>
                    <sphereGeometry args={[0.1, 16, 12]} />
                  </mesh>
                  <sprite
                    position={node.labelPosition}
                    scale={[LABEL_H * node.label.aspect, LABEL_H, 1]}
                    material={node.material}
                    renderOrder={4}
                  />
                </group>
              ))}
            </group>
          </group>
        ))}
      </group>

      {orbits.map((orbit, gi) => (
        <sprite key={gi} position={[0, 1.35, 0]} scale={[0.46 * orbit.title.aspect, 0.46, 1]} renderOrder={5}>
          <spriteMaterial
            ref={(m) => {
              titles.current[gi] = m;
            }}
            map={orbit.title.texture}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </sprite>
      ))}
      <Glow color={INK.teal} size={10} opacity={0.18} position={[0, 0.03 - pos[1], 0]} flat />
    </group>
  );
}
