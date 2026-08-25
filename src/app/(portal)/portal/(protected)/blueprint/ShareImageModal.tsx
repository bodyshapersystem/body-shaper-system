"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { MetricChange } from "@/lib/progress-celebration";
import ShareableProgressCard from "./ShareableProgressCard";

/**
 * Captures the exact same card shown in the Congratulations overlay
 * directly from the DOM (via html-to-image) — not a server-generated
 * image. This sidesteps every font/glyph/runtime issue a server-side
 * ImageResponse route can hit, since it's simply a screenshot of
 * something that's already rendering correctly on screen.
 */
export default function ShareImageModal({
  category,
  changes,
  closingPhrase,
  compareLabel,
  onClose,
}: {
  category: string;
  changes: MetricChange[];
  closingPhrase: string;
  compareLabel: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [error, setError] = useState("");

  async function capture(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#1E1A16" });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function handleDownload() {
    setBusy("download");
    setError("");
    try {
      const blob = await capture();
      if (!blob) throw new Error("card not ready");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "body-shaper-system-progress.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't prepare the image. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    setError("");
    try {
      const blob = await capture();
      if (!blob) throw new Error("card not ready");
      const file = new File([blob], "body-shaper-system-progress.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Progress — Body Shaper System" });
      } else {
        await handleDownload();
      }
    } catch {
      // share sheet cancelled — nothing to do
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="simg-backdrop" onClick={onClose}>
      <div className="simg-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="simg-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="simg-capture-wrap">
          <ShareableProgressCard ref={cardRef} category={category} changes={changes} closingPhrase={closingPhrase} compareLabel={compareLabel} />
        </div>
        {error && <p className="sched-error" style={{ marginTop: 10 }}>{error}</p>}
        <div className="simg-actions">
          <button type="button" className="pcel-btn-primary" onClick={handleShare} disabled={busy !== null}>
            {busy === "share" ? "Preparing…" : "SHARE ↗"}
          </button>
          <button type="button" className="pcel-btn-secondary" onClick={handleDownload} disabled={busy !== null}>
            {busy === "download" ? "Preparing…" : "DOWNLOAD"}
          </button>
        </div>
      </div>
    </div>
  );
}
