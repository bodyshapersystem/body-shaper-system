"use client";

import { useState, useTransition } from "react";
import { setBodyType } from "./blueprint-actions";
import { BODY_TYPE_CONTENT, BODY_TYPE_OPTIONS } from "@/lib/body-types";
import type { BodyType } from "@prisma/client";

export default function BodyTypeSheet({
  clientId,
  currentBodyType,
}: {
  clientId: string;
  currentBodyType: BodyType | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    const value = String(formData.get("bodyType") || "");
    startTransition(async () => {
      const result = await setBodyType(clientId, value);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        {currentBodyType ? "Change Body Profile" : "Set Body Profile"}
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Body Profile™</h3>
            <p style={{ fontSize: 12.5, opacity: 0.7, marginBottom: 14 }}>
              Set once by the specialist during assessment. This drives the Blueprint illustration,
              the Blueprint PDF, and the Client Portal — it is never recalculated automatically.
            </p>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Body Type
                <select name="bodyType" className="sched-select" defaultValue={currentBodyType ?? ""}>
                  <option value="" disabled>
                    Select a body type…
                  </option>
                  {BODY_TYPE_OPTIONS.map((key) => (
                    <option key={key} value={key}>
                      {BODY_TYPE_CONTENT[key].label}
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
                  {isPending ? "Saving…" : "Save Body Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
