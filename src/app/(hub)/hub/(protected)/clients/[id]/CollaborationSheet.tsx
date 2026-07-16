"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertCollaboration } from "./collaboration-actions";

type Collaboration = {
  collaborationType: string;
  treatmentValueCents: number;
  clientContributionCents: number;
  campaignName: string | null;
  instagramHandle: string | null;
  deliverables: string | null;
  internalNotes: string | null;
  managerId: string | null;
  agreementStatus: string;
} | null;

export default function CollaborationSheet({
  clientId,
  collaboration,
  staff,
}: {
  clientId: string;
  collaboration: Collaboration;
  staff: { id: string; fullName: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertCollaboration(clientId, formData);
      setOpen(false);
      router.refresh();
    });
  }

  const treatmentValue = (collaboration?.treatmentValueCents ?? 0) / 100;
  const clientContribution = (collaboration?.clientContributionCents ?? 0) / 100;
  const collabValue = treatmentValue - clientContribution;

  return (
    <div className="pd-card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13 }}>🤍 Collaboration</h3>
        <button type="button" className="dash-view-btn" onClick={() => setOpen(true)}>
          {collaboration ? "Edit Collaboration" : "Set Up Collaboration"}
        </button>
      </div>

      {collaboration && (
        <div className="cl-summary-list">
          <div className="cl-summary-row"><span>Collaboration Type</span><span>{collaboration.collaborationType}</span></div>
          <div className="cl-summary-row"><span>Treatment Value</span><span>${treatmentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="cl-summary-row"><span>Client Contribution</span><span>${clientContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="cl-summary-row"><span>Collaboration Value</span><span>${collabValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          <div className="cl-summary-row">
            <span>Payment Status</span>
            <span>{clientContribution === 0 ? "Complimentary (Collaboration)" : "Partial Contribution"}</span>
          </div>
          {collaboration.campaignName && <div className="cl-summary-row"><span>Campaign</span><span>{collaboration.campaignName}</span></div>}
          {collaboration.instagramHandle && <div className="cl-summary-row"><span>Instagram</span><span>{collaboration.instagramHandle}</span></div>}
          <div className="cl-summary-row"><span>Agreement Status</span><span>{collaboration.agreementStatus}</span></div>
        </div>
      )}

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Collaboration Details</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Collaboration Type
                <select name="collaborationType" defaultValue={collaboration?.collaborationType ?? "AMBASSADOR"} className="sched-select">
                  <option value="INFLUENCER">Influencer</option>
                  <option value="CREATOR">Creator</option>
                  <option value="AMBASSADOR">Ambassador</option>
                  <option value="MODEL">Model</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Treatment Value ($)
                  <input name="treatmentValue" type="number" step="0.01" defaultValue={treatmentValue || ""} className="sched-select" />
                </label>
                <label className="sched-label">
                  Client Contribution ($)
                  <input name="clientContribution" type="number" step="0.01" defaultValue={clientContribution || ""} className="sched-select" />
                </label>
              </div>
              <label className="sched-label">
                Campaign Name
                <input name="campaignName" defaultValue={collaboration?.campaignName ?? ""} className="sched-select" />
              </label>
              <label className="sched-label">
                Instagram Handle
                <input name="instagramHandle" defaultValue={collaboration?.instagramHandle ?? ""} className="sched-select" placeholder="@handle" />
              </label>
              <label className="sched-label">
                Deliverables
                <textarea name="deliverables" defaultValue={collaboration?.deliverables ?? ""} rows={2} className="sched-textarea" />
              </label>
              <label className="sched-label">
                Manager
                <select name="managerId" defaultValue={collaboration?.managerId ?? ""} className="sched-select">
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </label>
              <label className="sched-label">
                Agreement Status
                <select name="agreementStatus" defaultValue={collaboration?.agreementStatus ?? "PENDING"} className="sched-select">
                  <option value="PENDING">Pending</option>
                  <option value="SIGNED">Signed</option>
                  <option value="NOT_REQUIRED">Not Required</option>
                </select>
              </label>
              <label className="sched-label">
                Internal Notes
                <textarea name="internalNotes" defaultValue={collaboration?.internalNotes ?? ""} rows={2} className="sched-textarea" />
              </label>
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
