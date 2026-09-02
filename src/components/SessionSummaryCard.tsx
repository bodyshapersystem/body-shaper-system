"use client";

import { forwardRef } from "react";

type SessionSummaryData = {
  clientName: string;
  sessionLabel: string;
  dateLabel: string;
  technology: string;
  areas: string[];
  objectives: string[];
  matchedGoals: string[];
  specialistNotes: string | null;
};

/**
 * Real Session Summary card — same dark editorial styling as the
 * Congratulations/Share Progress cards, captured via html-to-image
 * (not server-generated), avoiding every font/runtime issue that
 * approach hit before. Shows only real, saved session data — no
 * invented objectives or alignment beyond what was actually recorded.
 */
const SessionSummaryCard = forwardRef<HTMLDivElement, SessionSummaryData>(function SessionSummaryCard(
  { clientName, sessionLabel, dateLabel, technology, areas, objectives, matchedGoals, specialistNotes },
  ref
) {
  return (
    <div ref={ref} className="pcel-card" style={{ position: "static", margin: "0 auto", textAlign: "left" }}>
      <div className="pcel-sparkle-ring" style={{ margin: "0 auto 16px" }}>✦</div>
      <h2 className="pcel-headline" style={{ textAlign: "center" }}>{sessionLabel}</h2>
      <p className="pcel-sub" style={{ textAlign: "center" }}>{clientName} · {dateLabel}</p>
      <div className="pcel-divider" />

      <p className="dtj-field-label" style={{ color: "rgba(241,235,225,0.6)" }}>Technology</p>
      <p className="pcel-metric-label" style={{ marginBottom: 14 }}>{technology}</p>

      <p className="dtj-field-label" style={{ color: "rgba(241,235,225,0.6)" }}>Areas Treated</p>
      <p className="pcel-sub" style={{ marginBottom: 14, textAlign: "left" }}>{areas.join(" · ")}</p>

      {objectives.length > 0 && (
        <>
          <p className="dtj-field-label" style={{ color: "rgba(241,235,225,0.6)" }}>Objective</p>
          <p className="pcel-sub" style={{ marginBottom: 14, textAlign: "left" }}>{objectives.join(" · ")}</p>
        </>
      )}

      {matchedGoals.length > 0 && (
        <>
          <p className="dtj-field-label" style={{ color: "rgba(241,235,225,0.6)" }}>Blueprint Alignment™</p>
          <p className="pcel-sub" style={{ marginBottom: 14, textAlign: "left" }}>
            {matchedGoals.length} goal{matchedGoals.length === 1 ? "" : "s"} matched — {matchedGoals.join(", ")}
          </p>
        </>
      )}

      {specialistNotes && (
        <>
          <p className="dtj-field-label" style={{ color: "rgba(241,235,225,0.6)" }}>Specialist Notes</p>
          <p className="pcel-closing" style={{ textAlign: "left", fontSize: 14 }}>&quot;{specialistNotes}&quot;</p>
        </>
      )}

      <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: 1, color: "rgba(241,235,225,0.5)", marginTop: 16, textAlign: "center" }}>
        bodyshapersystem.com
      </p>
    </div>
  );
});

export default SessionSummaryCard;
