"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedPhotoUploadUrl, recordProgressPhoto } from "./blueprint-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PHOTO_TYPES = ["FRONT", "LEFT", "RIGHT", "BACK", "DETAIL"] as const;

export default function PhotoUploadForm({ clientId }: { clientId: string }) {
  const router = useRouter();
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
      setError("Choose a photo to upload.");
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
          takenAt: (formData.get("takenAt") as string) || undefined,
          notes: (formData.get("notes") as string) || undefined,
        });

        if (result?.error) {
          setError(result.error);
          setUploading(false);
          return;
        }

        form.reset();
        setUploading(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        setUploading(false);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}
    >
      <select name="type" required style={inputStyle}>
        {PHOTO_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input name="takenAt" type="date" style={inputStyle} />
      <select name="visibility" defaultValue="INTERNAL_ONLY" style={inputStyle}>
        <option value="INTERNAL_ONLY">Internal Only</option>
        <option value="CLIENT_VISIBLE">Client Visible</option>
      </select>
      <input name="file" type="file" accept="image/*" required />
      <input name="notes" placeholder="Notes" style={inputStyle} />
      <button type="submit" className="auth-submit" disabled={isPending || uploading} style={{ width: "auto", padding: "10px 20px" }}>
        {uploading ? "Uploading…" : "Upload"}
      </button>
      {error && (
        <p className="auth-error" style={{ width: "100%" }}>
          {error}
        </p>
      )}
    </form>
  );
}

const inputStyle: React.CSSProperties = { padding: 10 };
