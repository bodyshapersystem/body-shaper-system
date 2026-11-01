"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MIAMI_MAP, type MiamiZone } from "@/lib/miami-map-data";
import "./miami-map.css";

/**
 * Interactive Miami map — official Miami-Dade / City of Miami boundaries, pre-projected
 * to SVG (no map library at runtime). One selection at a time: the chosen area lights in
 * champagne along its real limits, the rest dims, and the view glides to it (≈450 ms).
 * Tapping the map and choosing from the selector run the same code path.
 */

export type ZoneOption = { id: string; label: string; group: string; onMap: boolean };

const GROUP: Record<MiamiZone["kind"], string> = {
  neighborhood: "city of miami neighborhoods",
  municipality: "cities & villages",
  cdp: "cities & villages",
};
export const OFF_MAP: ZoneOption[] = [
  { id: "homestead", label: "homestead · florida city", group: "outside the map", onMap: false },
  { id: "other-miami-dade", label: "other area in miami-dade", group: "outside the map", onMap: false },
  { id: "fort-lauderdale", label: "fort lauderdale · broward", group: "outside the map", onMap: false },
  { id: "west-palm-beach", label: "west palm beach · palm beach", group: "outside the map", onMap: false },
  { id: "other", label: "other", group: "outside the map", onMap: false },
];
export const ZONE_OPTIONS: ZoneOption[] = [
  ...MIAMI_MAP.zones.map((z) => ({ id: z.id, label: z.label, group: GROUP[z.kind], onMap: true })),
  ...OFF_MAP,
];
const LABELLED = new Set(["key-biscayne", "brickell", "downtown", "wynwood-midtown", "miami-beach", "coral-gables", "coconut-grove", "doral", "kendall", "aventura", "north-miami", "hialeah", "pinecrest"]);
const SHORT: Record<string, string> = { "wynwood-midtown": "wynwood", "sunny-isles": "sunny isles", hialeah: "hialeah" };

type VB = [number, number, number, number];
const FULL = MIAMI_MAP.viewBox as VB;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function targetFor(z: MiamiZone): VB {
  const [x, y, w, h] = z.bbox;
  const aspect = FULL[2] / FULL[3];
  let tw = Math.max(w * 3, 170);
  let th = tw / aspect;
  if (h * 2.6 > th) {
    th = h * 2.6;
    tw = th * aspect;
  }
  tw = Math.min(tw, FULL[2]);
  th = Math.min(th, FULL[3]);
  const cx = x + w / 2, cy = y + h / 2;
  return [Math.min(Math.max(cx - tw / 2, 0), FULL[2] - tw), Math.min(Math.max(cy - th / 2, 0), FULL[3] - th), tw, th];
}

export default function MiamiMap({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const [vb, setVb] = useState<VB>(FULL);
  const vbRef = useRef<VB>(FULL);
  const raf = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 360, h: 470 });
  const selected = useMemo(() => MIAMI_MAP.zones.find((z) => z.id === value) ?? null, [value]);
  const option = ZONE_OPTIONS.find((o) => o.id === value) ?? null;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // glide the camera to the selection (or back to all of Miami)
  useEffect(() => {
    const to: VB = selected ? targetFor(selected) : FULL;
    const from = vbRef.current;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (raf.current) cancelAnimationFrame(raf.current);
    if (reduce) {
      vbRef.current = to;
      setVb(to);
      return;
    }
    const t0 = performance.now();
    const D = 460;
    const step = (now: number) => {
      const k = ease(Math.min(1, (now - t0) / D));
      const cur = from.map((v, i) => v + (to[i] - v) * k) as VB;
      vbRef.current = cur;
      setVb(cur);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [selected]);

  const scale = vb[2] / size.w; // svg units per screen px
  const toScreen = (x: number, y: number) => {
    const left = ((x - vb[0]) / vb[2]) * size.w;
    const top = ((y - vb[1]) / vb[3]) * size.h;
    const half = Math.min(150, size.w / 2 - 8); // keep the floating label inside the map
    return { left: Math.min(Math.max(left, half + 8), size.w - half - 8), top: Math.max(top, 52) };
  };
  const pick = (id: string) => onChange(id === value ? value : id);

  return (
    <div className="mm">
      <div className="mm-map" ref={wrapRef} style={{ aspectRatio: `${FULL[2]} / ${FULL[3]}` }}>
        <svg viewBox={vb.join(" ")} preserveAspectRatio="xMidYMid meet" role="group" aria-label="map of miami — tap your area">
          <defs>
            <filter id="mm-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={4 * scale} />
            </filter>
          </defs>
          <rect x={-50} y={-50} width={FULL[2] + 100} height={FULL[3] + 100} className="mm-water" />
          <path d={MIAMI_MAP.land} className={`mm-land${value ? " dim" : ""}`} />
          <path d={MIAMI_MAP.other} className={`mm-other${value ? " dim" : ""}`} />
          {MIAMI_MAP.zones.map((z) => {
            const on = z.id === value;
            const tiny = z.bbox[2] / scale < 26 || z.bbox[3] / scale < 26;
            return (
              <g key={z.id}>
                <path
                  d={z.d}
                  className={`mm-zone${on ? " on" : value ? " dim" : ""}`}
                  role="button"
                  aria-label={z.label}
                  aria-pressed={on}
                  onClick={() => pick(z.id)}
                />
                {tiny && !on && (
                  // larger touch target for small areas, without changing the drawn limits
                  <path d={z.d} className="mm-hit" style={{ strokeWidth: 22 * scale }} onClick={() => pick(z.id)} aria-hidden="true" />
                )}
              </g>
            );
          })}
          {selected && <path d={selected.d} className="mm-glow" filter="url(#mm-glow)" aria-hidden="true" />}
          {selected && <path d={selected.d} className="mm-zone on top" aria-hidden="true" />}
          {!value &&
            MIAMI_MAP.zones
              .filter((z) => LABELLED.has(z.id))
              .map((z) => (
                <text key={z.id} x={z.c[0] > 880 ? z.c[0] - 6 : z.c[0]} y={z.c[1]} className="mm-label" style={{ fontSize: 10.5 * scale, textAnchor: z.c[0] > 880 ? "end" : "middle" }} aria-hidden="true">
                  {SHORT[z.id] ?? z.label}
                </text>
              ))}
        </svg>
        {selected && (
          <div className="mm-tag" style={toScreen(selected.c[0], selected.bbox[1])} role="status">
            <span className="mm-check" aria-hidden="true" />
            {selected.label} — selected
          </div>
        )}
        {value && (
          <button type="button" className="mm-reset" onClick={() => onChange(null)}>
            all of miami
          </button>
        )}
      </div>
      <label className="mm-select">
        <span className="mm-sr">your area</span>
        <span className="mm-pin" aria-hidden="true" />
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">choose your area…</option>
          {["city of miami neighborhoods", "cities & villages", "outside the map"].map((g) => (
            <optgroup key={g} label={g}>
              {ZONE_OPTIONS.filter((o) => o.group === g)
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      {option && !option.onMap && (
        <p className="mm-note" role="status">
          <span className="mm-check" aria-hidden="true" /> {option.label} — selected. travel fees outside our standard area are confirmed with your proposal.
        </p>
      )}
    </div>
  );
}
