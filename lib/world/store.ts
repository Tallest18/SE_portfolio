"use client";

import { useSyncExternalStore } from "react";
import type { StationId, Vec3 } from "./layout";

/**
 * Shared state between the DOM and the 3D scene. The scene runs in its own
 * React root (R3F's reconciler), so this lives in a module-level store rather
 * than context.
 *
 * Two layers:
 * - `world`: low-frequency UI state (hover highlights, current station, mode).
 *   Components subscribe with `useWorld`.
 * - `runtime`: per-frame values written and read inside animation loops.
 *   Never subscribed to; reading it doesn't trigger renders.
 */

export type HighlightKind = "focus" | "skill" | "project" | "role" | "credential";
export type Highlight = { kind: HighlightKind; index: number } | null;
export type WorldMode = "pending" | "3d" | "flat";
export type Tier = "high" | "low";

export interface WorldState {
  highlight: Highlight;
  station: StationId;
  mode: WorldMode;
  tier: Tier;
  sceneReady: boolean;
  reducedMotion: boolean;
  /** False when the browser can't run the scene (no WebGL2); the toggle is disabled. */
  supported: boolean;
}

const initial: WorldState = {
  highlight: null,
  station: "top",
  mode: "pending",
  tier: "high",
  sceneReady: false,
  reducedMotion: false,
  supported: true
};

let state = initial;
const listeners = new Set<() => void>();

export const world = {
  get: () => state,
  set(partial: Partial<WorldState>) {
    const next = { ...state, ...partial };
    if ((Object.keys(partial) as (keyof WorldState)[]).every((k) => next[k] === state[k])) return;
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export function useWorld<T>(selector: (s: WorldState) => T): T {
  return useSyncExternalStore(
    world.subscribe,
    () => selector(state),
    () => selector(initial)
  );
}

export function setHighlight(kind: HighlightKind, index: number | null) {
  const current = state.highlight;
  if (index === null) {
    if (current?.kind === kind) world.set({ highlight: null });
    return;
  }
  if (current?.kind === kind && current.index === index) return;
  world.set({ highlight: { kind, index } });
}

export function isHighlighted(h: Highlight, kind: HighlightKind, index: number) {
  return h?.kind === kind && h.index === index;
}

/** Per-frame values. Mutated in place by the camera rig and pointer listener. */
export const runtime = {
  /** Smoothed position along the page's anchor list (0 = hero, 1 = about, ...). */
  cur: 0,
  /** Anchor id → its index in the measured anchor list. */
  index: {} as Record<string, number>,
  /** Pointer in -1..1 (y up). Raw; consumers damp it themselves. */
  pointer: { x: 0, y: 0 },
  camera: [0, 0, 0] as Vec3
};

/** 1 when the camera is parked at this anchor, falling to 0 one anchor away. */
export function focusOf(id: string): number {
  const i = runtime.index[id];
  if (i === undefined) return 0;
  return Math.max(0, 1 - Math.abs(runtime.cur - i));
}

/** Signed distance (in anchors) from the camera to this anchor; negative = not reached yet. */
export function offsetOf(id: string): number {
  const i = runtime.index[id];
  if (i === undefined) return -99;
  return runtime.cur - i;
}

export const MODE_KEY = "world-mode";

/** Switches between the 3D world and the flat layout, remembering the choice. */
export function toggle3D() {
  if (!state.supported) return;
  const mode = state.mode === "3d" ? "flat" : "3d";
  world.set({ mode, sceneReady: false });
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Storage blocked (private mode etc.): the toggle still works for this visit.
  }
}

export function scrollToAnchor(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-anchor="${id}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth", block: "center" });
}
