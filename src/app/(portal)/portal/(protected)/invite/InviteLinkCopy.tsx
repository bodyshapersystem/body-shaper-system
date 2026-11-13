"use client";

import { useState } from "react";

export default function InviteLinkCopy({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ss-link-row-light">
      <code>{url.replace(/^https?:\/\/(www\.)?/, "")}</code>
      <button
        type="button"
        className="ss-btn ss-btn-sm"
        onClick={() =>
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
        }
      >
        {copied ? "copied ✓" : "copy"}
      </button>
    </div>
  );
}
