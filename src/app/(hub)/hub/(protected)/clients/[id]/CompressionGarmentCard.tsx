"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCompressionGarment } from "./blueprint-actions";

export default function CompressionGarmentCard({
  assessmentId,
  recommended: initialRecommended,
  hoursPerDay: initialHours,
  duration: initialDuration,
  durationUnit: initialUnit,
  note: initialNote,
}: {
  assessmentId: string;
  recommended: boolean;
  hoursPerDay: number | null;
  duration: number | null;
  durationUnit: string | null;
  note: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [recommended, setRecommended] = useState(initialRecommended);
  const [hours, setHours] = useState(initialHours?.toString() ?? "");
  const [duration, setDuration] = useState(initialDuration?.toString() ?? "");
  const [unit, setUnit] = useState(initialUnit ?? "weeks");
  const [note, setNote] = useState(initialNote ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const formData = new FormData();
    formData.set("recommended", String(recommended));
    formData.set("hoursPerDay", hours);
    formData.set("duration", duration);
    formData.set("durationUnit", unit);
    formData.set("note", note);
    startTransition(async () => {
      await updateCompressionGarment(assessmentId, formData);
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="cg-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="cah-appt-title" style={{ margin: 0 }}>Compression Garment</p>
          <button type="button" className="dtj-link-small" onClick={() => setEditing(true)}>Edit</button>
        </div>
        {initialRecommended ? (
          <>
            <p className="pjic-status-active" style={{ margin: "4px 0 0" }}>Recommended ✓</p>
            <p className="pay-history-meta" style={{ marginTop: 2 }}>
              {initialHours ? `${initialHours} hours per day` : "Hours not set"} · {initialDuration ? `${initialDuration} ${initialUnit}` : "Duration not set"}
            </p>
            {initialNote && <p className="pay-history-meta" style={{ marginTop: 4, fontStyle: "italic" }}>&quot;{initialNote}&quot;</p>}
          </>
        ) : (
          <p className="pay-history-meta" style={{ marginTop: 4 }}>Not Recommended</p>
        )}
      </div>
    );
  }

  return (
    <div className="cg-card">
      <p className="cah-appt-title" style={{ marginBottom: 10 }}>Compression Garment</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className={`pp-angle-pill ${recommended ? "pp-angle-pill-active" : ""}`} onClick={() => setRecommended(true)}>
          Recommended
        </button>
        <button type="button" className={`pp-angle-pill ${!recommended ? "pp-angle-pill-active" : ""}`} onClick={() => setRecommended(false)}>
          Not Recommended
        </button>
      </div>

      {recommended && (
        <>
          <label className="sched-label">
            Hours per day
            <input type="number" min="0" max="24" value={hours} onChange={(e) => setHours(e.target.value)} className="sched-select" />
          </label>
          <label className="sched-label" style={{ marginTop: 10, display: "block" }}>
            Duration
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} className="sched-select" style={{ flex: 1 }} />
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="sched-select" style={{ flex: 1 }}>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
            </div>
          </label>
          <label className="sched-label" style={{ marginTop: 10, display: "block" }}>
            Specialist Note (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="sched-textarea" placeholder="Add an optional recommendation or instruction..." />
          </label>
        </>
      )}

      <div className="bp-sheet-actions" style={{ marginTop: 14 }}>
        <button type="button" className="sched-secondary-btn" onClick={() => setEditing(false)}>Cancel</button>
        <button type="button" className="sched-cta" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
