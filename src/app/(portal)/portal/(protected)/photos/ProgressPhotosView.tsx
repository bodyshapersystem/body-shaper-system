"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UnitToggle from "@/components/UnitToggle";
import { formatLength, type LengthUnit } from "@/lib/units";
import type { MeasurementCallout } from "@/lib/progress-photo-callouts";
import type { MetricChange } from "@/lib/progress-celebration";
import PhotoDownloadButton from "./PhotoDownloadButton";
import DownloadSessionButton from "./DownloadSessionButton";
import ProgressCelebrationOverlay from "@/app/(portal)/portal/(protected)/blueprint/ProgressCelebrationOverlay";
import ShareImageModal from "@/app/(portal)/portal/(protected)/blueprint/ShareImageModal";
import { markPhotoCelebrationSeen } from "@/app/(portal)/portal/(protected)/blueprint/celebration-actions";

const SLOT_LABELS: Record<string, string> = { FRONT: "Front", LEFT: "Left", RIGHT: "Right", BACK: "Back" };
const ANGLES = ["FRONT", "LEFT", "RIGHT", "BACK"] as const;

type SessionPhoto = { photo: { id: string; type: string }; url: string | null };
type Session = {
  sessionNumber: number;
  dateLabel: string;
  photos: SessionPhoto[];
  isComplete: boolean;
  measurements: Record<string, number | null> | null;
};

