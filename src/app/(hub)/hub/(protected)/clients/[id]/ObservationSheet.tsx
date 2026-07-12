"use client";

import { useState, useTransition } from "react";
import { addObservation } from "./blueprint-actions";

export default function ObservationSheet({ clientId, label = "+ Add Observation" }: { clientId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addObservation(clientId, formData);
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
            <h3 className="bp-sheet-title">Add Observation</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Observation
                <textarea name="body" rows={3} required className="sched-textarea" />
              </label>
              <label className="sched-label">
                Visibility
                <select name="visibility" defaultValue="INTERNAL_ONLY" className="sched-select">
                  <option value="INTERNAL_ONLY">Internal Only</option>
                  <option value="CLIENT_VISIBLE">Client Visible</option>
                </select>
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
