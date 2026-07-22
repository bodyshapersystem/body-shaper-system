"use client";

import { useState, useTransition } from "react";
import { sendPaymentReminderAction } from "./actions";

export default function SendPaymentReminderButton({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      const result = await sendPaymentReminderAction(clientId);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage(result?.emailSent ? `Reminder sent (${result.amountLabel} due).` : `Could not send: ${result?.emailError ?? "unknown error"}`);
    });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <button type="button" className="sched-secondary-btn" onClick={handleClick} disabled={isPending}>
        {isPending ? "Sending…" : "Send Payment Reminder"}
      </button>
      {message && <p className="pay-history-meta" style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
