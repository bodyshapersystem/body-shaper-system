"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertRewardCatalogItem, deleteRewardCatalogItem } from "./catalog-actions";

type Item = { id: string; name: string; description: string | null; category: string; creditCost: number; available: boolean };

const CATEGORIES = ["BEAUTY", "WELLNESS", "EXPERIENCES", "HOLISTIC", "VIP", "PARTNER", "MOMS", "FOOD"];

export default function CatalogTab({ items, canManage, categoryLabels }: { items: Item[]; canManage: boolean; categoryLabels: Record<string, string> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertRewardCatalogItem(formData);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this reward from the catalog?")) return;
    startTransition(async () => {
      await deleteRewardCatalogItem(id);
      router.refresh();
    });
  }

  return (
    <>
      {canManage && (
        <button type="button" className="dash-view-btn" style={{ marginBottom: 20 }} onClick={() => setEditing("new")}>
          + Create Reward
        </button>
      )}

      <div className="doc-card-grid">
        {items.map((item) => (
          <div key={item.id} className="rw-reward-card">
            <p className="doc-card-title">{item.name}</p>
            <p className="pay-history-meta">{categoryLabels[item.category] ?? item.category} · {item.creditCost} PTS · {item.available ? "Available" : "Unavailable"}</p>
            {canManage && (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="doc-card-link" onClick={() => setEditing(item)}>Edit</button>
                <button type="button" className="doc-card-link" style={{ color: "#a33" }} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="bp-sheet-overlay" onClick={() => setEditing(null)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">{editing === "new" ? "Create Reward" : "Edit Reward"}</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <label className="sched-label">Name<input name="name" defaultValue={editing !== "new" ? editing.name : ""} required className="sched-select" /></label>
              <label className="sched-label">Description<textarea name="description" defaultValue={editing !== "new" ? editing.description ?? "" : ""} rows={2} className="sched-textarea" /></label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Category
                  <select name="category" defaultValue={editing !== "new" ? editing.category : "BEAUTY"} className="sched-select">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
                    ))}
                  </select>
                </label>
                <label className="sched-label">PTS Cost<input name="creditCost" type="number" defaultValue={editing !== "new" ? editing.creditCost : ""} required className="sched-select" /></label>
              </div>
              <label className="sched-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="available" defaultChecked={editing === "new" ? true : editing.available} /> Available
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
