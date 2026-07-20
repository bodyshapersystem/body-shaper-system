"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertPartner, deletePartner, createSignedPartnerImageUploadUrl, seedDefaultPrivileges } from "./catalog-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PartnerItem = { id: string; name: string; category: string | null; creditValue: number | null; active: boolean; notes: string | null; imageUrl: string | null };

export default function PartnersTab({ partners, canManage }: { partners: PartnerItem[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PartnerItem | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    if (pendingImagePath) formData.set("imageStoragePath", pendingImagePath);
    startTransition(async () => {
      await upsertPartner(formData);
      setEditing(null);
      setPendingImagePath(null);
      setPreviewUrl(null);
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

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await createSignedPartnerImageUploadUrl(file.name);
      if (!result?.success || !result.path || !result.token) {
        alert(result?.error ?? "Upload failed.");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage.from("client-documents").uploadToSignedUrl(result.path, result.token, file);
      if (error) {
        alert(error.message);
        return;
      }
      setPendingImagePath(result.path);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  }

  const [seedMessage, setSeedMessage] = useState("");

  function handleSeed() {
    startTransition(async () => {
      const result = await seedDefaultPrivileges();
      setSeedMessage(result?.success ? `Added ${result.created} privileges.` : result?.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  return (
    <>
      <p className="pay-history-meta" style={{ marginBottom: 16 }}>
        Manage the businesses you collaborate with (Hydrafacial, blowouts, pilates, etc.) — assign a Society Points value, add a photo, and toggle them on or off.
      </p>
      {canManage && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="dash-view-btn" onClick={() => setEditing("new")}>
            + Add Partner
          </button>
          <button type="button" className="dash-view-btn" onClick={handleSeed} disabled={isPending}>
            {isPending ? "Adding…" : "Add Manicure/Spray Tan/Blow Dry/Pilates/Lashes/Massage Privileges"}
          </button>
          {seedMessage && <span className="pay-history-meta">{seedMessage}</span>}
        </div>
      )}

      <div className="doc-card-grid">
        {partners.map((p) => (
          <div key={p.id} className="rw-reward-card">
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
            <p className="doc-card-title">{p.name}</p>
            <p className="pay-history-meta">{p.category ?? "General"} · {p.creditValue ? `${p.creditValue} Society Points` : "No value set"} · {p.active ? "Active" : "Inactive"}</p>
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
                <label className="sched-label">Society Points Value<input name="creditValue" type="number" defaultValue={editing !== "new" ? editing.creditValue ?? "" : ""} className="sched-select" /></label>
              </div>
              <label className="sched-label">Notes<textarea name="notes" defaultValue={editing !== "new" ? editing.notes ?? "" : ""} rows={2} className="sched-textarea" /></label>
              <label className="sched-label">
                Photo
                <input type="file" accept="image/*" onChange={handleImageSelect} className="sched-select" />
              </label>
              {uploading && <p className="pay-history-meta">Uploading…</p>}
              {(previewUrl || (editing !== "new" && editing.imageUrl)) && (
                <img src={previewUrl ?? (editing !== "new" ? editing.imageUrl! : "")} alt="" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, marginTop: 6 }} />
              )}
              <label className="sched-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="active" defaultChecked={editing === "new" ? true : editing.active} /> Active
              </label>
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="sched-cta" disabled={isPending || uploading}>{isPending ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
