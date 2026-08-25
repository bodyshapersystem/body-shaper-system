"use client";

import { forwardRef } from "react";
import type { MetricChange } from "@/lib/progress-celebration";

/**
 * The exact same visual card as the Congratulations overlay
 * (pcel-card styles) — rendered here so it can be captured directly
 * via html-to-image, guaranteeing the shared image always looks
 * identical to what's already on screen. No server-side image
 * generation involved.
 */
const ShareableProgressCard = forwardRef<HTMLDivElement, { category: string; changes: MetricChange[]; closingPhrase: string; compareLabel: string }>(
  function ShareableProgressCard({ category, changes, closingPhrase, compareLabel }, ref) {
    return (
      <div ref={ref} className="pcel-card" style={{ position: "static", margin: "0 auto" }}>
        <div className="pcel-sparkle-ring">✦</div>
        <h2 className="pcel-headline">Congratulations! <span className="pcel-sparkle-inline">✧</span></h2>
        <div className="pcel-divider" />
        <p className="pcel-sub">
          {changes.length} key marker{changes.length === 1 ? "" : "s"} improved {compareLabel}.
        </p>

        <div className="pcel-metrics">
          {changes.map((c) => (
            <div key={c.label} className="pcel-metric-row">
              <span className={`pcel-arrow-circle pcel-arrow-${c.direction}`}>{c.direction === "up" ? "↑" : "↓"}</span>
              <div>
                <p className="pcel-metric-label">{c.label}</p>
                <p className="pcel-metric-direction">{c.direction === "up" ? "increased" : "decreased"}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="pcel-star">✦</p>
        <p className="pcel-closing">{closingPhrase}</p>
        <p className="pcel-heart">🤍</p>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: 1, color: "rgba(241,235,225,0.5)", marginTop: 8 }}>
          bodyshapersystem.com
        </p>
      </div>
    );
  }
);

export default ShareableProgressCard;
