"use client";

import { useState, useTransition } from "react";
import { validateAssessment } from "./blueprint-actions";

export default function StrategySheet({ clientId, ctaLabel }: { clientId: string; ctaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await validateAssessment(clientId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        Modify Strategy
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Modify Strategy</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Baseline Appointment Date
                <input name="baselineAppointmentDate" type="date" className="sched-select" />
              </label>
              <label className="sched-label">
                Validated System (leave blank to keep original)
                <input name="validatedSystem" className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Frequency
                  <input name="validatedFrequency" placeholder="e.g. 2x/week" className="sched-select" />
                </label>
                <label className="sched-label">
                  Session Count
                  <input name="validatedSessionCount" type="number" className="sched-select" />
                </label>
              </div>
              <label className="sched-label">
                Complementary Technologies
                <input name="complementarySessions" className="sched-select" />
              </label>
              <label className="sched-label">
                Home-Care Guidance
                <textarea name="homeCareGuidance" rows={2} className="sched-textarea" />
              </label>
              <label className="sched-label">
                Optimization Notes
                <textarea name="optimizationNotes" rows={2} className="sched-textarea" />
              </label>
              <label className="sched-label">
                Validation Reason
                <textarea name="validationNotes" rows={2} className="sched-textarea" />
              </label>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : ctaLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
