"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSystemDetails } from "./blueprint-actions";

const REAL_SYSTEMS = ["Sculpt Start™", "Sculpt Signature™", "Mom Reset™", "GLP-1 Reshape™", "Total Body Optimization™"];

export default function EditSystemDetailsSheet({
  assessmentId,
  recommendedSystem,
  treatmentInterests,
  goals,
  validatedFrequency,
  validatedSessionCount,
  complementarySessions,
  homeCareGuidance,
}: {
  assessmentId: string;
  recommendedSystem: string;
  treatmentInterests: string;
  goals: string;
  validatedFrequency: string;
  validatedSessionCount: string;
  complementarySessions: string;
  homeCareGuidance: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isKnownSystem = REAL_SYSTEMS.includes(recommendedSystem);
  const [systemChoice, setSystemChoice] = useState(isKnownSystem ? recommendedSystem : recommendedSystem ? "Custom" : "");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateSystemDetails(assessmentId, formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="bbp-edit-link" onClick={() => setOpen(true)}>
        Edit
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Edit System Details</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Personalized System™ Name
                <select
                  value={systemChoice}
                  onChange={(e) => setSystemChoice(e.target.value)}
                  className="sched-select"
                >
                  <option value="" disabled>Select a system…</option>
                  {REAL_SYSTEMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Custom">Custom…</option>
                </select>
                {systemChoice === "Custom" ? (
                  <input name="recommendedSystem" defaultValue={isKnownSystem ? "" : recommendedSystem} placeholder="Enter custom system name" className="sched-select" style={{ marginTop: 8 }} />
                ) : (
                  <input type="hidden" name="recommendedSystem" value={systemChoice} />
                )}
              </label>
              <label className="sched-label">
                Treatment Interests
                <input name="treatmentInterests" defaultValue={treatmentInterests} className="sched-select" />
              </label>
              <label className="sched-label">
                Goals
                <textarea name="goals" defaultValue={goals} rows={2} className="sched-textarea" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Frequency
                  <input name="validatedFrequency" defaultValue={validatedFrequency} className="sched-select" />
                </label>
                <label className="sched-label">
                  Sessions
                  <input name="validatedSessionCount" type="number" defaultValue={validatedSessionCount} className="sched-select" />
                </label>
              </div>
              <label className="sched-label">
                Complementary Sessions
                <input name="complementarySessions" defaultValue={complementarySessions} className="sched-select" />
              </label>
              <label className="sched-label">
                Home Care Guidance
                <textarea name="homeCareGuidance" defaultValue={homeCareGuidance} rows={2} className="sched-textarea" />
              </label>
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
