"use client";

import type { MetricChange } from "@/lib/progress-celebration";

export default function ProgressCelebrationOverlay({
  category,
  changes,
  closingPhrase,
  compareLabel,
  shareImageUrl,
  onDismiss,
  onShareClick,
}: {
  category: string;
  changes: MetricChange[];
  closingPhrase: string;
  compareLabel: string;
  shareImageUrl: string;
  onDismiss: () => void;
  onShareClick: (url: string) => void;
}) {
  return (
    <div className="pcel-backdrop" onClick={onDismiss}>
      <div className="pcel-card" onClick={(e) => e.stopPropagation()}>
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

        <button type="button" className="pcel-btn-primary" onClick={onDismiss}>
          VIEW MY PROGRESS →
        </button>
        <button type="button" className="pcel-btn-secondary" onClick={() => onShareClick(shareImageUrl)}>
          SHARE MY PROGRESS ↗
        </button>
      </div>
    </div>
  );
}
