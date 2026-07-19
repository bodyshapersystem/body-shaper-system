"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSystemDetails } from "./blueprint-actions";

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
                <input name="recommendedSystem" defaultValue={recommendedSystem} className="sched-select" />
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
