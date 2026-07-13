"use client";

import { useState, useTransition } from "react";
import { createTeamMember } from "./actions";

const ROLES = [
  { id: "role_manager", label: "Manager" },
  { id: "role_specialist", label: "Therapist" },
  { id: "role_marketing", label: "Marketing / Social Media" },
];

export default function InviteMemberSheet() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createTeamMember(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        + Invite Team Member
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            {success ? (
              <>
                <h3 className="bp-sheet-title">Invitation Sent</h3>
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>
                  A real invitation email has been sent — they'll set their own password to activate their account.
                </p>
                <button
                  type="button"
                  className="sched-cta"
                  onClick={() => {
                    setOpen(false);
                    setSuccess(false);
                    window.location.reload();
                  }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="bp-sheet-title">Invite Team Member</h3>
                <form action={handleSubmit} className="bp-sheet-form">
                  <div className="bp-sheet-grid">
                    <label className="sched-label">
                      First Name
                      <input name="firstName" required className="sched-select" />
                    </label>
                    <label className="sched-label">
                      Last Name
                      <input name="lastName" required className="sched-select" />
                    </label>
                  </div>
                  <label className="sched-label">
                    Email
                    <input name="email" type="email" required className="sched-select" />
                  </label>
                  <label className="sched-label">
                    Phone (optional)
                    <input name="phone" className="sched-select" />
                  </label>
                  <label className="sched-label">
                    Role
                    <select name="roleId" defaultValue="role_specialist" className="sched-select">
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {error && <p className="sched-error">{error}</p>}
                  <div className="bp-sheet-actions">
                    <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="sched-cta" disabled={isPending}>
                      {isPending ? "Sending…" : "Send Invitation"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
