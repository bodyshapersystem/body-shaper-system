"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { createSystemDepositCheckoutSession } from "./actions";

export default function SystemDepositButton({
  systemName,
  priceCents,
  priceLabel,
}: {
  systemName: string;
  priceCents: number;
  priceLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    formData.set("systemName", systemName);
    formData.set("priceCents", String(priceCents));
    startTransition(async () => {
      const result = await createSystemDepositCheckoutSession(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  return (
    <>
      <button type="button" className="system-deposit-cta" onClick={() => setOpen(true)}>
        Reserve at {priceLabel}
      </button>

      {open && (
        <div className="system-deposit-overlay" onClick={() => setOpen(false)}>
          <div className="system-deposit-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="system-deposit-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
            <h3 style={{ marginBottom: 6 }}>{systemName}</h3>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 22 }}>
              Reserve with the {priceLabel} starting deposit today. The remaining balance is due separately, once your
              sessions are scheduled.
            </p>

            <form action={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input name="firstName" placeholder="First Name" required style={inputStyle} />
                <input name="lastName" placeholder="Last Name" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input name="email" type="email" placeholder="Email" required style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <input name="phone" type="tel" placeholder="Phone" style={inputStyle} />
                <input name="city" placeholder="City" style={inputStyle} />
              </div>

              {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginBottom: 14 }}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: "100%", border: "none", cursor: "pointer" }}>
                {isPending ? "Redirecting to secure checkout…" : `Pay ${priceLabel} — Reserve My System`}
              </button>
              <p style={{ fontSize: 11, opacity: 0.55, marginTop: 10, textAlign: "center" }}>
                Secure payment via Stripe.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.15)",
  fontSize: 13.5,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
