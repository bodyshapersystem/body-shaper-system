"use client";

import { useState, useTransition } from "react";
import { addBodyComposition } from "./blueprint-actions";

export default function BodyCompositionSheet({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addBodyComposition(clientId, formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="bp-manual-entry-link" onClick={() => setOpen(true)}>
        Enter Manually — Backup Only
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Manual Body Composition Entry</h3>
            <p className="dash-hint" style={{ marginTop: -10, marginBottom: 16, opacity: 0.65, fontSize: 12.5 }}>
              RENPHO remains the primary source of truth. Use this only when a scan can't be imported.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Date
                <input name="measuredAt" type="date" required className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Weight (kg)
                  <input name="weightKg" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  BMI
                  <input name="bmi" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Body Fat %
                  <input name="bodyFatPercent" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Muscle Mass (kg)
                  <input name="muscleMassKg" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Skeletal Muscle (kg)
                  <input name="skeletalMuscleKg" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Body Water %
                  <input name="bodyWaterPercent" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Protein %
                  <input name="proteinPercent" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Visceral Fat
                  <input name="visceralFat" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Bone Mass (kg)
                  <input name="boneMassKg" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  BMR
                  <input name="bmr" type="number" className="sched-select" />
                </label>
                <label className="sched-label">
                  Metabolic Age
                  <input name="bodyAge" type="number" className="sched-select" />
                </label>
                <label className="sched-label">
                  Subcutaneous Fat %
                  <input name="subcutaneousFatPercent" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Fat-Free Weight (kg)
                  <input name="fatFreeWeightKg" type="number" step="0.1" className="sched-select" />
                </label>
              </div>
              <label className="sched-label">
                Notes
                <textarea name="notes" rows={2} className="sched-textarea" />
              </label>
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : "Save Scan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
