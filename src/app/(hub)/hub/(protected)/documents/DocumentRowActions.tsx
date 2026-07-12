"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDocumentSignedUrl, updateDocument, deleteDocument } from "../clients/[id]/actions";

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

export default function DocumentRowActions({
  documentId,
  storagePath,
  title,
  category,
  visibility,
  canManage,
}: {
  documentId: string;
  storagePath: string;
  title: string;
  category: string;
  visibility: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleView() {
    startTransition(async () => {
      const url = await getDocumentSignedUrl(storagePath);
      if (url) window.open(url, "_blank");
    });
    setMenuOpen(false);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateDocument(documentId, formData);
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this document? This can't be undone.")) return;
    startTransition(async () => {
      await deleteDocument(documentId);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form action={handleSave} className="doc-edit-form">
        <input name="title" defaultValue={title} className="sched-select" />
        <select name="category" defaultValue={category} className="sched-select">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="visibility" defaultValue={visibility} className="sched-select">
          <option value="CLIENT_VISIBLE">Client Visible</option>
          <option value="INTERNAL_ONLY">Internal Only</option>
        </select>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="sched-secondary-btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button type="submit" className="sched-cta" disabled={isPending}>
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="sess-card-footer" style={{ position: "relative" }}>
      <span />
      <button type="button" className="dash-view-btn" onClick={handleView} disabled={isPending}>
        View
      </button>
      {canManage && (
        <div style={{ position: "relative" }}>
          <button type="button" className="dash-view-btn" onClick={() => setMenuOpen((v) => !v)}>
            More
          </button>
          {menuOpen && (
            <div className="doc-menu">
              <button type="button" onClick={handleView}>
                Download
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
              >
                Rename / Move Category
              </button>
              <button type="button" onClick={handleDelete} className="doc-menu-danger">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
