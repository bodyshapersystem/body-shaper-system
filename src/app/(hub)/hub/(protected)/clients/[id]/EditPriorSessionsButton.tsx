"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPriorCompletedSessions } from "./blueprint-actions";

export default function EditPriorSessionsButton({ assessmentId, currentValue }: { assessmentId: string; currentValue: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await setPriorCompletedSessions(assessmentId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" className="cl-edit-sessions-link" onClick={() => setOpen(true)}>
        adjust prior sessions credit
      </button>
    );
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
      <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "#8a7f74", margin: 0 }}>
        Sessions completed before joining the portal — added on top of real completed appointments.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          name="priorCompletedSessions"
          type="number"
          min={0}
          defaultValue={currentValue}
          className="sched-select"
          style={{ width: 70, padding: "6px 8px" }}
        />
        <button type="submit" className="sched-secondary-btn" disabled={isPending} style={{ padding: "6px 12px" }}>
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" className="cl-edit-sessions-link" onClick={() => setOpen(false)}>
          cancel
        </button>
      </div>
      {error && <span style={{ fontSize: 11.5, color: "#8B3A3F" }}>{error}</span>}
    </form>
  );
}
