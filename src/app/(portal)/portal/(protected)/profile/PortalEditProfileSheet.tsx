"use client";

import { useState, useTransition } from "react";
import { updateOwnPortalProfile } from "./actions";

export default function PortalEditProfileSheet({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateOwnPortalProfile(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="dash-view-btn" onClick={() => setOpen(true)}>
        Edit Profile
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Edit Profile</h3>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Your name and email are tied to your records — message your specialist if these need to change.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Phone
                <input name="phone" defaultValue={phone} className="sched-select" />
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
