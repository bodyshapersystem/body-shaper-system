"use client";

import { useState, useTransition } from "react";
import PasswordInput from "@/components/auth/PasswordInput";
import { changeOwnPortalPassword } from "./actions";

export default function PortalPasswordChangeSheet() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    startTransition(async () => {
      const result = await changeOwnPortalPassword(password);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <>
      <button type="button" className="dash-view-btn" onClick={() => setOpen(true)}>
        Change Password
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            {success ? (
              <>
                <h3 className="bp-sheet-title">Password Updated</h3>
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>Your password has been changed successfully.</p>
                <button type="button" className="sched-cta" onClick={() => setOpen(false)}>
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="bp-sheet-title">Change Password</h3>
                <form onSubmit={handleSubmit} className="bp-sheet-form">
                  <label className="sched-label">
                    New Password
                    <PasswordInput id="new-pw" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </label>
                  <label className="sched-label">
                    Confirm New Password
                    <PasswordInput id="confirm-pw" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </label>
                  {error && <p className="sched-error">{error}</p>}
                  <div className="bp-sheet-actions">
                    <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="sched-cta" disabled={isPending}>
                      {isPending ? "Updating…" : "Update Password"}
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
