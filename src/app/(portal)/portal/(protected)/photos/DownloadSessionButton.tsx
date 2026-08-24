"use client";

import { useState } from "react";

export default function DownloadSessionButton({ photos }: { photos: { url: string; filename: string }[] }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadAll() {
    setDownloading(true);
    for (const p of photos) {
      try {
        const res = await fetch(p.url);
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = p.filename;
        a.click();
        URL.revokeObjectURL(objUrl);
        await new Promise((r) => setTimeout(r, 350));
      } catch {
        // continue to the next photo even if one fails
      }
    }
    setDownloading(false);
  }

  return (
    <button type="button" className="pp-download-session-btn" onClick={handleDownloadAll} disabled={downloading}>
      {downloading ? "Downloading…" : "DOWNLOAD SESSION"}
    </button>
  );
}
