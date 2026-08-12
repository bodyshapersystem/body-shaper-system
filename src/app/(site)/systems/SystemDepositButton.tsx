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
    <div className="system-deposit-wrap">
      <button type="button" className="system-deposit-cta" onClick={() => setOpen((v) => !v)}>
        {open ? "Cancel" : `Reserve at ${priceLabel}`}
      </button>

      {open && (
        <div className="system-deposit-inline">
          <div className="system-deposit-breakdown">
            <div>
              <span>Starting deposit today</span>
              <strong>{priceLabel}</strong>
            </div>
            <div>
              <span>Remaining balance</span>
              <strong>Applies — based on your final treatment plan</strong>
            </div>
          </div>

          <form action={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input name="firstName" placeholder="First Name" required style={inputStyle} />
              <input name="lastName" placeholder="Last Name" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input name="email" type="email" placeholder="Email" required style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <input name="phone" type="tel" placeholder="Phone" style={inputStyle} />
              <input name="city" placeholder="City" style={inputStyle} />
            </div>

            {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: "100%", border: "none", cursor: "pointer" }}>
              {isPending ? "Redirecting to secure checkout…" : `Pay ${priceLabel} — Reserve My System`}
            </button>
            <p style={{ fontSize: 11, opacity: 0.55, marginTop: 10, textAlign: "center" }}>
              Secure payment via Stripe.
            </p>
          </form>
        </div>
      )}
    </div>
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
