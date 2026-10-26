"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  MathUtils,
  type Mesh,
  Object3D,
  ShaderMaterial
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { World } from "@/lib/world/layout";
import type { PortfolioContent } from "@/lib/types";
import { offsetOf, runtime } from "@/lib/world/store";
import { Glow, useCull } from "./common";
import { INK, heroCodeTexture, heroPhoneTexture } from "./textures";

/**
 * Station 00 — the gate. A ring the visitor flies through on the first
 * scroll, framing a phone and a code window that carry the hero's real
 * name, title and roles. The devices part like doors as the visitor leaves.
 */

const portalFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  uniform vec3 uA;
  uniform vec3 uB;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float ang = atan(p.y, p.x);
    float swirl = sin(ang * 5.0 + r * 9.0 - uTime * 0.7) * 0.5 + 0.5;
    float rings = sin(r * 26.0 - uTime * 1.4) * 0.5 + 0.5;
    vec3 col = mix(uB, uA, smoothstep(0.2, 1.0, r));
    float edge = smoothstep(1.0, 0.86, r);
    float a = edge * (0.05 + 0.32 * smoothstep(0.1, 1.0, r) * (0.4 + 0.6 * swirl * rings)) * (1.0 - uOpen);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

const portalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function Gate({
  world,
  content,
  animate,
  shadows
}: {
  world: World;
  content: PortfolioContent;
  animate: boolean;
  shadows: boolean;
}) {
  const { pos, radius } = world.gate;
  const root = useRef<Group>(null);
  const outer = useRef<Group>(null);
  const phone = useRef<Group>(null);
  const code = useRef<Group>(null);
  const ticks = useRef<InstancedMesh>(null);
  const ring = useRef<Mesh>(null);
  useCull(root, pos, 70);

  const phoneTex = useMemo(() => heroPhoneTexture(content.site, content.hero), [content.site, content.hero]);
  const codeTex = useMemo(() => heroCodeTexture(content.site, content.hero), [content.site, content.hero]);
  const phoneBody = useMemo(() => new RoundedBoxGeometry(1.56, 3.16, 0.14, 4, 0.17), []);
  const codeBody = useMemo(() => new RoundedBoxGeometry(4.2, 2.68, 0.1, 4, 0.1), []);

  const portal = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: portalVertex,
        fragmentShader: portalFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpen: { value: 0 },
          uA: { value: new Color(INK.copper).multiplyScalar(1.4) },
          uB: { value: new Color(INK.teal) }
        }
      }),
    []
  );

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const n = 72;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const long = i % 6 === 0;
      dummy.position.set(Math.cos(a) * (radius + 0.62), Math.sin(a) * (radius + 0.62), 0);
      dummy.rotation.set(0, 0, a);
      dummy.scale.set(long ? 0.34 : 0.14, 0.02, 0.02);
      dummy.updateMatrix();
      ticks.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ticks.current) ticks.current.instanceMatrix.needsUpdate = true;
  }, [radius]);

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0;
    // 0 while parked at the hero, 1 once the visitor has moved on.
    const open = MathUtils.clamp(offsetOf("hero") * 1.4, 0, 1);
    const ease = open * open * (3 - 2 * open);
    const px = animate ? runtime.pointer.x : 0;
    const py = animate ? runtime.pointer.y : 0;

    portal.uniforms.uTime.value = t;
    portal.uniforms.uOpen.value = ease;
    if (outer.current) outer.current.rotation.z = t * 0.06;
    if (ring.current) ring.current.rotation.z = -t * 0.03;

    if (phone.current) {
      phone.current.position.set(-1.45 - ease * 4.2, 3.0 + Math.sin(t * 0.9) * 0.08, 1.1 + ease * 1.5);
      phone.current.rotation.set(
        MathUtils.damp(phone.current.rotation.x, -py * 0.12, 3, dt),
        MathUtils.damp(phone.current.rotation.y, 0.38 + ease * 0.9 + px * 0.2, 3, dt),
        -0.04
      );
    }
    if (code.current) {
      code.current.position.set(1.45 + ease * 5, 3.75 + Math.sin(t * 0.7 + 1.3) * 0.07, -0.7 + ease * 0.8);
      code.current.rotation.set(
        MathUtils.damp(code.current.rotation.x, -py * 0.08, 3, dt),
        MathUtils.damp(code.current.rotation.y, -0.26 - ease * 0.8 + px * 0.15, 3, dt),
        0.02
      );
    }
  });

  return (
    <group ref={root} position={[pos[0], 0, pos[2]]}>
      <group position={[0, pos[1], 0]}>
        <mesh ref={ring} castShadow={shadows}>
          <torusGeometry args={[radius, 0.075, 20, 220]} />
          <meshStandardMaterial
            color="#1A0E07"
            emissive={INK.copper}
            emissiveIntensity={2.6}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[radius - 0.22, 0.012, 8, 220]} />
          <meshBasicMaterial color={INK.teal} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <group ref={outer}>
          <mesh>
            <torusGeometry args={[radius + 0.42, 0.01, 8, 220]} />
            <meshBasicMaterial color={INK.gold} toneMapped={false} transparent opacity={0.65} />
          </mesh>
          <instancedMesh ref={ticks} args={[undefined, undefined, 72]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={INK.gold} toneMapped={false} transparent opacity={0.7} />
          </instancedMesh>
        </group>
        <mesh material={portal} renderOrder={3}>
          <circleGeometry args={[radius - 0.05, 96]} />
        </mesh>
        <Glow color={INK.copper} size={radius * 4.2} opacity={0.18} />
      </group>

      <group ref={phone}>
        <mesh geometry={phoneBody} castShadow={shadows}>
          <meshStandardMaterial color="#0A0F1C" metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[1.44, 2.98]} />
          <meshBasicMaterial map={phoneTex} toneMapped={false} />
        </mesh>
        <Glow color={INK.copper} size={4.2} opacity={0.22} position={[0, 0, -0.3]} />
      </group>

      <group ref={code}>
        <mesh geometry={codeBody} castShadow={shadows}>
          <meshStandardMaterial color="#0A0F1C" metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0, 0.052]}>
          <planeGeometry args={[4.06, 2.54]} />
          <meshBasicMaterial map={codeTex} toneMapped={false} />
        </mesh>
        <Glow color={INK.teal} size={6} opacity={0.16} position={[0, 0, -0.4]} />
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 0]}>
        <planeGeometry args={[radius * 2.6, 0.07]} />
        <meshBasicMaterial color={INK.copper} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <Glow color={INK.copper} size={radius * 3.4} opacity={0.35} position={[0, 0.03, 0]} flat />
    </group>
  );
}
