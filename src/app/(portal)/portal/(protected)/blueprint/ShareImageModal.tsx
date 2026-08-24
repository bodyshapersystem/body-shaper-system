"use client";

import { useState } from "react";

export default function ShareImageModal({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "body-shaper-system-progress.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // no-op — the visible image + right-click-save still works as a fallback
    } finally {
      setDownloading(false);
    }
  }

  async function handleNativeShare() {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "body-shaper-system-progress.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Progress — Body Shaper System" });
      } else {
        await handleDownload();
      }
    } catch {
      // share sheet cancelled — nothing to do
    }
  }

  return (
    <div className="simg-backdrop" onClick={onClose}>
      <div className="simg-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="simg-close" onClick={onClose} aria-label="Close">✕</button>
        <img src={imageUrl} alt="Your progress card" className="simg-preview" />
        <div className="simg-actions">
          <button type="button" className="pcel-btn-primary" onClick={handleNativeShare}>
            SHARE ↗
          </button>
          <button type="button" className="pcel-btn-secondary" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Downloading…" : "DOWNLOAD"}
          </button>
        </div>
      </div>
    </div>
  );
}
