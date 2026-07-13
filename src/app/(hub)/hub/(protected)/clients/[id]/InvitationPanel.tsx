"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activationUrl = activationToken ? `${SITE_URL}/portal/activate?token=${activationToken}` : null;
  const lastEmail = emailEvents[0];
  const isActive = portalStatus === "ACTIVE";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleResend() {
    setMessage("");
    setMenuOpen(false);
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
    <div className="cl-status-panel">
      <div className="cl-status-grid">
        <div className="cl-status-item">
          <span className={`cl-status-dot ${isActive ? "done" : ""}`} aria-hidden="true" />
          <div>
            <p className="cl-status-label">Portal</p>
            <p className="cl-status-value">{isActive ? "Active" : (portalStatus ?? "—").replace(/_/g, " ")}</p>
          </div>
        </div>
        <div className="cl-status-item">
          <span className={`cl-status-dot ${lastSentAt || invitedAt ? "done" : ""}`} aria-hidden="true" />
          <div>
            <p className="cl-status-label">Invitation Sent</p>
            <p className="cl-status-value">{lastSentAt ? new Date(lastSentAt).toLocaleDateString() : invitedAt ? "Pending first send" : "—"}</p>
          </div>
        </div>
        <div className="cl-status-item">
          <span className={`cl-status-dot ${activatedAt ? "done" : ""}`} aria-hidden="true" />
          <div>
            <p className="cl-status-label">Activated</p>
            <p className="cl-status-value">{activatedAt ? new Date(activatedAt).toLocaleDateString() : "Not yet"}</p>
          </div>
        </div>
        <div className="cl-status-item">
          <span className={`cl-status-dot ${lastEmail?.status === "SENT" || lastEmail?.status === "DELIVERED" ? "done" : ""}`} aria-hidden="true" />
          <div>
            <p className="cl-status-label">Email Delivery</p>
            <p className="cl-status-value">
              {lastEmail ? lastEmail.status : "—"} {attemptCount > 1 && `· ${attemptCount}x`}
            </p>
          </div>
        </div>

        <div className="cl-status-menu-wrap" ref={menuRef}>
          <button type="button" className="cl-status-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="More actions">
            •••
          </button>
          {menuOpen && (
            <div className="doc-menu">
              {canResend && !isActive && (
                <button type="button" onClick={handleResend} disabled={isPending}>
                  {isPending ? "Sending…" : "Resend Invitation"}
                </button>
              )}
              {activationUrl && !isActive && (
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setMenuOpen(false);
                  }}
                >
                  {copied ? "Copied!" : "Copy Portal Login URL"}
                </button>
              )}
              {emailEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLog((s) => !s);
                    setMenuOpen(false);
                  }}
                >
                  {showLog ? "Hide Email Log" : "View Email Log"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {message && <p className="pay-history-meta" style={{ marginTop: 10 }}>{message}</p>}

      {showLog && (
        <ul className="cl-email-log">
          {emailEvents.map((e) => (
            <li key={e.id}>
              <strong>{e.template.replace(/_/g, " ")}</strong> — {e.status} — {new Date(e.createdAt).toLocaleString()}
              {e.errorMessage && <div className="pay-history-meta">{e.errorMessage}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
