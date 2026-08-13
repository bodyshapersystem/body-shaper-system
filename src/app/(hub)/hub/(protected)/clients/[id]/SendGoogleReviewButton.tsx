"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendGoogleReviewRequestNow } from "./blueprint-actions";

export default function SendGoogleReviewButton({
  clientId,
  assessmentId,
  alreadySent,
}: {
  clientId: string;
  assessmentId: string;
  alreadySent: boolean;
}) {
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
      const result = await sendGoogleReviewRequestNow(clientId, assessmentId);
      setConfirming(false);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage(result?.emailSent ? "Sent — review request emailed." : `Failed to send: ${result?.emailError ?? "unknown error"}`);
      router.refresh();
    });
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" className="sched-secondary-btn" onClick={handleClick} disabled={isPending}>
        {isPending ? "Sending…" : confirming ? "Click again to confirm" : alreadySent ? "Resend Review Request" : "Request Google Review"}
      </button>
      {confirming && !isPending && (
        <p className="pay-history-meta" style={{ marginTop: 6 }}>
          Sends the review-request email to the client right now.
        </p>
      )}
      {alreadySent && !confirming && !message && (
        <p className="pay-history-meta" style={{ marginTop: 6 }}>Already sent once for this system.</p>
      )}
      {message && <p className="pay-history-meta" style={{ marginTop: 6 }}>{message}</p>}
    </div>
  );
}
