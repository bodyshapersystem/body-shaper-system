"use client";

import { useState, useTransition } from "react";
import { startTotpEnrollment, confirmTotpEnrollment, disableTotp } from "./actions";

export default function TotpSettings({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<"idle" | "enrolling" | "disabling">("idle");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function beginEnroll() {
    setError("");
    startTransition(async () => {
      const result = await startTotpEnrollment();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setQrCodeDataUrl(result.qrCodeDataUrl ?? "");
      setManualKey(result.manualKey ?? "");
      setStep("enrolling");
    });
  }

  function confirmEnroll() {
    setError("");
    startTransition(async () => {
      const result = await confirmTotpEnrollment(code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setStep("idle");
      setCode("");
      window.location.reload();
    });
  }

  function confirmDisable() {
    setError("");
    startTransition(async () => {
      const result = await disableTotp(code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setStep("idle");
      setCode("");
      window.location.reload();
    });
  }

  if (step === "enrolling") {
    return (
      <div style={{ marginTop: 10 }}>
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>
          Scan this with Google Authenticator, Authy, or any TOTP app — then enter the 6-digit code it shows.
        </p>
        {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="2FA QR code" style={{ width: 180, height: 180, marginBottom: 10 }} />}
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>
          Can't scan? Enter this key manually: <code>{manualKey}</code>
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            style={{ padding: "9px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 14, width: 120 }}
          />
          <button type="button" className="sched-cta" onClick={confirmEnroll} disabled={isPending || code.length !== 6}>
            {isPending ? "Verifying…" : "Confirm & Enable"}
          </button>
          <button type="button" className="sched-secondary-btn" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
        {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginTop: 8 }}>{error}</p>}
      </div>
    );
  }

  if (step === "disabling") {
    return (
      <div style={{ marginTop: 10 }}>
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>Enter your current 6-digit code to turn off 2FA.</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            style={{ padding: "9px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 14, width: 120 }}
          />
          <button type="button" className="sched-cta" onClick={confirmDisable} disabled={isPending || code.length !== 6}>
            {isPending ? "Verifying…" : "Confirm & Disable"}
          </button>
          <button type="button" className="sched-secondary-btn" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
        {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginTop: 8 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {enabled ? (
        <button type="button" className="sched-secondary-btn" onClick={() => setStep("disabling")}>
          Disable 2FA
        </button>
      ) : (
        <button type="button" className="sched-secondary-btn" onClick={beginEnroll} disabled={isPending}>
          {isPending ? "Starting…" : "Enable 2FA"}
        </button>
      )}
      {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
