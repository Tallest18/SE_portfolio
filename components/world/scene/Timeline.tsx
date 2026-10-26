"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  type Group,
  type InstancedMesh,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D
} from "three";
import type { World } from "@/lib/world/layout";
import type { ExperienceItem } from "@/lib/types";
import { focusOf, scrollToAnchor, world as worldStore } from "@/lib/world/store";
import { Glow, hoverProps, useCull } from "./common";
import { INK, labelTexture, pylonTexture } from "./textures";

/**
 * Station 04 — experience. A rail laid across the floor with a pylon per
 * role; walking along it moves from the most recent role back to the first.
 * Each pylon carries a panel with the company, role and period.
 */

const H = 5;

function earliestYear(roles: ExperienceItem[]) {
  const years = roles.flatMap((r) => (r.period.match(/\b(?:19|20)\d{2}\b/g) ?? []).map(Number));
  return years.length ? String(Math.min(...years)) : "";
}

export function Timeline({
  world,
  roles,
  animate,
  shadows
}: {
  world: World;
  roles: ExperienceItem[];
  animate: boolean;
  shadows: boolean;
}) {
  const { pylons, railZ, railEnd } = world;
  const startX = 4;
  const endX = railEnd - 7;
  const length = startX - endX;
  const centerX = (startX + endX) / 2;
  const root = useRef<Group>(null);
  const tops = useRef<(Group | null)[]>([]);
  const ticks = useRef<InstancedMesh>(null);
  const hover = useRef<number[]>([]);
  useCull(root, [centerX, 0, railZ], 95);

  const column = useMemo(() => new BoxGeometry(0.5, H, 0.5), []);
  const columnEdges = useMemo(() => new EdgesGeometry(column), [column]);
  const items = useMemo(
    () =>
      roles.map((role, i) => {
        const accent = new Color(role.current ? INK.copper : INK.teal);
        return {
          accent,
          panel: new MeshBasicMaterial({
            map: pylonTexture(role, i),
            transparent: true,
            depthWrite: false,
            toneMapped: false
          }),
          edge: new LineBasicMaterial({ color: new Color(INK.teal), transparent: true, toneMapped: false }),
          top: new MeshStandardMaterial({
            color: "#140B06",
            emissive: accent,
            emissiveIntensity: 2,
            metalness: 0.5,
            roughness: 0.3
          })
        };
      }),
    [roles]
  );

  const ends = useMemo(() => {
    const first = earliestYear(roles);
    return {
      now: labelTexture("NOW", { size: 44, mono: true, color: INK.copper }),
      first: first ? labelTexture(first, { size: 44, mono: true, color: INK.teal }) : null
    };
  }, [roles]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const count = Math.floor(length);
    for (let i = 0; i < count; i++) {
      dummy.position.set(startX - i - 0.5, 0.03, railZ);
      dummy.scale.set(0.03, 0.02, i % 4 === 0 ? 0.7 : 0.35);
      dummy.updateMatrix();
      ticks.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ticks.current) ticks.current.instanceMatrix.needsUpdate = true;
  }, [length, railZ]);

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const overview = focusOf("experience");
    const h = worldStore.get().highlight;
    items.forEach((item, i) => {
      const f = focusOf(`role-${i}`);
      const hv = (hover.current[i] = MathUtils.damp(
        hover.current[i] ?? 0,
        h?.kind === "role" && h.index === i ? 1 : 0,
        8,
        dt
      ));
      const lit = Math.max(f, overview * 0.6, 0.25);
      item.panel.opacity = MathUtils.damp(item.panel.opacity, 0.3 + 0.7 * Math.max(lit, hv), 5, dt);
      item.edge.opacity = 0.25 + 0.75 * Math.max(f, hv);
      item.edge.color.set(INK.teal).multiplyScalar(0.6 + 2 * Math.max(f, hv));
      item.top.emissiveIntensity = 0.8 + 1.4 * lit + 1.2 * hv;
      const top = tops.current[i];
      if (top) {
        top.rotation.y = t * 0.8 + i;
        top.position.y = H + 0.75 + Math.sin(t * 1.3 + i) * 0.12;
      }
    });
  });

  return (
    <group ref={root}>
      <mesh position={[centerX, 0.025, railZ]}>
        <boxGeometry args={[length, 0.03, 0.07]} />
        <meshBasicMaterial color={new Color(INK.teal).multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
      <instancedMesh ref={ticks} args={[undefined, undefined, Math.floor(length)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={INK.teal} toneMapped={false} transparent opacity={0.6} />
      </instancedMesh>
      <mesh position={[startX - 1.2, 0.04, railZ + 1.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.55 * ends.now.aspect, 0.55]} />
        <meshBasicMaterial map={ends.now.texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      {ends.first && (
        <mesh position={[endX + 1.2, 0.04, railZ + 1.1]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.55 * ends.first.aspect, 0.55]} />
          <meshBasicMaterial map={ends.first.texture} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      {items.map((item, i) => {
        const [px, , pz] = pylons[i].pos;
        const side = pylons[i].side;
        return (
          <group key={i} position={[px, 0, pz]} {...hoverProps("role", i, () => scrollToAnchor(`role-${i}`))}>
            <mesh geometry={column} position={[0, H / 2, 0]} castShadow={shadows}>
              <meshStandardMaterial color="#18223A" metalness={0.6} roughness={0.4} emissive="#0E1A30" />
            </mesh>
            <lineSegments geometry={columnEdges} material={item.edge} position={[0, H / 2, 0]} />
            <group
              ref={(el) => {
                tops.current[i] = el;
              }}
              position={[0, H + 0.75, 0]}
            >
              <mesh material={item.top} castShadow={shadows}>
                <octahedronGeometry args={[0.34, 0]} />
              </mesh>
              <Glow color={item.accent.getStyle()} size={2.6} opacity={0.4} />
            </group>
            <mesh position={[2.15 * side, 3.3, 0.35]} rotation-y={-0.12 * side} material={item.panel}>
              <planeGeometry args={[3.5, 2.05]} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
              <ringGeometry args={[0.55, 0.62, 48]} />
              <meshBasicMaterial color={item.accent} toneMapped={false} transparent opacity={0.8} />
            </mesh>
            <Glow color={item.accent.getStyle()} size={3.2} opacity={0.3} position={[0, 0.03, 0]} flat />
          </group>
        );
      })}
    </group>
  );
}
