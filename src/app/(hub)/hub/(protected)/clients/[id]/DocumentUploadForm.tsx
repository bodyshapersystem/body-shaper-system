"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedDocumentUploadUrl, recordClientDocument } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DocumentUploadForm({ clientId }: { clientId: string }) {
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
      setError("Choose a file to upload.");
      return;
    }

    const title = (formData.get("title") as string) || file.name;

    setUploading(true);
    startTransition(async () => {
      try {
        const signed = await createSignedDocumentUploadUrl(clientId, file.name);
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

        const result = await recordClientDocument(clientId, {
          storagePath: signed.path,
          title,
          fileType: file.type || undefined,
          sizeBytes: file.size,
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
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
      <input name="title" placeholder="Title" style={{ padding: 10, flex: 1 }} />
      <input name="file" type="file" required />
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
