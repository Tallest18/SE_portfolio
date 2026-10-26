"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Points,
  ShaderMaterial,
  TubeGeometry,
  Vector3
} from "three";
import type { Vec3, World } from "@/lib/world/layout";
import { runtime } from "@/lib/world/store";
import type { Tier } from "@/lib/world/store";

export const FOG_COLOR = "#0A1124";

/* ------------------------------------------------------------------ sky */

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uGlowDir;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.05, 0.5, d.y));
    vec3 flat_ = normalize(vec3(d.x, 0.0, d.z) + 1e-5);
    float band = 1.0 - smoothstep(0.0, 0.32, abs(d.y - 0.02));
    float g = pow(max(dot(flat_, uGlowDir), 0.0), 5.0) * band;
    col += uGlow * g;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Sky() {
  const ref = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new Color("#03050C") },
          uHorizon: { value: new Color(FOG_COLOR) },
          uGlow: { value: new Color("#B4501F").multiplyScalar(0.55) },
          uGlowDir: { value: new Vector3(-0.35, 0, -1).normalize() }
        }
      }),
    []
  );
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- stars */

function Stars({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const y = 0.08 + Math.random() * 0.92;
      const r = Math.sqrt(1 - y * y);
      arr.set([Math.cos(theta) * r * 350, y * 350, Math.sin(theta) * r * 350], i * 3);
    }
    return arr;
  }, [count]);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <points ref={ref} frustumCulled={false} renderOrder={-9}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C9D3EA" size={1.4} sizeAttenuation={false} fog={false} transparent opacity={0.65} depthWrite={false} />
    </points>
  );
}

/* --------------------------------------------------------------- ground */

function Ground({ shadows }: { shadows: boolean }) {
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ color: "#060B17", roughness: 0.62, metalness: 0.35 });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uGrid = { value: new Color("#3B6E9A") };
      shader.uniforms.uGridHot = { value: new Color("#E2662A") };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform vec3 uGrid;
          uniform vec3 uGridHot;
          varying vec3 vWorldPos;
          float gridLine(vec2 p, float size, float width) {
            vec2 q = p / size;
            vec2 g = abs(fract(q - 0.5) - 0.5) / (fwidth(q) * width);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }`
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float camDist = distance(vWorldPos.xz, cameraPosition.xz);
          float near = 1.0 - smoothstep(6.0, 46.0, camDist);
          float minor = gridLine(vWorldPos.xz, 2.0, 1.0) * 0.16;
          float major = gridLine(vWorldPos.xz, 10.0, 1.4) * 0.5;
          totalEmissiveRadiance += uGrid * (minor + major) * near;
          totalEmissiveRadiance += uGridHot * major * 0.25 * (1.0 - smoothstep(0.0, 14.0, camDist));`
        );
    };
    return m;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[-20, 0, -100]} material={material} receiveShadow={shadows}>
      <planeGeometry args={[520, 520]} />
    </mesh>
  );
}

/* ------------------------------------------------------------ particles */

const moteVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uCam;
  uniform float uScale;
  varying float vAlpha;
  varying float vSeed;
  const float BOX = 56.0;
  void main() {
    vec3 p = position;
    p.y += uTime * (0.12 + aSeed * 0.25);
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * 0.6;
    // Wrap motes into a box that travels with the camera: an endless field.
    p.xz = mod(p.xz - uCam.xz + BOX * 0.5, BOX) - BOX * 0.5 + uCam.xz;
    p.y = mod(p.y, 16.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = uScale * (0.6 + aSeed * 1.4) * (14.0 / max(dist, 1.0));
    vAlpha = (1.0 - smoothstep(18.0, 30.0, dist)) * smoothstep(0.5, 3.0, dist) * (0.35 + 0.65 * fract(aSeed * 7.31 + uTime * 0.15));
    vSeed = aSeed;
  }
`;

const moteFragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uA, uB, step(0.55, vSeed)) * 1.6, a * vAlpha);
    #include <colorspace_fragment>
  }
`;

function Motes({ count, animate }: { count: number; animate: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.set([(Math.random() - 0.5) * 56, Math.random() * 16, (Math.random() - 0.5) * 56], i * 3);
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: moteVertex,
        fragmentShader: moteFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uCam: { value: new Vector3() },
          uScale: { value: 1 },
          uA: { value: new Color("#E2662A") },
          uB: { value: new Color("#4FB3BC") }
        }
      }),
    []
  );
  useFrame(({ camera, clock }) => {
    if (animate) material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uCam.value.copy(camera.position);
    material.uniforms.uScale.value = dpr * 2.2;
  });
  return (
    <points material={material} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
    </points>
  );
}

/* -------------------------------------------------------------- skyline */

