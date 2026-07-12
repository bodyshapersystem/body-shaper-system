"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedDocumentUploadUrl, recordClientDocument } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DocumentCategory } from "@prisma/client";

const CATEGORIES = [
  { value: "WELCOME_GUIDE", label: "Welcome Guide" },
  { value: "POLICIES_APPOINTMENTS", label: "Policies & Appointments" },
  { value: "CONSENT_TREATMENT", label: "Consent for Treatment" },
  { value: "PHOTOGRAPHY_AUTHORIZATION", label: "Photography Authorization" },
  { value: "BODY_BLUEPRINT_PDF", label: "Body Blueprint™ PDF" },
  { value: "FINAL_REPORT", label: "Final Report" },
  { value: "RECEIPTS_INVOICES", label: "Receipts & Invoices" },
  { value: "PROGRESS_PHOTOS", label: "Progress Photos" },
  { value: "RENPHO_REPORTS", label: "RENPHO Reports" },
  { value: "ADDITIONAL_FILES", label: "Additional Files" },
];

export default function DocumentUploadSheet({ clientId, defaultCategory }: { clientId: string; defaultCategory?: string }) {
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
          category: (formData.get("category") as string || undefined) as DocumentCategory | undefined,
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
        ⬆ Upload Document
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Upload Document</h3>
            <form onSubmit={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Category
                <select name="category" defaultValue={defaultCategory ?? "ADDITIONAL_FILES"} className="sched-select">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sched-label">
                Title (optional)
                <input name="title" placeholder="Defaults to file name" className="sched-select" />
              </label>
              <label className="doc-dropzone">
                <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" required style={{ display: "none" }} />
                <span>Browse Files</span>
                <span className="pay-history-meta">PDF, PNG, JPG, DOCX</span>
              </label>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending || uploading}>
                  {uploading ? "Uploading…" : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
