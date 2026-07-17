"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertPartner, deletePartner } from "./catalog-actions";

type PartnerItem = { id: string; name: string; category: string | null; creditValue: number | null; active: boolean; notes: string | null };

export default function PartnersTab({ partners, canManage }: { partners: PartnerItem[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PartnerItem | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertPartner(formData);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this partner?")) return;
    startTransition(async () => {
      await deletePartner(id);
      router.refresh();
    });
  }

  return (
    <>
      <p className="pay-history-meta" style={{ marginBottom: 16 }}>
        Manage the businesses you collaborate with (Hydrafacial, blowouts, pilates, etc.) — assign a Body Credits™ value and toggle them on or off.
      </p>
      {canManage && (
        <button type="button" className="dash-view-btn" style={{ marginBottom: 20 }} onClick={() => setEditing("new")}>
          + Add Partner
        </button>
      )}

      <div className="doc-card-grid">
        {partners.map((p) => (
          <div key={p.id} className="rw-reward-card">
            <p className="doc-card-title">{p.name}</p>
            <p className="pay-history-meta">{p.category ?? "General"} · {p.creditValue ? `${p.creditValue} credits` : "No value set"} · {p.active ? "Active" : "Inactive"}</p>
            {canManage && (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="doc-card-link" onClick={() => setEditing(p)}>Edit</button>
                <button type="button" className="doc-card-link" style={{ color: "#a33" }} onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="bp-sheet-overlay" onClick={() => setEditing(null)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">{editing === "new" ? "Add Partner" : "Edit Partner"}</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <label className="sched-label">Name<input name="name" defaultValue={editing !== "new" ? editing.name : ""} required className="sched-select" /></label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Category<input name="category" defaultValue={editing !== "new" ? editing.category ?? "" : ""} className="sched-select" placeholder="e.g. Beauty" /></label>
                <label className="sched-label">Credit Value<input name="creditValue" type="number" defaultValue={editing !== "new" ? editing.creditValue ?? "" : ""} className="sched-select" /></label>
              </div>
              <label className="sched-label">Notes<textarea name="notes" defaultValue={editing !== "new" ? editing.notes ?? "" : ""} rows={2} className="sched-textarea" /></label>
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
