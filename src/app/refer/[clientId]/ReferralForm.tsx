"use client";

import { useState, useTransition } from "react";
import { submitReferralLead } from "./actions";

export default function ReferralForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await submitReferralLead(clientId, formData);
      if (result?.success) setDone(true);
      else setError(result?.error ?? "Something went wrong.");
    });
  }

  if (done) {
    return <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#6B4E3D" }}>🎉 Thank you! Our team will be in touch soon.</p>;
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", fontSize: 14, marginBottom: 12, fontFamily: "Arial, sans-serif" };

  return (
    <form action={handleSubmit}>
      <input name="firstName" placeholder="First Name" required style={inputStyle} />
      <input name="lastName" placeholder="Last Name" required style={inputStyle} />
      <input name="email" type="email" placeholder="Email" required style={inputStyle} />
      <input name="phone" placeholder="Phone (optional)" style={inputStyle} />
      {error && <p style={{ color: "#a33", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button type="submit" disabled={isPending} style={{ width: "100%", padding: 14, background: "#6B4E3D", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Arial, sans-serif", fontSize: 13, cursor: "pointer" }}>
        {isPending ? "Submitting…" : "Get Started"}
      </button>
    </form>
  );
}
