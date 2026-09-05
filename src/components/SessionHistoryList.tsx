"use client";

import { useState } from "react";
import SessionSummaryModal from "./SessionSummaryModal";
import SessionAreaMapCard from "./SessionAreaMapCard";

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
 * real downloadable summary. Styled to match the "Completed Sessions"
 * list from the approved reference (numbered circle, technology +
 * area, download action). Expanding a row shows the actual Session
 * Area Map — the real shaded front/back silhouette via
 * SessionAreaMapCard, not a plain text list of area names (a prior
 * version showed "Areas Treated: X · Y · Z" as text only, which is
 * why expanding a session never visually showed anything shaded).
 * Shared between the Hub's client detail view and the client
 * portal's Systems & Sessions "Sessions" tab, so both show the exact
 * same real records with no duplication.
 */
export default function SessionHistoryList({
  sessions,
  clientName,
  totalCount,
}: {
  sessions: SessionRecord[];
  clientName: string;
  totalCount?: number;
}) {
  const [downloadTarget, setDownloadTarget] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const count = totalCount ?? sessions.length;

  if (sessions.length === 0) {
    return <p className="pay-history-meta" style={{ marginTop: 10 }}>No sessions logged yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
      {sessions.map((s, i) => {
        const tech = s.technologies?.[0];
        const sessionNumber = count - i;
        const dateLabel = new Date(s.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const isOpen = expanded === i;
        return (
          <div key={s.id} className="shl-row">
            <button type="button" className="shl-row-main" onClick={() => setExpanded(isOpen ? null : i)}>
              <span className="shl-num-circle">{sessionNumber}</span>
              <span className="shl-row-text">
                <span className="shl-tech-name">{tech?.name ?? "Session"}</span>
                {tech?.areas && tech.areas.length > 0 && <span className="shl-tech-area">{tech.areas[0].toLowerCase()}</span>}
              </span>
              <span className="shl-row-date">{dateLabel}</span>
              <button
                type="button"
                className="shl-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDownloadTarget(i);
                }}
                aria-label="Download session summary"
              >
                ⬇
              </button>
            </button>

            {isOpen && (
              <div className="shl-row-detail">
                {tech?.areas && tech.areas.length > 0 ? (
                  <SessionAreaMapCard
                    technology={tech.name}
                    areas={tech.areas}
                    objectives={tech.objectives ?? []}
                    notes={s.notes}
                    dateLabel={dateLabel}
                    blueprintAlignment={s.blueprintAlignment}
                  />
                ) : (
                  <p className="pay-history-meta">No treated areas recorded for this session.</p>
                )}
              </div>
            )}

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
