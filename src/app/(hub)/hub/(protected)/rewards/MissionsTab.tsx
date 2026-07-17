"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertMission, deleteMission } from "./catalog-actions";

type MissionItem = { id: string; name: string; description: string | null; creditReward: number; type: string; active: boolean };

export default function MissionsTab({ missions, canManage }: { missions: MissionItem[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MissionItem | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertMission(formData);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this mission?")) return;
    startTransition(async () => {
      await deleteMission(id);
      router.refresh();
    });
  }

  return (
    <>
      {canManage && (
        <button type="button" className="dash-view-btn" style={{ marginBottom: 20 }} onClick={() => setEditing("new")}>
          + Create Mission
        </button>
      )}

      <div className="doc-card-grid">
        {missions.map((m) => (
          <div key={m.id} className="rw-reward-card">
            <p className="doc-card-title">{m.name}</p>
            <p className="pay-history-meta">{m.creditReward} credits · {m.type === "MANUAL_APPROVAL" ? "Needs Owner Approval" : "Self-Report"} · {m.active ? "Active" : "Inactive"}</p>
            {canManage && (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="doc-card-link" onClick={() => setEditing(m)}>Edit</button>
                <button type="button" className="doc-card-link" style={{ color: "#a33" }} onClick={() => handleDelete(m.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="bp-sheet-overlay" onClick={() => setEditing(null)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">{editing === "new" ? "Create Mission" : "Edit Mission"}</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <label className="sched-label">Name<input name="name" defaultValue={editing !== "new" ? editing.name : ""} required className="sched-select" /></label>
              <label className="sched-label">Description<textarea name="description" defaultValue={editing !== "new" ? editing.description ?? "" : ""} rows={2} className="sched-textarea" /></label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Credit Reward<input name="creditReward" type="number" defaultValue={editing !== "new" ? editing.creditReward : ""} required className="sched-select" /></label>
                <label className="sched-label">Type
                  <select name="type" defaultValue={editing !== "new" ? editing.type : "SELF_REPORT"} className="sched-select">
                    <option value="SELF_REPORT">Self-Report (instant)</option>
                    <option value="MANUAL_APPROVAL">Needs Owner Approval</option>
                  </select>
                </label>
              </div>
              <label className="sched-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="active" defaultChecked={editing === "new" ? true : editing.active} /> Active
              </label>
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="sched-cta" disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