function Skyline({ world, count }: { world: World; count: number }) {
  const blocks = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);

  const layout = useMemo(() => {
    // Keep a clear corridor around every camera pose and station.
    const keepOut: Vec3[] = [
      ...Object.values(world.poses).flatMap((p) => [p.pos, p.look]),
      world.beacon.pos,
      world.vault.pos
    ];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const items: { x: number; z: number; w: number; d: number; h: number; cap: number }[] = [];
    let guard = 0;
    while (items.length < count && guard++ < count * 40) {
      const x = -110 + rand() * 180;
      const z = 40 - rand() * 280;
      const clear = keepOut.every((p) => Math.hypot(p[0] - x, p[2] - z) > 18);
      if (!clear) continue;
      const far = Math.min(1, Math.abs(x + 20) / 80);
      items.push({
        x,
        z,
        w: 1.5 + rand() * 3.5,
        d: 1.5 + rand() * 3.5,
        h: 1 + rand() * rand() * (10 + far * 22),
        cap: rand()
      });
    }
    return items;
  }, [world, count]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const hot = new Color("#E2662A");
    const cool = new Color("#4FB3BC");
    const gold = new Color("#D4A74A");
    layout.forEach((b, i) => {
      dummy.position.set(b.x, 0, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      blocks.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(b.x, b.h + 0.02, b.z);
      dummy.scale.set(b.w * 1.002, b.cap > 0.62 ? 0.05 : 0, b.d * 1.002);
      dummy.updateMatrix();
      caps.current?.setMatrixAt(i, dummy.matrix);
      caps.current?.setColorAt(i, b.cap > 0.9 ? hot : b.cap > 0.8 ? gold : cool);
    });
    if (blocks.current) blocks.current.instanceMatrix.needsUpdate = true;
    if (caps.current) {
      caps.current.instanceMatrix.needsUpdate = true;
      if (caps.current.instanceColor) caps.current.instanceColor.needsUpdate = true;
    }
  }, [layout]);

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);

  return (
    <group>
      <instancedMesh ref={blocks} args={[geometry, undefined, layout.length]} frustumCulled={false}>
        <meshStandardMaterial color="#0B1222" roughness={0.85} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, layout.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ---------------------------------------------------------------- trail */

const trailVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const trailFragment = /* glsl */ `
  uniform float uTime;
  uniform float uHead;
  uniform vec3 uDone;
  uniform vec3 uAhead;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    float u = vUv.x;
    float done = 1.0 - smoothstep(uHead - 0.002, uHead + 0.002, u);
    float pulse = smoothstep(0.86, 1.0, fract(u * 140.0 - uTime * 0.6));
    vec3 col = mix(uAhead * (0.35 + pulse * 1.4), uDone * 1.8, done);
    float fade = 1.0 - smoothstep(10.0, 55.0, distance(vWorld, cameraPosition));
    gl_FragColor = vec4(col, fade * (0.55 + 0.45 * done));
    #include <colorspace_fragment>
  }
`;

function Trail({ world, animate }: { world: World; animate: boolean }) {
  const { geometry, lengths, total, n } = useMemo(() => {
    const points = world.order.map((id) => {
      const p = world.poses[id].pos;
      return new Vector3(p[0], 0.03, p[2]);
    });
    const curve = new CatmullRomCurve3(points, false, "centripetal");
    const geometry = new TubeGeometry(curve, Math.max(200, points.length * 40), 0.045, 6, false);
    const n = points.length - 1;
    const divisions = n * 50;
    const lengths = curve.getLengths(divisions);
    return { geometry, lengths, total: lengths[lengths.length - 1], n };
  }, [world]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: trailVertex,
        fragmentShader: trailFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uHead: { value: 0 },
          uDone: { value: new Color("#E2662A") },
          uAhead: { value: new Color("#4FB3BC") }
        }
      }),
    []
  );

  useFrame(({ clock }) => {
    if (animate) material.uniforms.uTime.value = clock.elapsedTime;
    // Anchor k sits at curve parameter k/n; convert to arc length for the tube's UVs.
    const t = MathUtils.clamp(runtime.cur / Math.max(1, n), 0, 1);
    const idx = Math.round(t * (lengths.length - 1));
    material.uniforms.uHead.value = lengths[idx] / total;
  });

  return <mesh geometry={geometry} material={material} renderOrder={1} />;
}

/* --------------------------------------------------------------- lights */

function Lights({ shadows }: { shadows: boolean }) {
  const moon = useRef<DirectionalLight>(null);
  const key = useRef<PointLight>(null);
  const rim = useRef<PointLight>(null);
  const scene = useThree((s) => s.scene);
  const target = useMemo(() => new Object3D(), []);
  const focus = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);

  useLayoutEffect(() => {
    scene.add(target);
    if (moon.current) moon.current.target = target;
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  useFrame(({ camera }) => {
    // Lights travel with the visitor: the focal point is ~9 units ahead.
    camera.getWorldDirection(dir);
    focus.copy(camera.position).addScaledVector(dir, 9);
    target.position.copy(focus);
    moon.current?.position.set(focus.x + 7, focus.y + 16, focus.z + 9);
    key.current?.position.set(focus.x - 4, focus.y + 4.5, focus.z + 3);
    rim.current?.position.set(focus.x + 5, focus.y + 2, focus.z - 4);
  });

  return (
    <>
      <hemisphereLight args={["#3A4F86", "#05070D", 0.9]} />
      <directionalLight
        ref={moon}
        color="#A8BBFF"
        intensity={1.1}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <pointLight ref={key} color="#FF8A4C" intensity={60} distance={40} decay={2} />
      <pointLight ref={rim} color="#4FB3BC" intensity={50} distance={40} decay={2} />
    </>
  );
}

export function Environment({ world, tier, animate }: { world: World; tier: Tier; animate: boolean }) {
  const high = tier === "high";
  return (
    <>
      <color attach="background" args={[FOG_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.021]} />
      <Sky />
      <Stars count={high ? 900 : 400} />
      <Lights shadows={high} />
      <Ground shadows={high} />
      <Skyline world={world} count={high ? 420 : 180} />
      <Trail world={world} animate={animate} />
      <Motes count={high ? 1400 : 500} animate={animate} />
    </>
  );
}
