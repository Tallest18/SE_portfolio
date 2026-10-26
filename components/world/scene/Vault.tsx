"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  type Group,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3
} from "three";
import type { Credential, World } from "@/lib/world/layout";
import { focusOf, scrollToAnchor, world as worldStore } from "@/lib/world/store";
import { Glow, hoverProps, useCull } from "./common";
import { credentialColor, hexTexture } from "./textures";

/**
 * The credential vault at the end of the experience rail: certifications,
 * leadership and education as a honeycomb wall. Tiles drift in from the dark
 * and lock into place as the visitor arrives.
 */

const R = 0.98;
const GAP = 1.05;

export function Vault({
  world,
  credentials,
  animate,
  shadows
}: {
  world: World;
  credentials: Credential[];
  animate: boolean;
  shadows: boolean;
}) {
  const { pos, rotY } = world.vault;
  const root = useRef<Group>(null);
  const tiles = useRef<(Group | null)[]>([]);
  const hover = useRef<number[]>([]);
  useCull(root, pos);

  const geometry = useMemo(() => {
    const body = new CylinderGeometry(R, R, 0.16, 6, 1, false, Math.PI / 2).rotateX(Math.PI / 2);
    const face = new CircleGeometry(R * 0.95, 6);
    const outline = new BufferGeometry().setFromPoints(
      Array.from({ length: 7 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return new Vector3(Math.cos(a) * R * 0.985, Math.sin(a) * R * 0.985, 0.085);
      })
    );
    return { body, face, outline };
  }, []);

  const layout = useMemo(() => {
    // Flat-top honeycomb, two rows, columns left to right.
    const raw = credentials.map((_, k) => {
      const col = Math.floor(k / 2);
      const row = k % 2;
      return [col * 1.5 * R * GAP, -(row * Math.sqrt(3) * R + (col % 2) * (Math.sqrt(3) / 2) * R) * GAP];
    });
    const xs = raw.map((p) => p[0]);
    const ys = raw.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    return raw.map(([x, y]) => ({
      home: new Vector3(x - cx, y - cy, 0),
      scatter: new Vector3((rand() - 0.5) * 6, (rand() - 0.5) * 4, -2 - rand() * 6),
      phase: rand() * Math.PI * 2
    }));
  }, [credentials]);

  const items = useMemo(
    () =>
      credentials.map((c) => {
        const color = new Color(credentialColor(c));
        return {
          color,
          body: new MeshStandardMaterial({
            color: "#0D1528",
            metalness: 0.7,
            roughness: 0.3,
            emissive: color,
            emissiveIntensity: 0.05
          }),
          face: new MeshBasicMaterial({ map: hexTexture(c), toneMapped: false }),
          line: new LineBasicMaterial({ color: color.clone(), toneMapped: false })
        };
      }),
    [credentials]
  );

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const arrive = focusOf("credentials");
    const settle = arrive * arrive * (3 - 2 * arrive);
    const h = worldStore.get().highlight;
    items.forEach((item, k) => {
      const g = tiles.current[k];
      if (!g) return;
      const { home, scatter, phase } = layout[k];
      const hv = (hover.current[k] = MathUtils.damp(
        hover.current[k] ?? 0,
        h?.kind === "credential" && h.index === k ? 1 : 0,
        8,
        dt
      ));
      g.position.copy(home).addScaledVector(scatter, 1 - settle);
      g.position.z += hv * 0.45 + Math.sin(t * 0.9 + phase) * 0.05;
      g.rotation.y = (1 - settle) * (phase - Math.PI) * 0.5;
      g.scale.setScalar(1 + hv * 0.06);
      item.body.emissiveIntensity = 0.05 + hv * 0.6;
      item.line.color.copy(item.color).multiplyScalar(0.7 + settle * 0.8 + hv * 2);
      item.face.color.setScalar(0.45 + 0.55 * Math.max(settle, hv));
    });
  });

  return (
    <group ref={root} position={pos} rotation-y={rotY}>
      {items.map((item, k) => (
        <group
          key={k}
          ref={(el) => {
            tiles.current[k] = el;
          }}
          {...hoverProps("credential", k, () => scrollToAnchor("credentials"))}
        >
          <mesh geometry={geometry.body} material={item.body} castShadow={shadows} />
          <mesh geometry={geometry.face} material={item.face} position={[0, 0, 0.082]} />
          <lineLoop geometry={geometry.outline} material={item.line} />
        </group>
      ))}
      <Glow color="#4FB3BC" size={14} opacity={0.12} position={[0, 0, -1.5]} />
      <Glow color="#4FB3BC" size={12} opacity={0.22} position={[0, 0.03 - pos[1], 1]} flat />
    </group>
  );
}
