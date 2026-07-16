"use client";

import { useState } from "react";
import { requestNextSession } from "../daily-trackers/actions";

export default function BookSessionButton() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSend() {
    setIsPending(true);
    const result = await requestNextSession(note);
    setIsPending(false);
    if (result?.success) setSent(true);
  }

  if (sent) {
    return <p style={{ color: "#F6F3EE", fontFamily: "var(--sans)", fontSize: 13 }}>Request sent — we'll be in touch!</p>;
  }

  return (
    <>
      <button type="button" className="apt-new-btn" onClick={() => setOpen(true)}>Book My Next Session</button>
      {open && (
        <div className="apd-overlay" onClick={() => setOpen(false)}>
          <div className="onb-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="onb-step-title">Book My Next Session</h3>
            <p className="onb-step-sub">This sends a request to your specialist — they'll follow up with the best available times.</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="sched-textarea" placeholder="Any preferred days/times? (optional)" style={{ marginBottom: 12 }} />
            <button type="button" className="onb-cta" style={{ border: "none", cursor: "pointer" }} onClick={handleSend} disabled={isPending}>
              {isPending ? "Sending…" : "Send Request"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
