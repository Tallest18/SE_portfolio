"use client";

import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import type { PortfolioContent } from "@/lib/types";
import { STATIONS } from "@/lib/world/layout";
import { MODE_KEY, runtime, world, useWorld, type Tier, type WorldMode } from "@/lib/world/store";

// three.js only ships to browsers that will actually render the world, and
// only after the page content is on screen.
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function probeWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return { ok: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: /swiftshader|llvmpipe|software|basic render/i.test(renderer) };
  } catch {
    return { ok: false, software: false };
  }
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(MODE_KEY);
  } catch {
    return null;
  }
}

function detect(): { mode: WorldMode; tier: Tier; supported: boolean; adaptive: boolean } {
  const params = new URLSearchParams(window.location.search);
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const gl = probeWebGL();
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowSpec = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  let tier: Tier = gl.software || coarse || lowSpec || window.innerWidth < 768 ? "low" : "high";
  // ?tier=high|low pins the quality tier and turns off automatic downgrades.
  const forcedTier = params.get("tier");
  const adaptive = forcedTier !== "high" && forcedTier !== "low";
  if (!adaptive) tier = forcedTier as Tier;

  const saved = params.get("mode") ?? readSaved();
  let mode: WorldMode = "3d";
  if (!gl.ok) mode = "flat";
  else if (saved === "flat") mode = "flat";
  else if (saved !== "3d" && nav.connection?.saveData) mode = "flat";
  return { mode, tier, supported: gl.ok, adaptive };
}

export function World({ content, children }: { content: PortfolioContent; children: ReactNode }) {
  const mode = useWorld((s) => s.mode);
  const tier = useWorld((s) => s.tier);
  const ready = useWorld((s) => s.sceneReady);
  const reducedMotion = useWorld((s) => s.reducedMotion);
  const [load, setLoad] = useState(false);
  const [adaptive, setAdaptive] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => world.set({ reducedMotion: motion.matches });
    applyMotion();
    motion.addEventListener("change", applyMotion);
    const { adaptive: auto, ...detected } = detect();
    setAdaptive(auto);
    world.set(detected);
    return () => motion.removeEventListener("change", applyMotion);
  }, []);

  // Defer the scene until fonts (used for in-world text) are ready and the
  // main thread is idle, so the page itself paints and responds first.
  useEffect(() => {
    if (mode !== "3d" || load) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const go = () => !cancelled && setLoad(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 1200 });
      else setTimeout(go, 250);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, load]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      runtime.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      runtime.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      runtime.pointer.x = 0;
      runtime.pointer.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Which station the visitor is at, from the DOM alone so the nav works in flat mode too.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.5;
      let current = STATIONS[0].id;
      for (const s of STATIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      world.set({ station: current });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onReady = useCallback(() => world.set({ sceneReady: true }), []);
  const onSlow = useCallback(() => world.set({ tier: "low" }), []);
  const onFail = useCallback(() => world.set({ mode: "flat", sceneReady: false, supported: false }), []);

  const show3d = mode === "3d" && load;

  return (
    <div className="world-root" data-mode={mode}>
      <div aria-hidden="true" className="world-backdrop fixed inset-0 z-0">
        <div className="world-floor absolute inset-x-[-20%] bottom-0 h-[55%]" />
      </div>
      {show3d && (
        <SceneBoundary onError={onFail}>
          <div
            aria-hidden="true"
            className={`fixed inset-0 z-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
          >
            <Scene
              key={tier}
              content={content}
              tier={tier}
              reducedMotion={reducedMotion}
              adaptive={adaptive}
              onReady={onReady}
              onSlow={onSlow}
              onFail={onFail}
            />
          </div>
        </SceneBoundary>
      )}
      <div aria-hidden="true" className="world-vignette pointer-events-none fixed inset-0 z-[1]" />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </div>
  );
}
