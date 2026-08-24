"use client";

export default function PhotoDownloadButton({ url, filename, label }: { url: string; filename: string; label?: string }) {
  async function handleDownload() {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <button type="button" className="pp-download-btn" onClick={handleDownload} aria-label={label ?? "Download photo"} title={label ?? "Download"}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3v12M7 10l5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
