"use client";

import { useMemo, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, Color, type Object3D, type Texture } from "three";
import type { Vec3 } from "@/lib/world/layout";
import { setHighlight, type HighlightKind } from "@/lib/world/store";
import { radialTexture } from "./textures";

/** Hides a station when the camera is far away; fog has swallowed it anyway. */
export function useCull(ref: RefObject<Object3D>, center: Vec3, radius = 90) {
  useFrame(({ camera }) => {
    const o = ref.current;
    if (!o) return;
    const dx = camera.position.x - center[0];
    const dz = camera.position.z - center[2];
    o.visible = dx * dx + dz * dz < radius * radius;
  });
}

let glow: Texture | null = null;
export function glowTexture() {
  if (!glow) glow = radialTexture();
  return glow;
}

// Decorative meshes opt out of raycasting so they never steal hover/clicks.
const noRaycast = () => null;

/** Camera-facing soft light blob. Used for halos and fake contact light. */
export function Glow({
  color,
  size,
  opacity = 0.6,
  position = [0, 0, 0],
  flat = false
}: {
  color: string;
  size: number;
  opacity?: number;
  position?: Vec3;
  flat?: boolean;
}) {
  const c = useMemo(() => new Color(color), [color]);
  if (flat) {
    return (
      <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={2} raycast={noRaycast}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          map={glowTexture()}
          color={c}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    );
  }
  return (
    <sprite position={position} scale={[size, size, 1]} renderOrder={2} raycast={noRaycast}>
      <spriteMaterial
        map={glowTexture()}
        color={c}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

/** Pointer handlers that link a 3D object to its DOM counterpart via the shared highlight. */
export function hoverProps(kind: HighlightKind, index: number, onClick?: () => void) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHighlight(kind, index);
      document.body.style.cursor = onClick ? "pointer" : "";
    },
    onPointerOut: () => {
      setHighlight(kind, null);
      document.body.style.cursor = "";
    },
    onClick: onClick
      ? (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }
      : undefined
  };
}
