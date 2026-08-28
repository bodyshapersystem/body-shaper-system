"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addNewSystem } from "./blueprint-actions";

export default function AddNewSystemButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await addNewSystem(clientId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="sched-secondary-btn" onClick={() => setOpen(true)}>
        + Add New System
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Add New System</h3>
            <p className="pay-history-meta" style={{ marginBottom: 16 }}>
              This starts a new Blueprint version for a package the client just purchased — her prior completed system stays exactly as it is, fully in her history.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                System Name *
                <input name="systemName" type="text" placeholder="e.g. Sculpt Signature™" required className="sched-select" />
              </label>
              <label className="sched-label">
                Sessions Purchased
                <input name="sessionCount" type="number" min="1" className="sched-select" />
              </label>
              <label className="sched-label">
                Package Total ($)
                <input name="planTotalDollars" type="number" step="0.01" min="0" className="sched-select" />
              </label>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Creating…" : "Create New System"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
