"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedPhotoUploadUrl, recordProgressPhoto } from "./blueprint-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PHOTO_TYPES = ["FRONT", "LEFT", "RIGHT", "BACK", "DETAIL"] as const;

export default function PhotoCaptureSheet({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      setError("Choose a photo to capture.");
      return;
    }

    setUploading(true);
    startTransition(async () => {
      try {
        const signed = await createSignedPhotoUploadUrl(clientId, file.name);
        if (signed?.error || !signed?.path || !signed?.token) {
          setError(signed?.error ?? "Could not prepare upload.");
          setUploading(false);
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const { error: uploadError } = await supabase.storage
          .from("client-documents")
          .uploadToSignedUrl(signed.path, signed.token, file);

        if (uploadError) {
          setError(uploadError.message);
          setUploading(false);
          return;
        }

        const result = await recordProgressPhoto(clientId, {
          storagePath: signed.path,
          type: formData.get("type") as "FRONT" | "LEFT" | "RIGHT" | "BACK" | "DETAIL",
          visibility: formData.get("visibility") as "INTERNAL_ONLY" | "CLIENT_VISIBLE",
        });

        if (result?.error) {
          setError(result.error);
          setUploading(false);
          return;
        }

        form.reset();
        setUploading(false);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        setUploading(false);
      }
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        + Capture Photos
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Capture Photo</h3>
            <form onSubmit={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Slot
                <select name="type" required className="sched-select" defaultValue="FRONT">
                  {PHOTO_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sched-label">
                Visibility
                <select name="visibility" defaultValue="INTERNAL_ONLY" className="sched-select">
                  <option value="INTERNAL_ONLY">Internal Only</option>
                  <option value="CLIENT_VISIBLE">Client Visible</option>
                </select>
              </label>
              <label className="sched-label">
                Photo
                <input name="file" type="file" accept="image/*" required className="sched-select" />
              </label>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending || uploading}>
                  {uploading ? "Uploading…" : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
