"use client";

import { useState, useTransition } from "react";
import { sendPeptideJourneyInvite } from "./peptide-invite-actions";

type ActiveProtocol = { peptideName: string; frequency: string } | null;

export default function PeptideJourneyInviteCard({
  clientId,
  clientFirstName,
  clientEmail,
  canManage,
  inviteSentAt,
  inviteSentByName,
  activeProtocol,
}: {
  clientId: string;
  clientFirstName: string;
  clientEmail: string;
  canManage: boolean;
  inviteSentAt: string | null;
  inviteSentByName: string | null;
  activeProtocol: ActiveProtocol;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!canManage) return null;

  function handleSend() {
    setError("");
    startTransition(async () => {
      const result = await sendPeptideJourneyInvite(clientId, includeNote ? note : undefined);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  function closeModal() {
    setModalOpen(false);
    setPreview(false);
    setSent(false);
    setIncludeNote(false);
    setNote("");
    setError("");
  }

  return (
    <div className="bbp-card bbp-panel bp-tex-taupe" style={{ marginTop: 24 }}>
      <h3 className="dash-section-title">Client Tools</h3>

      {activeProtocol ? (
        <div className="pjic-row">
          <div>
            <p className="pjic-status-active">Peptide Journey™ active ✦</p>
            <p className="pay-history-meta">{activeProtocol.peptideName} · {activeProtocol.frequency} protocol</p>
          </div>
          <a href={`/hub/clients/${clientId}?tab=journey`} className="dtj-link-small">VIEW JOURNEY</a>
        </div>
      ) : inviteSentAt ? (
        <div className="pjic-row">
          <div>
            <p className="pay-history-meta">Peptide Journey invitation sent</p>
            <p className="pay-history-meta">
              Sent: {new Date(inviteSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {new Date(inviteSentAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              {inviteSentByName ? ` · Sent by ${inviteSentByName}` : ""}
            </p>
          </div>
          <button type="button" className="dtj-link-small" onClick={() => setModalOpen(true)}>RESEND INVITATION</button>
        </div>
      ) : (
        <div className="pjic-row">
          <p className="pay-history-meta" style={{ margin: 0 }}>Introduce her to Peptide Journey™ inside Daily Trackers™.</p>
          <button type="button" className="sched-cta" onClick={() => setModalOpen(true)}>INVITE TO PEPTIDE JOURNEY →</button>
        </div>
      )}

      {modalOpen && (
        <div className="pcel-backdrop" onClick={closeModal}>
          <div className="pcel-card" onClick={(e) => e.stopPropagation()} style={{ textAlign: "left", maxWidth: 440 }}>
            {sent ? (
              <>
                <p className="pcel-headline" style={{ fontSize: 20 }}>Invitation sent ✦</p>
                <p className="pay-history-meta" style={{ marginBottom: 20 }}>
                  {clientFirstName} will receive an email introducing Peptide Journey™ with direct access to her portal.
                </p>
                <button type="button" className="pcel-btn-primary" onClick={closeModal}>DONE</button>
              </>
            ) : (
              <>
                <p className="pcel-headline" style={{ fontSize: 20 }}>Invite to Peptide Journey™</p>
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>
                  Introduce {clientFirstName} to the new peptide-tracking experience inside Daily Trackers™.
                </p>

                <p className="dtj-field-label">Recipient</p>
                <p className="pjic-recipient">{clientFirstName} · {clientEmail}</p>
                <p className="dtj-field-label" style={{ marginTop: 10 }}>Email Template</p>
                <p className="pjic-recipient">Peptide Journey Introduction</p>

                <label className="rc-checkbox-row" style={{ marginTop: 14 }}>
                  <input type="checkbox" checked={includeNote} onChange={(e) => setIncludeNote(e.target.checked)} />
                  Include personal note
                </label>
                {includeNote && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="A short note to add above the standard email…"
                    className="dtj-editor-textarea"
                    rows={3}
                  />
                )}

                {preview && (
                  <div className="dtj-editor" style={{ marginTop: 12 }}>
                    <p className="pay-history-meta" style={{ whiteSpace: "pre-line" }}>
                      {includeNote && note.trim() ? `${note.trim()}\n\n` : ""}
                      Hi {clientFirstName},{"\n\n"}
                      If peptides are part of your current journey, there's something new waiting for you inside your Daily Trackers™...{"\n\n"}
                      [Full Peptide Journey™ introduction + {activeProtocol ? "OPEN MY PEPTIDE JOURNEY" : "ADD MY PEPTIDE JOURNEY"} →]
                    </p>
                  </div>
                )}

                {error && <p className="sched-error">{error}</p>}

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button type="button" className="dtj-link-small" onClick={() => setPreview((v) => !v)}>
                    {preview ? "Hide Preview" : "PREVIEW EMAIL"}
                  </button>
                  <button type="button" className="pcel-btn-primary" style={{ marginBottom: 0, flex: 1 }} onClick={handleSend} disabled={isPending}>
                    {isPending ? "Sending…" : "SEND EMAIL"}
                  </button>
                </div>
                <button type="button" className="dtj-link-small" style={{ display: "block", textAlign: "center", marginTop: 10 }} onClick={closeModal}>
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
