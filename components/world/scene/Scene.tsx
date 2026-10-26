"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { buildCredentials, buildWorld } from "@/lib/world/layout";
import type { PortfolioContent } from "@/lib/types";
import type { Tier } from "@/lib/world/store";
import { Beacon } from "./Beacon";
import { Bloom } from "./Bloom";
import { CameraRig } from "./CameraRig";
import { Constellation } from "./Constellation";
import { Environment, FOG_COLOR } from "./Environment";
import { Gallery } from "./Gallery";
import { Gate } from "./Gate";
import { LayerStack } from "./LayerStack";
import { Timeline } from "./Timeline";
import { Vault } from "./Vault";

export interface SceneProps {
  content: PortfolioContent;
  tier: Tier;
  reducedMotion: boolean;
  /** Watch frame rate and step quality down when it drops. */
  adaptive: boolean;
  onReady: () => void;
  onSlow: () => void;
  onFail: () => void;
}

/** Calls `onReady` once the first frame has been drawn, so the canvas can fade in. */
function Ready({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady());
  });
  return null;
}

/**
 * Watches frame rate after warm-up. On the high tier a sustained drop asks
 * the parent to fall back to the low tier; on the low tier it lowers the
 * render resolution instead.
 */
function PerfWatch({ tier, onSlow }: { tier: Tier; onSlow: () => void }) {
  const setDpr = useThree((s) => s.setDpr);
  const s = useRef({ warm: 0, t: 0, n: 0, done: false });
  useFrame((state, dt) => {
    const a = s.current;
    if (a.done || dt > 0.25) return;
    a.warm += dt;
    if (a.warm < 3) return;
    a.t += dt;
    a.n += 1;
    if (a.t < 3) return;
    const fps = a.n / a.t;
    a.t = 0;
    a.n = 0;
    if (fps >= 38) return;
    a.done = true;
    if (tier === "high") onSlow();
    else setDpr(Math.max(0.75, state.viewport.dpr * 0.75));
  });
  return null;
}

export default function Scene({ content, tier, reducedMotion, adaptive, onReady, onSlow, onFail }: SceneProps) {
  const world = useMemo(() => buildWorld(content), [content]);
  const credentials = useMemo(() => buildCredentials(content), [content]);
  const animate = !reducedMotion;
  const high = tier === "high";

  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high, powerPreference: "high-performance", alpha: false, stencil: false }}
      shadows={high ? "soft" : false}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ fov: 42, near: 0.1, far: 1000, position: [0, 6, 24] }}
      onCreated={({ gl }) => {
        gl.setClearColor(FOG_COLOR);
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <CameraRig world={world} reducedMotion={reducedMotion} />
      <Environment world={world} tier={tier} animate={animate} />
      <Gate world={world} content={content} animate={animate} shadows={high} />
      <LayerStack world={world} focusAreas={content.about.focusAreas} animate={animate} shadows={high} />
      <Constellation world={world} groups={content.skills.groups} animate={animate} />
      <Gallery world={world} projects={content.projects.items} animate={animate} shadows={high} />
      <Timeline world={world} roles={content.experience.items} animate={animate} shadows={high} />
      <Vault world={world} credentials={credentials} animate={animate} shadows={high} />
      <Beacon world={world} animate={animate} shadows={high} />
      {high && <Bloom />}
      {adaptive && !reducedMotion && <PerfWatch tier={tier} onSlow={onSlow} />}
      <Ready onReady={onReady} />
    </Canvas>
  );
}