export default function ProgressPhotosView({
  sessions,
  firstSessionNumber,
  latestSessionNumber,
  finalCallouts,
  celebration,
}: {
  sessions: Session[];
  firstSessionNumber: number | null;
  latestSessionNumber: number | null;
  finalCallouts: MeasurementCallout[];
  celebration: { sessionNumber: number; changes: MetricChange[] } | null;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [compareAngle, setCompareAngle] = useState<(typeof ANGLES)[number]>("FRONT");
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set(sessions.map((s) => s.sessionNumber)));
  const [showCelebration, setShowCelebration] = useState(!!celebration);
  const [shareModalData, setShareModalData] = useState<MetricChange[] | null>(null);

  function dismissCelebration() {
    setShowCelebration(false);
    if (celebration) {
      markPhotoCelebrationSeen(celebration.sessionNumber).catch(() => undefined);
      router.refresh();
    }
  }

  function toggleSession(n: number) {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  const firstSession = sessions.find((s) => s.sessionNumber === firstSessionNumber) ?? null;
  const latestSession = sessions.find((s) => s.sessionNumber === latestSessionNumber) ?? null;

  function findAngleWithFallback(session: Session | null, angle: string): SessionPhoto | null {
    if (!session) return null;
    const found = session.photos.find((p) => p.photo.type === angle);
    if (found?.url) return found;
    return null;
  }

  function findLatestValidAngle(angle: string): { session: Session; photo: SessionPhoto } | null {
    for (let i = sessions.length - 1; i >= 0; i--) {
      const s = sessions[i];
      const found = findAngleWithFallback(s, angle);
      if (found) return { session: s, photo: found };
    }
    return null;
  }

  const beforePhoto = firstSession ? findAngleWithFallback(firstSession, compareAngle) : null;
  const afterMatch = findLatestValidAngle(compareAngle);
  const showComparison = beforePhoto && afterMatch && afterMatch.session.sessionNumber !== firstSession?.sessionNumber;

  // Final Comparison always uses the Front angle specifically (the
  // standard view for waist/abdomen/hips/leg visibility), independent
  // of whatever angle is selected in Latest Comparison above.
  const finalBeforePhoto = firstSession ? findAngleWithFallback(firstSession, "FRONT") : null;
  const finalAfterMatch = findLatestValidAngle("FRONT");
  const showFinalPhotos = finalBeforePhoto && finalAfterMatch && finalAfterMatch.session.sessionNumber !== firstSession?.sessionNumber;

  return (
    <div className="pp-wrap">
      <div className="pp-header">
        <p className="portal-eyebrow">VISUAL PROOF OF PROGRESS</p>
        <h1>progress photos.</h1>
        <p className="portal-page-sub">Track your transformation with session-by-session visual comparisons.</p>
        <span className="pp-badge">REAL RESULTS ONLY</span>
      </div>

      <div className="pp-controls-row">
        <UnitToggle value={unit} options={["cm", "in"]} onChange={setUnit} />
      </div>

      <p className="pp-trust-note">Photos are displayed without retouching or body modification.</p>

      {sessions.length === 0 ? (
        <div className="simple-card">
          <p className="dash-empty">No progress photos yet — your specialist will capture these during your sessions.</p>
        </div>
      ) : (
        <>
          {showComparison && (
            <div className="pp-luxury-card" style={{ marginBottom: 28 }}>
              <p className="pp-section-title">latest comparison</p>
              <div className="pp-angle-switch">
                {ANGLES.map((a) => (
                  <button key={a} type="button" className={`pp-angle-pill ${compareAngle === a ? "pp-angle-pill-active" : ""}`} onClick={() => setCompareAngle(a)}>
                    {SLOT_LABELS[a]}
                  </button>
                ))}
              </div>
              <div className="pp-compare-grid">
                <div className="pp-photo-col">
                  <img src={beforePhoto!.url!} alt="Before" className="pp-photo-img" />
                  <p className="pp-photo-caption">BEFORE — Session {firstSession!.sessionNumber} · {firstSession!.dateLabel}</p>
                </div>
                <div className="pp-photo-col">
                  <img src={afterMatch!.photo.url!} alt="After" className="pp-photo-img" />
                  <p className="pp-photo-caption">AFTER — Session {afterMatch!.session.sessionNumber} · {afterMatch!.session.dateLabel}</p>
                </div>
              </div>
            </div>
          )}

          <p className="pp-section-title" style={{ marginBottom: 12 }}>session gallery</p>
          {sessions.map((session) => {
            const expanded = expandedSessions.has(session.sessionNumber);
            const downloadable = session.photos.filter((p) => p.url).map((p) => ({ url: p.url as string, filename: `session-${session.sessionNumber}-${p.photo.type.toLowerCase()}.jpg` }));
            return (
              <div className="pp-luxury-card" key={session.sessionNumber} style={{ marginBottom: 18 }}>
                <button type="button" className="pp-session-header" onClick={() => toggleSession(session.sessionNumber)}>
                  <span>
                    SESSION {String(session.sessionNumber).padStart(2, "0")} — {session.dateLabel.toUpperCase()}
                    {!session.isComplete ? " (IN PROGRESS)" : ""}
                  </span>
                  <span className="pp-session-chevron">{expanded ? "▲" : "▼"}</span>
                </button>

                {expanded && (
                  <>
                    <div className="pp-session-grid">
                      {ANGLES.map((angle) => {
                        const found = session.photos.find((p) => p.photo.type === angle);
                        return (
                          <div className="pp-photo-col" key={angle}>
                            {found?.url ? (
                              <>
                                <img src={found.url} alt={SLOT_LABELS[angle]} className="pp-photo-img" />
                                <div className="pp-photo-footer">
                                  <span className="pp-photo-label">{SLOT_LABELS[angle]}</span>
                                  <PhotoDownloadButton url={found.url} filename={`session-${session.sessionNumber}-${angle.toLowerCase()}.jpg`} label={`Download ${SLOT_LABELS[angle]}`} />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="pp-photo-placeholder">Not yet taken</div>
                                <p className="pp-photo-label">{SLOT_LABELS[angle]}</p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {session.measurements && (
                      <div className="pp-session-measurements">
                        <p className="pp-mini-label">measurements this session</p>
                        <div className="pp-measurement-chips">
                          {Object.entries(session.measurements)
                            .filter(([, v]) => v != null)
                            .map(([key, v]) => (
                              <span key={key} className="pp-measurement-chip">
                                {key.replace("Cm", "")}: <strong>{formatLength(v as number, unit)}</strong>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {downloadable.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <DownloadSessionButton photos={downloadable} />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {firstSession && latestSession && firstSession !== latestSession && finalCallouts.length > 0 && (
            <div className="pp-final-comparison" style={{ marginTop: 30 }}>
              <p className="pp-section-title">final comparison</p>
              <p className="pp-final-sub">
                BEFORE — Session {firstSession.sessionNumber} · {firstSession.dateLabel}
                <br />
                AFTER — Session {latestSession.sessionNumber} · {latestSession.dateLabel}
              </p>

              {showFinalPhotos && (
                <div className="pp-final-photo-grid">
                  <div className="pp-photo-col">
                    <img src={finalBeforePhoto!.url!} alt="Before" className="pp-photo-img" />
                    <p className="pp-photo-caption">BEFORE</p>
                  </div>
                  <div className="pp-photo-col">
                    <img src={finalAfterMatch!.photo.url!} alt="After" className="pp-photo-img" />
                    <p className="pp-photo-caption">AFTER</p>
                  </div>
                </div>
              )}

              <div className="pp-callouts-row" style={{ marginTop: showFinalPhotos ? 22 : 0 }}>
                {finalCallouts.map((c) => (
                  <div key={c.label} className="pp-callout">
                    <p className="pp-callout-label">
                      <span className="pp-callout-dot" />
                      {c.label}
                    </p>
                    <p className="pp-callout-value">
                      {c.deltaCm > 0 ? "+" : ""}
                      {formatLength(c.deltaCm, unit)}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
                <button
                  type="button"
                  className="pp-angle-pill"
                  onClick={() =>
                    setShareModalData(
                      finalCallouts.map((c) => ({
                        label: c.label,
                        deltaText: `${c.deltaCm > 0 ? "+" : ""}${formatLength(c.deltaCm, unit)}`,
                        direction: c.deltaCm < 0 ? "down" : "up",
                      }))
                    )
                  }
                >
                  SHARE RESULTS ↗
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showCelebration && celebration && (
        <ProgressCelebrationOverlay
          category="PROGRESS PHOTOS"
          changes={celebration.changes}
          closingPhrase={"The commitment, care, and teamwork behind your journey are showing.\nYour consistency and the strategy we've built together are reflected in your progress."}
          compareLabel="since your last check-in"
          onDismiss={dismissCelebration}
          onShareClick={() => setShareModalData(celebration.changes)}
        />
      )}

      {shareModalData && (
        <ShareImageModal
          category="PROGRESS PHOTOS"
          changes={shareModalData}
          closingPhrase={"The commitment, care, and teamwork behind your journey are showing.\nYour consistency and the strategy we've built together are reflected in your progress."}
          compareLabel="since your last check-in"
          onClose={() => setShareModalData(null)}
        />
      )}
    </div>
  );
}
