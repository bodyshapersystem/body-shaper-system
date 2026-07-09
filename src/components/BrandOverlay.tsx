"use client";

import { useId } from "react";

/**
 * BrandOverlay — the single reusable visual-language watermark for
 * Body Shaper System™.
 *
 * This is a lossless extraction of the pattern that already ships in
 * production (previously hard-coded once in `layout.tsx` for the
 * site-wide 3% watermark, and referenced via <use> in `Header.tsx` for
 * the mobile menu's 5% watermark). No motif has been redrawn or
 * redesigned — every path/circle/line below is byte-for-byte the same
 * geometry that was already approved and live.
 *
 * Motifs (all optional, all on by default so existing usages are
 * visually identical):
 *  - "grid"     — thin crosshair blueprint grid lines
 *  - "target"   — small crosshair-in-circle engineering target
 *  - "ring"     — concentric precision rings with tick marks
 *  - "nodes"    — triangulation node cluster (dots + connecting lines)
 *  - "contour"  — flowing contour wave line
 *  - "dotgrid"  — 3x3 precision dot grid
 *  - "ticks"    — small ruler/tick mark cluster
 *
 * Because motifs are configurable per instance, each instance gets its
 * own <pattern> id (via useId) so two BrandOverlay components with
 * different motif subsets never collide or overwrite each other.
 */

export type BrandOverlayMotif =
  | "grid"
  | "target"
  | "ring"
  | "nodes"
  | "contour"
  | "dotgrid"
  | "ticks";

export type BrandOverlayTone = "ink" | "ivory";

const ALL_MOTIFS: BrandOverlayMotif[] = [
  "grid",
  "target",
  "ring",
  "nodes",
  "contour",
  "dotgrid",
  "ticks",
];

export interface BrandOverlayProps {
  /** Which motifs to render. Defaults to all (exact current look). */
  motifs?: BrandOverlayMotif[];
  /**
   * Opacity of the watermark. Clamped to the approved 2–5% range so no
   * page can accidentally make the overlay loud enough to interfere
   * with readability.
   */
  opacity?: number;
  /**
   * "ink"   — dark line color for light backgrounds (white/ivory).
   * "ivory" — light line color for dark backgrounds (mocha/burgundy/olive).
   */
  tone?: BrandOverlayTone;
  /** "fixed" tiles the whole viewport (site-wide use). "absolute" fills
   *  the nearest positioned ancestor (e.g. inside a menu panel or a
   *  contained section/card). */
  position?: "fixed" | "absolute";
  className?: string;
}

const TONE_COLOR: Record<BrandOverlayTone, string> = {
  ink: "var(--mocha)",
  ivory: "var(--ivory)",
};

export default function BrandOverlay({
  motifs = ALL_MOTIFS,
  opacity = 0.03,
  tone = "ink",
  position = "fixed",
  className = "",
}: BrandOverlayProps) {
  const rawId = useId();
  const patternId = `bss-overlay-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clampedOpacity = Math.min(0.05, Math.max(0.02, opacity));
  const has = (m: BrandOverlayMotif) => motifs.includes(m);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="480"
            height="480"
            patternUnits="userSpaceOnUse"
          >
            {has("grid") && (
              <path d="M0 240 H480 M240 0 V480" stroke="currentColor" strokeWidth="0.5" />
            )}
            {has("target") && (
              <g transform="translate(90,90)">
                <line x1="-18" y1="0" x2="18" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="-18" x2="0" y2="18" stroke="currentColor" strokeWidth="1" />
                <circle r="26" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </g>
            )}
            {has("ring") && (
              <g transform="translate(370,370)">
                <circle r="34" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle r="20" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle r="3" fill="currentColor" />
                <line x1="-40" y1="0" x2="-44" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="0" x2="44" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="-40" x2="0" y2="-44" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="40" x2="0" y2="44" stroke="currentColor" strokeWidth="1" />
              </g>
            )}
            {has("nodes") && (
              <g transform="translate(330,70)">
                <circle cx="0" cy="0" r="2.5" fill="currentColor" />
                <circle cx="46" cy="18" r="2.5" fill="currentColor" />
                <circle cx="20" cy="46" r="2.5" fill="currentColor" />
                <line x1="0" y1="0" x2="46" y2="18" stroke="currentColor" strokeWidth="0.6" />
                <line x1="46" y1="18" x2="20" y2="46" stroke="currentColor" strokeWidth="0.6" />
                <line x1="0" y1="0" x2="20" y2="46" stroke="currentColor" strokeWidth="0.6" />
              </g>
            )}
            {has("contour") && (
              <path
                d="M50,430 C 90,390 70,350 110,340 C 150,330 140,390 190,380"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.85"
              />
            )}
            {has("dotgrid") && (
              <g fill="currentColor">
                <circle cx="220" cy="180" r="1.4" />
                <circle cx="240" cy="180" r="1.4" />
                <circle cx="260" cy="180" r="1.4" />
                <circle cx="220" cy="200" r="1.4" />
                <circle cx="240" cy="200" r="1.4" />
                <circle cx="260" cy="200" r="1.4" />
                <circle cx="220" cy="220" r="1.4" />
                <circle cx="240" cy="220" r="1.4" />
                <circle cx="260" cy="220" r="1.4" />
              </g>
            )}
            {has("ticks") && (
              <g transform="translate(430,200)">
                <line x1="0" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="28" stroke="currentColor" strokeWidth="0.6" />
              </g>
            )}
          </pattern>
        </defs>
      </svg>
      <svg
        className={`brand-overlay-instance ${className}`}
        aria-hidden="true"
        focusable="false"
        style={{
          position,
          inset: 0,
          width: "100%",
          height: "100%",
          color: TONE_COLOR[tone],
          opacity: clampedOpacity,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </>
  );
}
