"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markSystemCompleted } from "./blueprint-actions";

export default function MarkSystemCompletedButton({ clientId, assessmentId }: { clientId: string; assessmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setMessage("");
    startTransition(async () => {
      const result = await markSystemCompleted(clientId, assessmentId);
      setConfirming(false);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage(result?.emailSent ? "Sent — client notified their system is complete." : `Marked complete, but the email failed: ${result?.emailError ?? "unknown error"}`);
      router.refresh();
    });
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" className="sched-secondary-btn" onClick={handleClick} disabled={isPending}>
        {isPending ? "Sending…" : confirming ? "Click again to confirm" : "Finish System"}
      </button>
      {confirming && !isPending && (
        <p className="pay-history-meta" style={{ marginTop: 6 }}>
          This sends the real completion email to the client right now.
        </p>
      )}
      {message && <p className="pay-history-meta" style={{ marginTop: 6 }}>{message}</p>}
    </div>
  );
}
