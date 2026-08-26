"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedPhotoUploadUrl, recordProgressPhoto } from "./blueprint-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PHOTO_TYPES = ["FRONT", "LEFT", "RIGHT", "BACK"] as const;

/**
 * Adds a photo directly into ONE specific, already-known session —
 * no typing a session number, no guessing. Used inline on each
 * session card in PhotoSessionHistory so "missing the RIGHT shot
 * from session 1" is a two-click fix instead of starting a whole new
 * session by accident.
 */
export default function AddPhotoToSessionButton({ clientId, sessionNumber }: { clientId: string; sessionNumber: number }) {
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
      setError("Choose a photo.");
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
          type: formData.get("type") as "FRONT" | "LEFT" | "RIGHT" | "BACK",
          sessionNumber,
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

  if (!open) {
    return (
      <button type="button" className="sched-secondary-btn" onClick={() => setOpen(true)} style={{ marginTop: 10 }}>
        + Add Photo to Session {sessionNumber}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
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
        Photo
        <input name="file" type="file" accept="image/*" required className="sched-select" />
      </label>
      <button type="submit" className="sched-cta" disabled={isPending || uploading}>
        {uploading ? "Uploading…" : "Save"}
      </button>
      <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {error && <p className="sched-error" style={{ width: "100%" }}>{error}</p>}
    </form>
  );
}
