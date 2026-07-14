"use client";

import { useState, useTransition } from "react";
import { updatePersonalizedPlan } from "./blueprint-actions";

const SYSTEMS = ["ExiLipo Signature™", "Sculpt Signature™", "Mom Reset™", "GLP-1 Reshape™", "Custom System"];

export default function EditPersonalizedSystemSheet({
  clientId,
  currentSystem,
  currentFrequency,
  currentSessionCount,
}: {
  clientId: string;
  currentSystem: string | null;
  currentFrequency: string | null;
  currentSessionCount: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updatePersonalizedPlan(clientId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="dash-view-btn" onClick={() => setOpen(true)}>
        Edit Personalized System™
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Edit Personalized System™</h3>
            <p className="pay-history-meta" style={{ marginBottom: 16 }}>
              Editable any time — doesn't affect Blueprint validation status.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Assigned System
                <select name="recommendedSystem" defaultValue={currentSystem ?? ""} className="sched-select">
                  <option value="">Not set</option>
                  {SYSTEMS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Weekly Frequency
                  <input name="validatedFrequency" defaultValue={currentFrequency ?? ""} placeholder="e.g. 2x/week" className="sched-select" />
                </label>
                <label className="sched-label">
                  Number of Sessions
                  <input name="validatedSessionCount" type="number" defaultValue={currentSessionCount ?? ""} className="sched-select" />
                </label>
              </div>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
