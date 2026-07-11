"use client";

import { useState, useTransition } from "react";
import { resendInvitation } from "./actions";

const SITE_URL = "https://www.bodyshapersystem.com";

type EmailEventRow = {
  id: string;
  template: string;
  status: string;
  createdAt: string;
  errorMessage: string | null;
};

export default function InvitationPanel({
  clientId,
  portalStatus,
  invitedAt,
  lastSentAt,
  activatedAt,
  attemptCount,
  activationToken,
  emailEvents,
  canResend,
}: {
  clientId: string;
  portalStatus: string | null;
  invitedAt: Date | null;
  lastSentAt: Date | null;
  activatedAt: Date | null;
  attemptCount: number;
  activationToken: string | null;
  emailEvents: EmailEventRow[];
  canResend: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [copied, setCopied] = useState(false);

  const activationUrl = activationToken ? `${SITE_URL}/portal/activate?token=${activationToken}` : null;
  const lastEmail = emailEvents[0];

  function handleResend() {
    setMessage("");
    startTransition(async () => {
      const result = await resendInvitation(clientId);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage(result?.emailSent ? "Invitation email sent." : `Email failed: ${result?.emailError ?? "unknown error"}`);
    });
  }

  async function handleCopy() {
    if (!activationUrl) return;
    await navigator.clipboard.writeText(activationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6, padding: 16, fontSize: 13 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Portal Status</strong>
          {(portalStatus ?? "—").replace(/_/g, " ")}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Invitation Sent</strong>
          {lastSentAt ? new Date(lastSentAt).toLocaleString() : invitedAt ? "Pending first send" : "—"}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Activation Date</strong>
          {activatedAt ? new Date(activatedAt).toLocaleString() : "Not yet activated"}
        </div>
        <div>
          <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Email Delivery</strong>
          {lastEmail ? lastEmail.status : "—"} {attemptCount > 1 && `(${attemptCount} attempts)`}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {canResend && portalStatus !== "ACTIVE" && (
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="auth-submit"
            style={{ width: "auto", padding: "8px 16px", fontSize: 12.5 }}
          >
            {isPending ? "Sending…" : "Resend Invitation"}
          </button>
        )}
        {activationUrl && portalStatus !== "ACTIVE" && (
          <button
            type="button"
            onClick={handleCopy}
            style={{ padding: "8px 16px", fontSize: 12.5, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: "transparent" }}
          >
            {copied ? "Copied!" : "Copy Portal Login URL"}
          </button>
        )}
        {emailEvents.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLog((s) => !s)}
            style={{ padding: "8px 16px", fontSize: 12.5, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: "transparent" }}
          >
            {showLog ? "Hide Email Log" : "View Email Log"}
          </button>
        )}
      </div>

      {message && <p style={{ marginTop: 10, fontSize: 12.5 }}>{message}</p>}

      {showLog && (
        <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, paddingLeft: 0, listStyle: "none" }}>
          {emailEvents.map((e) => (
            <li key={e.id} style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 6 }}>
              <strong>{e.template.replace(/_/g, " ")}</strong> — {e.status} — {new Date(e.createdAt).toLocaleString()}
              {e.errorMessage && <div style={{ opacity: 0.6 }}>{e.errorMessage}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
