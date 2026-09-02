"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import SessionSummaryCard from "./SessionSummaryCard";

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

export default function SessionSummaryModal({ data, onClose }: { data: SessionSummaryData; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (!cardRef.current) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#1E1A16" });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${data.sessionLabel.replace(/\s+/g, "-").toLowerCase()}-summary.png`;
      a.click();
    } catch {
      setError("Couldn't prepare the summary. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="simg-backdrop" onClick={onClose}>
      <div className="simg-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="simg-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="simg-capture-wrap">
          <SessionSummaryCard ref={cardRef} {...data} />
        </div>
        {error && <p className="sched-error" style={{ marginTop: 10 }}>{error}</p>}
        <div className="simg-actions">
          <button type="button" className="pcel-btn-primary" onClick={handleDownload} disabled={busy} style={{ flex: 1, marginBottom: 0 }}>
            {busy ? "Preparing…" : "DOWNLOAD SUMMARY"}
          </button>
        </div>
      </div>
    </div>
  );
}
