"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendDocumentReminder, resendDocumentForm, getRequiredDocumentSignedUrl } from "./actions";

export default function DocumentOwnerActions({
  clientId,
  category,
  title,
  storagePath,
  documentId,
  hasDoc,
}: {
  clientId: string;
  category: string;
  title: string;
  storagePath: string | null;
  documentId: string | null;
  hasDoc: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState("");

  async function handleView() {
    if (!storagePath) return;
    const result = await getRequiredDocumentSignedUrl(storagePath);
    if (result?.success && result.url) window.open(result.url, "_blank");
  }

  async function handleDownload() {
    if (!storagePath) return;
    const result = await getRequiredDocumentSignedUrl(storagePath);
    if (result?.success && result.url) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = title;
      a.click();
    }
  }

  function handleReminder() {
    startTransition(async () => {
      const result = await sendDocumentReminder(clientId, title);
      setMessage(result?.success ? "Reminder sent." : result?.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  function handleResend() {
    startTransition(async () => {
      const result = await resendDocumentForm(clientId, category, title);
      setMessage(result?.success ? "Form link resent." : result?.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  return (
    <div className="doc-card-actions" style={{ position: "relative" }}>
      {hasDoc && storagePath && (
        <>
          <button type="button" className="doc-card-link" onClick={handleView} style={{ background: "none", border: "none", cursor: "pointer" }}>
            View
          </button>
          <button type="button" className="doc-card-link" onClick={handleDownload} style={{ background: "none", border: "none", cursor: "pointer" }}>
            Download
          </button>
        </>
      )}
      {!hasDoc && (
        <>
          <button type="button" className="doc-card-link" onClick={handleReminder} disabled={isPending} style={{ background: "none", border: "none", cursor: "pointer" }}>
            Send Reminder
          </button>
          <button type="button" className="doc-card-link" onClick={() => setShowMore((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            More
          </button>
        </>
      )}
      {showMore && (
        <div style={{ position: "absolute", top: "100%", right: 0, background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", borderRadius: 8, padding: 8, zIndex: 10, minWidth: 140 }}>
          <button type="button" className="doc-card-link" onClick={handleResend} disabled={isPending} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "6px 8px" }}>
            Resend Form
          </button>
        </div>
      )}
      {message && <p className="pay-history-meta" style={{ marginTop: 4 }}>{message}</p>}
    </div>
  );
}
