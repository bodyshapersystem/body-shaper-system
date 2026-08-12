"use client";

import { useState, useTransition } from "react";
import { createPaymentLink } from "./payment-link-actions";

type ClientOption = { id: string; firstName: string; lastName: string };

export default function PaymentLinkGenerator({ clients }: { clients: ClientOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    setCheckoutUrl("");
    setCopied(false);
    startTransition(async () => {
      const result = await createPaymentLink(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
      }
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(checkoutUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="sched-wrap" style={{ marginBottom: 32 }}>
      <button type="button" className="dash-view-btn" onClick={() => setOpen((v) => !v)} style={{ marginBottom: open ? 16 : 0 }}>
        {open ? "Close" : "+ Generate Payment Link"}
      </button>

      {open && (
        <div>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>
            For anything the fixed flows don't cover — a full system, a package, a remaining balance. Pick a client,
            set the amount, and copy the link to send yourself (WhatsApp, email, text).
          </p>

          <form action={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <label className="sched-label">
                Client
                <select name="clientId" required className="sched-select">
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sched-label">
                Amount (USD)
                <input name="amount" type="number" step="0.01" min="1" placeholder="1680.00" required className="sched-select" />
              </label>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label className="sched-label">
                Description
                <input name="description" placeholder="e.g. Sculpt Signature™ — Full Payment" required className="sched-select" />
              </label>
            </div>

            {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginBottom: 14 }}>{error}</p>}

            <button type="submit" className="sched-cta" disabled={isPending}>
              {isPending ? "Generating…" : "Generate Link"}
            </button>
          </form>

          {checkoutUrl && (
            <div style={{ marginTop: 20, padding: 16, background: "var(--ivory)", borderRadius: 6, border: "1px solid var(--line)" }}>
              <p className="pay-history-meta" style={{ marginBottom: 8 }}>Payment link ready:</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  readOnly
                  value={checkoutUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{ flex: 1, minWidth: 200, padding: "9px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5 }}
                />
                <button type="button" className="dash-view-btn" onClick={copyLink}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
