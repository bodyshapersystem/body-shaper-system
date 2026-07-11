"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordLeadPayment, convertLeadToClient } from "../actions";
import type { PaymentStatus } from "@prisma/client";

const PAYMENT_STATUSES: PaymentStatus[] = ["NOT_REQUIRED", "PENDING", "CONFIRMED", "REFUNDED"];

export default function LeadConversionPanel({
  leadId,
  currentPaymentStatus,
  canEdit,
  canConvert,
  alreadyConvertedClientId,
}: {
  leadId: string;
  currentPaymentStatus: PaymentStatus;
  canEdit: boolean;
  canConvert: boolean;
  alreadyConvertedClientId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activationUrl, setActivationUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handlePaymentChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PaymentStatus;
    startTransition(() => {
      recordLeadPayment(leadId, value);
    });
  }

  function handleConvert() {
    setError("");
    startTransition(async () => {
      const result = await convertLeadToClient(leadId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.activationUrl) setActivationUrl(result.activationUrl);
      setEmailSent(result?.emailSent ?? null);
      setEmailError(result?.emailError ?? null);
      if (result?.clientId) router.refresh();
    });
  }

  if (alreadyConvertedClientId) {
    return (
      <p style={{ fontSize: 13.5 }}>
        Already converted —{" "}
        <a href={`/hub/clients/${alreadyConvertedClientId}`} style={{ fontWeight: 600 }}>
          view client record
        </a>
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label htmlFor="payment" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
          Payment Status
        </label>
        <select
          id="payment"
          defaultValue={currentPaymentStatus}
          onChange={handlePaymentChange}
          disabled={isPending || !canEdit}
          style={{ padding: 10 }}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {canConvert && (
        <div>
          <button
            type="button"
            onClick={handleConvert}
            disabled={isPending}
            className="auth-submit"
            style={{ width: "auto", padding: "12px 24px" }}
          >
            {isPending ? "Converting…" : "Convert Lead to Client"}
          </button>
          {error && <p className="auth-error">{error}</p>}
          {activationUrl && (
            <div style={{ fontSize: 13, marginTop: 10 }}>
              {emailSent === true && (
                <p style={{ color: "#2f6b3a" }}>✓ Client created — welcome email sent automatically.</p>
              )}
              {emailSent === false && (
                <p className="auth-error">
                  Client created, but the welcome email failed to send{emailError ? `: ${emailError}` : "."} Use
                  "Resend Invitation" on the client's page, or share this link directly:
                </p>
              )}
              <p style={{ opacity: 0.65 }}>
                Portal login link (backup): <code style={{ wordBreak: "break-all" }}>{activationUrl}</code>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
