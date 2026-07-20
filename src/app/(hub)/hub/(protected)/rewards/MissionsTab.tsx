"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertMission, deleteMission, createSignedMissionImageUploadUrl } from "./catalog-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MissionItem = {
  id: string;
  name: string;
  description: string | null;
  photoIdeas: string | null;
  caption1: string | null;
  caption2: string | null;
  caption3: string | null;
  closingNote: string | null;
  creditReward: number;
  type: string;
  active: boolean;
  imageUrl: string | null;
};

export default function MissionsTab({ missions, canManage }: { missions: MissionItem[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MissionItem | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    if (pendingImagePath) formData.set("imageStoragePath", pendingImagePath);
    startTransition(async () => {
      await upsertMission(formData);
      setEditing(null);
      setPendingImagePath(null);
      setPreviewUrl(null);
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

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await createSignedMissionImageUploadUrl(file.name);
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
            {m.imageUrl && <img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
            <p className="doc-card-title">{m.name}</p>
            <p className="pay-history-meta">{m.creditReward} Society Points · {m.type === "MANUAL_APPROVAL" ? "Needs Owner Approval" : "Self-Report"} · {m.active ? "Active" : "Inactive"}</p>
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
              <label className="sched-label">
                Photo Ideas (one per line)
                <textarea name="photoIdeas" defaultValue={editing !== "new" ? editing.photoIdeas ?? "" : ""} rows={3} className="sched-textarea" placeholder={"A selfie\nYour workout\nA healthy meal"} />
              </label>
              <label className="sched-label">Caption Option 1<input name="caption1" defaultValue={editing !== "new" ? editing.caption1 ?? "" : ""} className="sched-select" /></label>
              <label className="sched-label">Caption Option 2<input name="caption2" defaultValue={editing !== "new" ? editing.caption2 ?? "" : ""} className="sched-select" /></label>
              <label className="sched-label">Caption Option 3<input name="caption3" defaultValue={editing !== "new" ? editing.caption3 ?? "" : ""} className="sched-select" /></label>
              <label className="sched-label">Closing Note<input name="closingNote" defaultValue={editing !== "new" ? editing.closingNote ?? "" : ""} className="sched-select" placeholder="e.g. No before & after photos are required." /></label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Credit Reward<input name="creditReward" type="number" defaultValue={editing !== "new" ? editing.creditReward : ""} required className="sched-select" /></label>
                <label className="sched-label">Type
                  <select name="type" defaultValue={editing !== "new" ? editing.type : "SELF_REPORT"} className="sched-select">
                    <option value="SELF_REPORT">Self-Report (instant)</option>
                    <option value="MANUAL_APPROVAL">Needs Owner Approval</option>
                  </select>
                </label>
              </div>
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
