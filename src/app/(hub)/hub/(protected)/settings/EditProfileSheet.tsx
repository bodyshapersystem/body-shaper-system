"use client";

import { useState, useTransition } from "react";
import { updateOwnProfile } from "./actions";

export default function EditProfileSheet({ fullName, phone }: { fullName: string; phone: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateOwnProfile(formData);
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
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Name
                <input name="fullName" defaultValue={fullName} required className="sched-select" />
              </label>
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
