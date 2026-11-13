"use client";

import { useEffect, useMemo, useState } from "react";
import { techKey } from "@/lib/tech-count";

/**
 * Package progress as Blueprint Waves™: each technology is a card whose
 * sessions sit as beads along a wave. Done = filled wine, booked =
 * champagne ring (pulsing), still to book = open. Tap a bead for its
 * date. Shared by the Client Portal dashboard and the Hub scheduler.
 */

export type WaveRow = {
  name: string;
  total: number;
  done: number;
  scheduled: number;
  complete: boolean;
  sessions: { n: number; state: "done" | "booked" | "open"; at: string | null }[];
};

const THUMBS: Record<string, string> = {
  exilis: "/images/tech-thumbs/exilis.webp",
  endospheres: "/images/tech-thumbs/endospheres.webp",
  ems: "/images/tech-thumbs/ems.webp",
};

const W = 640;
const H = 96;
const PAD = 26;

function waveY(x: number) {
  // two gentle crests across the card, echoing the Blueprint Waves line
  return H / 2 + 22 * Math.sin(((x - PAD) / (W - 2 * PAD)) * Math.PI * 2.2 + 0.4);
}

function wavePath() {
  let d = "";
  for (let x = PAD; x <= W - PAD; x += 4) d += `${x === PAD ? "M" : "L"}${x.toFixed(1)},${waveY(x).toFixed(1)} `;
  return d;
}

export default function PackageWaves({ rows, title, subtitle, compact = false, timeZone = "America/New_York" }: { rows: WaveRow[]; title?: string; subtitle?: string; compact?: boolean; timeZone?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);
  const path = useMemo(wavePath, []);
  const left = rows.reduce((s, r) => s + (r.total - r.done), 0);

  return (
    <section className={`pw ${compact ? "pw-compact" : ""} ${ready ? "pw-ready" : ""}`}>
      {(title || subtitle) && (
        <div className="pw-head">
          {title && <h3>{title}</h3>}
          <span>{left === 0 ? "system complete ✓" : subtitle ?? `${left} treatment${left === 1 ? "" : "s"} to go`}</span>
        </div>
      )}
      <div className="pw-grid">
        {rows.map((r, idx) => (
          <TechCard key={r.name} row={r} path={path} delay={idx * 140} timeZone={timeZone} />
        ))}
      </div>
    </section>
  );
}

function fmt(at: string | null, tz: string) {
  if (!at) return null;
  const d = new Date(at);
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz })}`;
}

function TechCard({ row, path, delay, timeZone }: { row: WaveRow; path: string; delay: number; timeZone: string }) {
  const key = techKey(row.name);
  const thumb = THUMBS[key];
  const [picked, setPicked] = useState<number | null>(null);
  const xs = row.sessions.map((_, i) => (row.total === 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (row.total - 1)));
  const progressX = row.done === 0 ? PAD : xs[Math.min(row.done, row.total) - 1];
  const nextBooked = row.sessions.find((s) => s.state === "booked");
  const focus = picked != null ? row.sessions[picked - 1] : nextBooked ?? null;
  const pct = Math.round((row.done / row.total) * 100);
  const clipId = `pw-clip-${key}`;

  const label = focus ? fmt(focus.at, timeZone) : null;
  const caption = (() => {
    if (focus) {
      if (focus.state === "done") return `#${focus.n} · completed${label ? ` · ${label}` : ""}`;
      if (focus.state === "booked") return `#${focus.n} · booked${label ? ` · ${label}` : ""}`;
      return `#${focus.n} · not booked yet`;
    }
    if (row.complete) return "all sessions completed";
    return `${row.total - row.done - row.scheduled} left to book`;
  })();

  return (
    <article className={`pw-card ${row.complete ? "pw-card-complete" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="pw-card-top">
        {thumb ? <img src={thumb} alt="" className="pw-thumb" /> : <span className="pw-thumb pw-thumb-empty" />}
        <div className="pw-name">
          <p>{row.name.replace(/™|®/g, "")}<sup>™</sup></p>
          <span>{row.complete ? "complete" : row.scheduled > 0 ? `${row.scheduled} booked` : `${pct}% done`}</span>
        </div>
        <div className="pw-count">
          <strong>{row.done}</strong>
          <em>/ {row.total}</em>
        </div>
        {row.complete && <span className="pw-seal" aria-label="complete">✓</span>}
      </div>

      <div className="pw-wave-wrap">
      <svg className="pw-wave" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${row.done} of ${row.total} ${row.name} sessions completed`}>
        <defs>
          <clipPath id={clipId}>
            <rect className="pw-clip" x="0" y="0" height={H} width={progressX + 2} style={{ transitionDelay: `${delay + 200}ms` }} />
          </clipPath>
        </defs>
        <path d={path} className="pw-line-base" />
        <path d={path} className="pw-line-done" clipPath={`url(#${clipId})`} />
      </svg>
      <div className="pw-beads">
        {row.sessions.map((s, i) => (
          <button
            key={s.n}
            type="button"
            className={`pw-bead pw-${s.state} ${picked === s.n ? "pw-picked" : ""}`}
            style={{ left: `${(xs[i] / W) * 100}%`, top: `${(waveY(xs[i]) / H) * 100}%`, animationDelay: `${delay + 260 + i * 70}ms` }}
            onClick={() => setPicked(picked === s.n ? null : s.n)}
            aria-label={`${row.name} session ${s.n}: ${s.state}${s.at ? `, ${fmt(s.at, timeZone)}` : ""}`}
          >
            {s.state === "done" ? s.n : s.state === "booked" ? s.n : ""}
          </button>
        ))}
      </div>
      </div>
      <p className="pw-caption">{caption}</p>
    </article>
  );
}
