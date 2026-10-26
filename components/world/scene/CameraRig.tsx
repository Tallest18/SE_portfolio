"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { Pose, World } from "@/lib/world/layout";
import { runtime } from "@/lib/world/store";

/**
 * Scroll-driven camera.
 *
 * Every page block with a `data-anchor` attribute maps to a camera pose in the
 * world layout. While a block fills the viewport the camera is parked at its
 * pose; scrolling between blocks flies the camera to the next pose. The page
 * keeps native scrolling, so keyboard, anchor links and assistive tech all
 * drive the camera without any scroll-jacking.
 */

interface Measured {
  id: string;
  /** Viewport-centre scroll positions where this anchor's dwell starts and ends. */
  a: number;
  b: number;
}

// Must match the CSS: panels sit beside the scene from Tailwind's `lg`, or on
// short landscape screens (the custom `short` screen in tailwind.config.ts).
const WIDE_BREAKPOINT = 1024;
const SHORT_LANDSCAPE = "(orientation: landscape) and (max-height: 540px)";

function smoothstep(e0: number, e1: number, x: number) {
  const t = MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function poseInto(pose: Pose, narrow: boolean, aspect: number, pos: Vector3, look: Vector3) {
  look.set(...pose.look);
  pos.set(...pose.pos);
  // Back the camera off so the focal object fits the space the layout leaves it:
  // - stacked layouts: the strip above the panel (shorter still on landscape phones)
  // - side-by-side layouts on squarer screens (tablets in landscape, small laptops)
  // Portrait tablets get a narrower field of view than phones, so they back off more.
  const k = narrow
    ? (pose.pullM ?? 1.1) *
      (aspect > 1 ? 1.3 + 0.5 * Math.min(aspect - 1, 1.2) : 1 + Math.max(0, aspect - 0.5) * 0.6)
    : MathUtils.clamp(1.7 / aspect, 1, 1.3);
  if (k !== 1) pos.sub(look).multiplyScalar(k).add(look);
}

export function CameraRig({ world, reducedMotion }: { world: World; reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const anchors = useRef<Measured[]>([]);
  const short = useMemo(() => window.matchMedia(SHORT_LANDSCAPE), []);
  const state = useRef({ cur: -1, px: 0, py: 0, intro: reducedMotion ? 0 : 1 });
  const v = useMemo(
    () => ({
      pos: new Vector3(),
      look: new Vector3(),
      bPos: new Vector3(),
      bLook: new Vector3(),
      dir: new Vector3(),
      right: new Vector3(),
      up: new Vector3(),
      worldUp: new Vector3(0, 1, 0)
    }),
    []
  );

  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const list = Array.from(document.querySelectorAll<HTMLElement>("[data-anchor]"))
        .filter((el) => world.poses[el.dataset.anchor ?? ""])
        .map((el) => {
          const r = el.getBoundingClientRect();
          const top = r.top + window.scrollY;
          const half = Math.min(r.height, vh) / 2;
          return { id: el.dataset.anchor!, a: top + half, b: top + r.height - half };
        })
        .sort((x, y) => x.a - y.a);
      anchors.current = list;
      runtime.index = Object.fromEntries(list.map((m, i) => [m.id, i]));
      invalidate();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const onScroll = () => invalidate();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [world, invalidate]);

  useFrame((frame, rawDt) => {
    const list = anchors.current;
    if (!list.length) return;
    const dt = Math.min(rawDt, 0.1);
    const s = state.current;

    // Where the viewport centre sits along the anchor list, as a float index.
    const c = window.scrollY + window.innerHeight / 2;
    const last = list.length - 1;
    let f = last;
    for (let i = 0; i < last; i++) {
      if (c <= list[i].b) {
        f = i;
        break;
      }
      if (c < list[i + 1].a) {
        f = i + smoothstep(0.15, 0.85, (c - list[i].b) / (list[i + 1].a - list[i].b));
        break;
      }
    }

    if (reducedMotion) {
      // Cut between stations instead of flying through the space between them.
      s.cur = Math.round(f);
    } else if (s.cur < 0) {
      s.cur = f;
    } else {
      // Damp along the path (not in 3D space) so the camera never cuts corners,
      // and cap speed so long nav jumps read as travel rather than a blur.
      const step = (f - s.cur) * (1 - Math.exp(-dt * 4));
      const max = dt * 6;
      s.cur += MathUtils.clamp(step, -max, max);
      if (Math.abs(f - s.cur) < 1e-4) s.cur = f;
    }
    runtime.cur = s.cur;

    const i0 = Math.min(Math.floor(s.cur), last);
    const i1 = Math.min(i0 + 1, last);
    const t = s.cur - i0;
    const narrow = window.innerWidth < WIDE_BREAKPOINT && !short.matches;
    const aspect = frame.size.width / Math.max(1, frame.size.height);
    const A = world.poses[list[i0].id];
    const B = world.poses[list[i1].id];
    poseInto(A, narrow, aspect, v.pos, v.look);
    poseInto(B, narrow, aspect, v.bPos, v.bLook);
    const dist = v.pos.distanceTo(v.bPos);
    v.pos.lerp(v.bPos, t);
    v.look.lerp(v.bLook, t);
    // Long hops arc up over the landscape instead of skimming the floor.
    v.pos.y += Math.sin(Math.PI * t) * Math.min(3.5, dist * 0.07);

    const sa = narrow ? A.shiftM : A.shift;
    const sb = narrow ? B.shiftM : B.shift;
    const shiftX = MathUtils.lerp(sa[0], sb[0], t);
    const shiftY = MathUtils.lerp(sa[1], sb[1], t);

    if (s.intro > 0) {
      s.intro = Math.max(0, s.intro - dt / 2.6);
      const e = s.intro * s.intro * s.intro;
      v.pos.z += 10 * e;
      v.pos.y += 3 * e;
    }

    v.dir.subVectors(v.look, v.pos).normalize();
    v.right.crossVectors(v.dir, v.worldUp).normalize();
    v.up.crossVectors(v.right, v.dir).normalize();

    if (!reducedMotion) {
      const k = 1 - Math.exp(-dt * 2.5);
      s.px += (runtime.pointer.x - s.px) * k;
      s.py += (runtime.pointer.y - s.py) * k;
      v.pos.addScaledVector(v.right, s.px * 0.5).addScaledVector(v.up, s.py * 0.3);
      v.pos.y += Math.sin(frame.clock.elapsedTime * 0.5) * 0.06;
    }

    camera.position.copy(v.pos);
    camera.lookAt(v.look);

    camera.fov = aspect >= 1 ? 42 : Math.min(64, 42 / Math.sqrt(aspect));
    camera.updateProjectionMatrix();
    // Skew the projection so the focal point lands beside the text panel
    // rather than dead centre, without rotating the camera off its target.
    const e = camera.projectionMatrix.elements;
    e[8] = -shiftX;
    e[9] = -shiftY;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    runtime.camera[0] = v.pos.x;
    runtime.camera[1] = v.pos.y;
    runtime.camera[2] = v.pos.z;

    if (s.intro > 0 || Math.abs(f - s.cur) > 1e-4) frame.invalidate();
  }, -1);

  return null;
}
