"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordRenphoScan } from "./blueprint-actions";

export default function RecordRenphoScanSheet({ clientId, assessmentId }: { clientId: string; assessmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await recordRenphoScan(clientId, assessmentId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button type="button" className="bbp-edit-link" onClick={() => setOpen(true)}>
        + Record Scan
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Record RENPHO Scan</h3>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Only fill in what you have — every field except date is optional. Save works fine with just a few real numbers.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Scan Date *
                <input name="scanDate" type="date" defaultValue={today} required className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Weight (kg)<input name="weightKg" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">BMI<input name="bmi" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Body Fat %<input name="bodyFatPercent" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Visceral Fat<input name="visceralFat" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Muscle Mass (kg)<input name="muscleMassKg" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Skeletal Muscle (kg)<input name="skeletalMuscleKg" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Body Water %<input name="bodyWaterPercent" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Protein %<input name="proteinPercent" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">Bone Mass (kg)<input name="boneMassKg" type="number" step="0.1" className="sched-select" /></label>
                <label className="sched-label">BMR (kcal)<input name="bmr" type="number" className="sched-select" /></label>
                <label className="sched-label">Metabolic Age<input name="bodyAge" type="number" className="sched-select" /></label>
                <label className="sched-label">Fat-Free Weight (kg)<input name="fatFreeWeightKg" type="number" step="0.1" className="sched-select" /></label>
              </div>
              <label className="sched-label">
                Notes
                <textarea name="notes" rows={2} className="sched-textarea" />
              </label>
              {error && <p className="sched-error">{error}</p>}
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
