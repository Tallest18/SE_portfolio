"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  type MeshStandardMaterial,
  ShaderMaterial
} from "three";
import type { World } from "@/lib/world/layout";
import { focusOf } from "@/lib/world/store";
import { Glow, useCull } from "./common";
import { INK } from "./textures";

/**
 * Station 05 — contact. A transmitter at the end of the path: a mast with a
 * lit core, a beam into the sky, and signal rings rolling out across the
 * floor. It powers up as the visitor arrives.
 */

const MAST = 9;
const CORE_Y = MAST + 0.8;

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    float fall = pow(1.0 - vUv.y, 2.2);
    gl_FragColor = vec4(uColor, facing * fall * uPower);
    #include <colorspace_fragment>
  }
`;

export function Beacon({ world, animate, shadows }: { world: World; animate: boolean; shadows: boolean }) {
  const { pos } = world.beacon;
  const root = useRef<Group>(null);
  const orbitA = useRef<Mesh>(null);
  const orbitB = useRef<Mesh>(null);
  const core = useRef<MeshStandardMaterial>(null);
  const pulses = useRef<(Mesh | null)[]>([]);
  useCull(root, pos, 120);

  const mast = useMemo(() => new CylinderGeometry(0.1, 0.42, MAST, 6, 6), []);
  const lattice = useMemo(() => new EdgesGeometry(mast, 1), [mast]);
  const beam = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uColor: { value: new Color(INK.copper).multiplyScalar(1.6) }, uPower: { value: 0.5 } }
      }),
    []
  );
  const pulseMaterials = useMemo(
    () =>
      [0, 1, 2].map(
        () =>
          new MeshBasicMaterial({
            color: new Color(INK.copper).multiplyScalar(1.5),
            transparent: true,
            depthWrite: false,
            toneMapped: false
          })
      ),
    []
  );

  useFrame((state) => {
    const t = animate ? state.clock.elapsedTime : 0;
    const power = 0.35 + 0.65 * focusOf("contact");
    beam.uniforms.uPower.value = power * 0.55;
    if (core.current) core.current.emissiveIntensity = 2.5 + power * 3 + Math.sin(t * 2.4) * 0.6;
    if (orbitA.current) orbitA.current.rotation.set(1.2 + Math.sin(t * 0.5) * 0.2, t * 0.6, 0);
    if (orbitB.current) orbitB.current.rotation.set(0.4, -t * 0.4, 0.9 + Math.cos(t * 0.4) * 0.2);
    pulses.current.forEach((p, i) => {
      if (!p) return;
      const phase = animate ? (t * 0.22 + i / 3) % 1 : 0.15 + i * 0.25;
      p.scale.setScalar(1 + phase * 26);
      pulseMaterials[i].opacity = (1 - phase) * (1 - phase) * 0.7 * power;
    });
  });

  return (
    <group ref={root} position={pos}>
      <mesh position={[0, 0.18, 0]} castShadow={shadows} receiveShadow={shadows}>
        <cylinderGeometry args={[1.5, 1.9, 0.36, 6]} />
        <meshStandardMaterial color="#0C1426" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.37, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.05, 1.2, 6]} />
        <meshBasicMaterial color={new Color(INK.copper).multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
      <group position={[0, 0.36 + MAST / 2, 0]}>
        <mesh geometry={mast} castShadow={shadows}>
          <meshStandardMaterial color="#0A101E" metalness={0.8} roughness={0.35} />
        </mesh>
        <lineSegments geometry={lattice}>
          <lineBasicMaterial color={new Color(INK.teal).multiplyScalar(1.3)} transparent opacity={0.6} toneMapped={false} />
        </lineSegments>
      </group>

      <group position={[0, CORE_Y, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 16]} />
          <meshStandardMaterial ref={core} color="#1A0C05" emissive={INK.copper} emissiveIntensity={4} />
        </mesh>
        <mesh ref={orbitA}>
          <torusGeometry args={[1.1, 0.014, 6, 120]} />
          <meshBasicMaterial color={new Color(INK.gold).multiplyScalar(1.8)} toneMapped={false} />
        </mesh>
        <mesh ref={orbitB}>
          <torusGeometry args={[1.6, 0.01, 6, 140]} />
          <meshBasicMaterial color={new Color(INK.teal).multiplyScalar(1.6)} toneMapped={false} />
        </mesh>
        <Glow color={INK.copper} size={7} opacity={0.5} />
        <mesh position={[0, 35, 0]} material={beam} renderOrder={3}>
          <cylinderGeometry args={[0.9, 0.12, 70, 24, 1, true]} />
        </mesh>
      </group>

      {pulseMaterials.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            pulses.current[i] = el;
          }}
          material={m}
          rotation-x={-Math.PI / 2}
          position={[0, 0.04 + i * 0.002, 0]}
          renderOrder={2}
        >
          <ringGeometry args={[0.96, 1, 128]} />
        </mesh>
      ))}
      <Glow color={INK.copper} size={12} opacity={0.4} position={[0, 0.03, 0]} flat />
    </group>
  );
}
