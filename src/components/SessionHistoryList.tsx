"use client";

import { useState } from "react";
import SessionSummaryModal from "./SessionSummaryModal";

type SessionRecord = {
  id: string;
  startsAt: string;
  status: string;
  technologies: { name: string; areas?: string[]; objectives?: string[] }[] | null;
  blueprintAlignment: { matched: string[]; unmatched: string[] } | null;
  notes: string | null;
};

/**
 * Real Session History — every logged session (technology, real
 * treated areas, real auto-generated objectives, real Blueprint
 * Alignment™ snapshot frozen at the time it was saved), each with a
 * real downloadable summary. Shared between the Hub's client detail
 * view and the client portal's Systems & Sessions "Sessions" tab, so
 * both show the exact same real records with no duplication.
 */
export default function SessionHistoryList({ sessions, clientName }: { sessions: SessionRecord[]; clientName: string }) {
  const [downloadTarget, setDownloadTarget] = useState<number | null>(null);

  if (sessions.length === 0) {
    return <p className="pay-history-meta" style={{ marginTop: 10 }}>No sessions logged yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      {sessions.map((s, i) => {
        const tech = s.technologies?.[0];
        const sessionNumber = sessions.length - i;
        const dateLabel = new Date(s.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return (
          <div key={s.id} className="cah-appt-row">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="cah-appt-title">SESSION {String(sessionNumber).padStart(2, "0")}</p>
              <span className="isd-protocol-tag" style={{ marginTop: 0 }}>{s.status.toLowerCase()}</span>
            </div>
            <p className="pay-history-meta">{dateLabel}{tech ? ` · ${tech.name}` : ""}</p>
            {tech?.areas && tech.areas.length > 0 && (
              <p className="pay-history-meta" style={{ marginTop: 4 }}>
                <strong>Areas Treated:</strong> {tech.areas.join(" · ")}
              </p>
            )}
            {tech?.objectives && tech.objectives.length > 0 && (
              <p className="pay-history-meta" style={{ marginTop: 4 }}>
                <strong>Objective:</strong> {tech.objectives.join(" · ")}
              </p>
            )}
            {s.blueprintAlignment && s.blueprintAlignment.matched.length > 0 && (
              <p className="pay-history-meta" style={{ marginTop: 4, color: "var(--mocha)" }}>
                ✓ Blueprint Alignment™ — {s.blueprintAlignment.matched.length} goal{s.blueprintAlignment.matched.length === 1 ? "" : "s"} matched: {s.blueprintAlignment.matched.join(", ")}
              </p>
            )}
            {s.notes && (
              <p className="pay-history-meta" style={{ marginTop: 4, fontStyle: "italic" }}>
                &quot;{s.notes}&quot;
              </p>
            )}
            <button type="button" className="dtj-link-small" style={{ marginTop: 8 }} onClick={() => setDownloadTarget(i)}>
              DOWNLOAD SUMMARY →
            </button>

            {downloadTarget === i && (
              <SessionSummaryModal
                onClose={() => setDownloadTarget(null)}
                data={{
                  clientName,
                  sessionLabel: `Session ${String(sessionNumber).padStart(2, "0")}`,
                  dateLabel,
                  technology: tech?.name ?? "—",
                  areas: tech?.areas ?? [],
                  objectives: tech?.objectives ?? [],
                  matchedGoals: s.blueprintAlignment?.matched ?? [],
                  specialistNotes: s.notes,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
