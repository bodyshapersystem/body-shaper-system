"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getLeadDeletionPreview, deleteLeadPermanently } from "../actions";

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"closed" | "preview">("closed");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof getLeadDeletionPreview>> | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openPreview() {
    setError("");
    setStep("preview");
    startTransition(async () => {
      try {
        const result = await getLeadDeletionPreview(leadId);
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
        const result = await deleteLeadPermanently(leadId, confirmText);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
        router.push("/hub/leads");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong deleting this lead. Please try again.");
      }
    });
  }

  const counts = preview?.success ? preview.counts : null;
  const confirmMatches = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <>
      <button type="button" className="dash-view-btn" style={{ color: "#a33", borderColor: "rgba(163,51,51,0.3)" }} onClick={openPreview} disabled={isPending}>
        Delete
      </button>

      {step !== "closed" && (
        <div className="bp-sheet-overlay" onClick={() => setStep("closed")}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title" style={{ color: "#a33" }}>
              Delete {preview?.success ? preview.leadName : "Lead"} Permanently
            </h3>
            {error && <p className="sched-error">{error}</p>}
            {!counts && !error && <p className="pay-history-meta">Loading preview…</p>}
            {counts && (
              <>
                <p className="pay-history-meta" style={{ marginBottom: 12 }}>
                  This will permanently delete this lead ({preview?.success ? preview.email : ""}) and everything
                  attached to them:
                </p>
                <ul className="cl-summary-list" style={{ marginBottom: 16 }}>
                  <li className="cl-summary-row"><span>Blueprint Assessments™ (draft)</span><span>{counts.assessments}</span></li>
                  <li className="cl-summary-row"><span>Status History</span><span>{counts.statusHistory}</span></li>
                  <li className="cl-summary-row"><span>Email Events</span><span>{counts.emailEvents}</span></li>
                </ul>
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>
                  This frees up <strong>{preview?.success ? preview.email : "this email"}</strong> to be reused
                  immediately in a new test. This cannot be undone.
                </p>
                <label className="sched-label">
                  Type DELETE to confirm
                  <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="sched-select"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    autoComplete="off"
                  />
                </label>
                {confirmText.length > 0 && !confirmMatches && (
                  <p className="pay-history-meta" style={{ marginTop: 4 }}>Type exactly "DELETE" to enable the button below.</p>
                )}
                <div className="bp-sheet-actions">
                  <button type="button" className="sched-secondary-btn" onClick={() => setStep("closed")}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="sched-cta"
                    style={{ background: "#a33" }}
                    onClick={handleDelete}
                    disabled={isPending || !confirmMatches}
                  >
                    {isPending ? "Deleting…" : "Delete Permanently"}
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
