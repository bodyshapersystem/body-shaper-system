"use client";

import { useState, useTransition } from "react";
import { addProfessionalMeasurement } from "./blueprint-actions";

export default function MeasurementSheet({ clientId, label = "+ Update Measurements" }: { clientId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addProfessionalMeasurement(clientId, formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Update Measurements</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Date
                <input name="measuredAt" type="date" required className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Waist (cm)
                  <input name="waistCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  High Waist (cm)
                  <input name="highWaistCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Lower Abdomen (cm)
                  <input name="lowerAbdomenCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Hips (cm)
                  <input name="hipsCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Chest (cm)
                  <input name="chestCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Right Arm (cm)
                  <input name="rightArmCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Left Arm (cm)
                  <input name="leftArmCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Right Thigh (cm)
                  <input name="rightThighCm" type="number" step="0.1" className="sched-select" />
                </label>
                <label className="sched-label">
                  Left Thigh (cm)
                  <input name="leftThighCm" type="number" step="0.1" className="sched-select" />
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
                  {isPending ? "Saving…" : "Save Measurement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
