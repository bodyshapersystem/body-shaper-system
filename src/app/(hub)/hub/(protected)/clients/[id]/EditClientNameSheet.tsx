"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateClientNameInfo } from "./actions";

export default function EditClientNameSheet({
  clientId,
  firstName,
  lastName,
  phone,
}: {
  clientId: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateClientNameInfo(clientId, formData);
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
      <button type="button" className="cl-subtle-action" onClick={() => setOpen(true)}>
        Edit Name
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Edit Client Name</h3>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              For fixing bad imports (e.g. a client whose name got saved as their email). Email itself isn't editable here.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                First Name
                <input name="firstName" defaultValue={firstName} required className="sched-select" />
              </label>
              <label className="sched-label">
                Last Name
                <input name="lastName" defaultValue={lastName} className="sched-select" />
              </label>
              <label className="sched-label">
                Phone
                <input name="phone" defaultValue={phone} className="sched-select" />
              </label>
              {error && <p className="sched-error">{error}</p>}
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
