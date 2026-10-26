"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

/**
 * Building blocks for the page layer that floats over the 3D world.
 *
 * An AnchorBlock is one "stop" on the journey: a viewport-tall block whose
 * `data-anchor` the camera rig maps to a pose. The block itself lets pointer
 * events through to the scene; only its panel is interactive. On wide screens
 * the panel sits beside the station's focal object, on narrow screens below it.
 */

export function AnchorBlock({
  anchor,
  align = "left",
  id,
  className,
  panelClassName,
  children
}: {
  anchor: string;
  align?: "left" | "right" | "center";
  id?: string;
  className?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-anchor={anchor}
      id={id}
      className={clsx("pointer-events-none relative flex min-h-[100svh] w-full scroll-mt-0", className)}
    >
      <div
        className={clsx(
          "mx-auto flex w-full max-w-7xl items-end px-4 pb-14 pt-[46svh] sm:px-8 lg:items-center lg:py-24 lg:pr-20 short:items-center short:py-20",
          align === "left" && "justify-center lg:justify-start short:justify-start",
          align === "right" && "justify-center lg:justify-end short:justify-end",
          align === "center" && "justify-center"
        )}
      >
        <Holo className={clsx("w-full max-w-xl short:max-w-[24rem]", panelClassName)}>{children}</Holo>
      </div>
    </div>
  );
}

/** Glass panel that materialises as it enters view and fades as it leaves. */
export function Holo({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56, rotateX: 12, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ amount: 0.15, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200, transformOrigin: "50% 100%" }}
      className={clsx("glass pointer-events-auto relative rounded-2xl p-6 sm:p-8", className)}
    >
      <span aria-hidden="true" className="hud-corner left-0 top-0 border-l border-t" />
      <span aria-hidden="true" className="hud-corner right-0 top-0 border-r border-t" />
      <span aria-hidden="true" className="hud-corner bottom-0 left-0 border-b border-l" />
      <span aria-hidden="true" className="hud-corner bottom-0 right-0 border-b border-r" />
      {children}
    </motion.div>
  );
}

export function StationTag({ index, label, extra }: { index: string; label: string; extra?: string }) {
  return (
    <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-copper-light">
      <span>{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-copper-light/60" />
      <span>{label}</span>
      {extra && <span className="ml-auto tracking-[0.14em] text-mist">{extra}</span>}
    </p>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "signal" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none",
        tone === "signal" ? "border-signal/40 text-signal" : "border-cream/15 text-cream/85"
      )}
    >
      {children}
    </span>
  );
}

/** Empty stretch of page where the camera travels between stations. */
export function Transit({ size = "md" }: { size?: "sm" | "md" }) {
  return <div aria-hidden="true" data-transit className={size === "sm" ? "h-[20svh]" : "h-[40svh]"} />;
}
