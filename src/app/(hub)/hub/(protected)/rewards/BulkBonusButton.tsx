"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkAwardActiveClientBonus } from "./catalog-actions";

export default function BulkBonusButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("100");
  const [label, setLabel] = useState("Society Launch Bonus");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAward() {
    startTransition(async () => {
      const result = await bulkAwardActiveClientBonus(Number(points), label);
      if (result?.success) {
        setMessage(`Awarded ${points} Society Points to ${result.awardedCount} active clients (${result.skippedCount} already had this bonus).`);
      } else {
        setMessage(result?.error ?? "Something went wrong.");
      }
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="dash-view-btn" onClick={() => setOpen(true)}>
        + Bulk Bonus for Active Clients
      </button>
      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Bulk Bonus for Active Clients</h3>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Awards Society Points to every active (not paused) client. Safe to click again later — anyone who already got this exact bonus label is skipped.
            </p>
            <label className="sched-label">
              Society Points
              <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="sched-select" />
            </label>
            <label className="sched-label">
              Bonus Label
              <input value={label} onChange={(e) => setLabel(e.target.value)} className="sched-select" />
            </label>
            {message && <p className="pay-history-meta" style={{ marginTop: 8 }}>{message}</p>}
            <div className="bp-sheet-actions">
              <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>Close</button>
              <button type="button" className="sched-cta" disabled={isPending} onClick={handleAward}>
                {isPending ? "Awarding…" : "Award to All Active Clients"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
