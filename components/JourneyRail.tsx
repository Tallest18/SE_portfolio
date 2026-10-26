"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Box, Square } from "lucide-react";
import { STATIONS } from "@/lib/world/layout";
import { runtime, toggle3D, useWorld } from "@/lib/world/store";

/**
 * Wide-screen wayfinding: the six stations as a vertical route on the right
 * edge with overall progress, plus a live camera readout and the 3D toggle.
 */
export function JourneyRail() {
  const station = useWorld((s) => s.station);
  const mode = useWorld((s) => s.mode);
  const ready = useWorld((s) => s.sceneReady);
  const supported = useWorld((s) => s.supported);
  const fill = useRef<HTMLSpanElement>(null);
  const coords = useRef<HTMLSpanElement>(null);
  const activeIndex = STATIONS.findIndex((s) => s.id === station);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
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

  useEffect(() => {
    if (mode !== "3d" || !ready) return;
    const id = window.setInterval(() => {
      const [x, y, z] = runtime.camera;
      if (coords.current) coords.current.textContent = `x ${x.toFixed(1)}  y ${y.toFixed(1)}  z ${z.toFixed(1)}`;
    }, 120);
    return () => window.clearInterval(id);
  }, [mode, ready]);

  return (
    <>
      <nav
        aria-label="Journey"
        className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-8"
      >
        <ol className="relative flex flex-col gap-5">
          <span aria-hidden="true" className="absolute bottom-1 right-[5px] top-1 w-px bg-cream/10" />
          <span
            ref={fill}
            aria-hidden="true"
            className="absolute right-[5px] top-1 h-[calc(100%-8px)] w-px origin-top bg-gradient-to-b from-copper-light to-signal"
            style={{ transform: "scaleY(0)" }}
          />
          {STATIONS.map((s, i) => {
            const active = s.id === station;
            const passed = i < activeIndex;
            return (
              <li key={s.id} className="relative flex justify-end">
                <a
                  href={s.href}
                  aria-current={active ? "location" : undefined}
                  className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]"
                >
                  <span
                    className={clsx(
                      "transition-all duration-300",
                      active
                        ? "translate-x-0 text-cream opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 xl:opacity-100"
                        : "translate-x-1 text-mist opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    )}
                  >
                    <span className="mr-2 text-copper-light">{String(i).padStart(2, "0")}</span>
                    {s.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "relative h-[11px] w-[11px] rounded-full border transition-all duration-300",
                      active
                        ? "scale-110 border-copper-light bg-copper-light shadow-[0_0_14px_2px_rgba(226,102,42,0.6)]"
                        : passed
                          ? "border-copper-light/70 bg-night"
                          : "border-cream/30 bg-night group-hover:border-cream"
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="fixed bottom-5 right-5 z-30 hidden items-center gap-4 font-mono text-[10px] text-mist lg:flex xl:right-8">
        {mode === "3d" && ready && (
          <span ref={coords} aria-hidden="true" className="hidden tabular-nums tracking-wider xl:inline" />
        )}
        <button
          type="button"
          onClick={toggle3D}
          disabled={!supported}
          title={supported ? undefined : "3D needs WebGL2, which this browser doesn't provide"}
          className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-night/60 px-3 py-1.5 uppercase tracking-[0.18em] text-cream/80 backdrop-blur transition-colors hover:border-cream/40 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "3d" ? <Square size={12} aria-hidden="true" /> : <Box size={12} aria-hidden="true" />}
          {mode === "3d" ? "flat view" : "3D world"}
        </button>
      </div>
    </>
  );
}
