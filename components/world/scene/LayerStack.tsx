"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  type Group,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ACCENTS, type World } from "@/lib/world/layout";
import { focusOf, offsetOf, world as worldStore } from "@/lib/world/store";
import { Glow, hoverProps, useCull } from "./common";
import { INK, plateTexture } from "./textures";

/**
 * Station 01 — about. The focus areas as a stack of glass layers (mobile,
 * web, API, ...). The stack fans open as the visitor arrives, and hovering a
 * focus area in the text lifts its layer out of the stack.
 */

const W = 4.2;
const D = 2.6;
const T = 0.1;

export function LayerStack({
  world,
  focusAreas,
  animate,
  shadows
}: {
  world: World;
  focusAreas: string[];
  animate: boolean;
  shadows: boolean;
}) {
  const { pos } = world.stack;
  const cam = world.poses.about.pos;
  const yaw = Math.atan2(cam[0] - pos[0], cam[2] - pos[2]);
  const n = focusAreas.length;

  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const plates = useRef<(Group | null)[]>([]);
  const lift = useRef<number[]>([]);
  useCull(root, pos);

  const slab = useMemo(() => new RoundedBoxGeometry(W, T, D, 2, 0.04), []);
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(W, T, D)), []);
  const layers = useMemo(
    () =>
      focusAreas.map((text, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        return {
          accent: new Color(accent),
          body: new MeshStandardMaterial({
            color: "#0F1A33",
            transparent: true,
            opacity: 0.78,
            metalness: 0.35,
            roughness: 0.22,
            emissive: new Color(accent),
            emissiveIntensity: 0
          }),
          edge: new LineBasicMaterial({ color: new Color(accent), transparent: true, toneMapped: false }),
          label: new MeshBasicMaterial({
            map: plateTexture(text, i, focusAreas.length, accent),
            transparent: true,
            depthWrite: false,
            toneMapped: false
          })
        };
      }),
    [focusAreas]
  );

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const arrive = focusOf("about");
    const h = worldStore.get().highlight;
    const active = h?.kind === "focus" ? h.index : -1;
    const gap = 0.55 + 0.45 * arrive;

    if (spin.current) {
      spin.current.rotation.y = Math.sin(t * 0.25) * 0.1 + MathUtils.clamp(offsetOf("about"), -1, 1) * 0.45;
    }

    layers.forEach((layer, i) => {
      const g = plates.current[i];
      if (!g) return;
      lift.current[i] = MathUtils.damp(lift.current[i] ?? 0, active === i ? 1 : 0, 6, dt);
      const l = lift.current[i];
      const glow = active === -1 ? 0.45 + 0.2 * arrive : active === i ? 1 : 0.18;
      g.position.set(0, ((n - 1) / 2 - i) * gap + Math.sin(t * 0.8 + i * 0.9) * 0.035, l * 1.1);
      layer.body.emissiveIntensity = MathUtils.damp(layer.body.emissiveIntensity, glow * 0.35, 6, dt);
      layer.edge.color.copy(layer.accent).multiplyScalar(0.6 + glow * 2.4);
      layer.edge.opacity = 0.35 + glow * 0.65;
      layer.label.opacity = MathUtils.damp(layer.label.opacity, 0.35 + glow * 0.65, 6, dt);
    });
  });

  const height = (n - 1) * 1 + 1.6;

  return (
    <group ref={root} position={pos} rotation-y={yaw}>
      <group ref={spin}>
        <group rotation-x={0.55}>
          {layers.map((layer, i) => (
            <group
              key={i}
              ref={(el) => {
                plates.current[i] = el;
              }}
            >
              <mesh geometry={slab} material={layer.body} castShadow={shadows} {...hoverProps("focus", i)} />
              <lineSegments geometry={edges} material={layer.edge} />
              <mesh rotation-x={-Math.PI / 2} position={[0, T / 2 + 0.006, 0]} material={layer.label}>
                <planeGeometry args={[W - 0.12, D - 0.1]} />
              </mesh>
            </group>
          ))}
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, height, 8]} />
            <meshBasicMaterial color={INK.teal} toneMapped={false} transparent opacity={0.7} />
          </mesh>
          <Glow color={INK.teal} size={5.5} opacity={0.2} />
        </group>
      </group>
      <Glow color={INK.teal} size={7} opacity={0.22} position={[0, 0.03 - pos[1], 0]} flat />
    </group>
  );
}
