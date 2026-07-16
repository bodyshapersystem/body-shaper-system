"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getClientDeletionPreview, deleteClientPermanently } from "./actions";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"closed" | "preview" | "confirm">("closed");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof getClientDeletionPreview>> | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openPreview() {
    setError("");
    setStep("preview");
    startTransition(async () => {
      try {
        const result = await getClientDeletionPreview(clientId);
        if (result?.error) {
          setError(result.error);
          setPreview(null);
          return;
        }
        setPreview(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load the deletion preview. Please try again.");
      }
    });
  }

  function handleDelete() {
    setError("");
    startTransition(async () => {
      try {
        const result = await deleteClientPermanently(clientId, confirmText);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.push("/hub/clients");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong deleting this client. Please try again.");
      }
    });
  }

  const counts = preview?.success ? preview.counts : null;
  const totalRelated = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      <button type="button" className="cl-subtle-action" style={{ color: "#a33" }} onClick={openPreview} disabled={isPending}>
        Delete
      </button>

      {step !== "closed" && (
        <div className="bp-sheet-overlay" onClick={() => setStep("closed")}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title" style={{ color: "#a33" }}>
              Delete {preview?.success ? preview.clientName : "Client"} Permanently
            </h3>
            {error && <p className="sched-error">{error}</p>}
            {!counts && !error && <p className="pay-history-meta">Loading preview…</p>}
            {counts && (
              <>
                <p className="pay-history-meta" style={{ marginBottom: 12 }}>
                  This will permanently delete this client ({preview?.success ? preview.email : ""}) and everything
                  attached to them:
                </p>
                <ul className="cl-summary-list" style={{ marginBottom: 16 }}>
                  <li className="cl-summary-row"><span>Blueprint Assessments™</span><span>{counts.assessments}</span></li>
                  <li className="cl-summary-row"><span>Measurements</span><span>{counts.measurements}</span></li>
                  <li className="cl-summary-row"><span>Photos</span><span>{counts.photos}</span></li>
                  <li className="cl-summary-row"><span>Appointments</span><span>{counts.appointments}</span></li>
                  <li className="cl-summary-row"><span>Payments</span><span>{counts.payments}</span></li>
                  <li className="cl-summary-row"><span>Documents</span><span>{counts.documents}</span></li>
                  <li className="cl-summary-row"><span>Notes</span><span>{counts.notes}</span></li>
                  <li className="cl-summary-row"><span>Messages</span><span>{counts.messages}</span></li>
                  <li className="cl-summary-row"><span>Rewards Account</span><span>{counts.rewards}</span></li>
                </ul>
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>
                  Their Portal login will also be deleted, freeing up <strong>{preview?.success ? preview.email : "this email"}</strong> to
                  be reused immediately. This cannot be undone.
                </p>
                <label className="sched-label">
                  Type DELETE to confirm
                  <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="sched-select" />
                </label>
                <div className="bp-sheet-actions">
                  <button type="button" className="sched-secondary-btn" onClick={() => setStep("closed")}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="sched-cta"
                    style={{ background: "#a33" }}
                    onClick={handleDelete}
                    disabled={isPending || confirmText !== "DELETE"}
                  >
                    {isPending ? "Deleting…" : `Delete Permanently (${totalRelated} related records)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
