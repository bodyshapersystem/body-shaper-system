"use client";

import { forwardRef } from "react";
import type { MetricChange } from "@/lib/progress-celebration";
import { translateLabel, translateClosingPhrase, translateCompareLabel, translateDirection, CARD_STRINGS } from "@/lib/share-card-translations";

/**
 * The exact same visual card as the Congratulations overlay
 * (pcel-card styles) — rendered here so it can be captured directly
 * via html-to-image, guaranteeing the shared image always looks
 * identical to what's already on screen. No server-side image
 * generation involved. Supports EN/ES via a curated translation set
 * (share-card-translations.ts) — never a live machine translation.
 */
const ShareableProgressCard = forwardRef<
  HTMLDivElement,
  { category: string; changes: MetricChange[]; closingPhrase: string; compareLabel: string; language?: "en" | "es" }
>(function ShareableProgressCard({ changes, closingPhrase, compareLabel, language = "en" }, ref) {
  const t = CARD_STRINGS[language];
  return (
    <div ref={ref} className="pcel-card" style={{ position: "static", margin: "0 auto" }}>
      <div className="pcel-sparkle-ring">✦</div>
      <h2 className="pcel-headline">{t.congratulations} <span className="pcel-sparkle-inline">✧</span></h2>
      <div className="pcel-divider" />
      <p className="pcel-sub">
        {t.keyMarker(changes.length)} {translateCompareLabel(compareLabel, language)}.
      </p>

      <div className="pcel-metrics">
        {changes.map((c) => (
          <div key={c.label} className="pcel-metric-row">
            <span className={`pcel-arrow-circle pcel-arrow-${c.direction}`}>{c.direction === "up" ? "↑" : "↓"}</span>
            <div>
              <p className="pcel-metric-label">{translateLabel(c.label, language)}</p>
              <p className="pcel-metric-direction">{translateDirection(c.direction, language)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="pcel-star">✦</p>
      <p className="pcel-closing">{translateClosingPhrase(closingPhrase, language)}</p>
      <p className="pcel-heart">🤍</p>
      <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: 1, color: "rgba(241,235,225,0.5)", marginTop: 8 }}>
        bodyshapersystem.com
      </p>
    </div>
  );
});

export default ShareableProgressCard;
