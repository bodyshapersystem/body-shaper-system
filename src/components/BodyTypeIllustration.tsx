"use client";

import { useState } from "react";
import type { BodyType } from "@prisma/client";
import { BODY_TYPE_CONTENT, bodyTypeImageSrc } from "@/lib/body-types";

/**
 * BodyTypeIllustration — renders the official Body Profile™ illustration
 * from /public/assets/body-types/. Do not redraw or replace these
 * assets; this component only resolves the correct local file for the
 * given bodyType and displays it responsively.
 *
 * If the PNG hasn't been added yet (or fails to load for any reason),
 * this falls back to a lightweight silhouette placeholder rather than
 * a broken image icon — used for the empty/not-yet-assessed state too.
 */
export default function BodyTypeIllustration({
  bodyType,
  maxHeight,
  className = "",
}: {
  bodyType: BodyType | null;
  maxHeight?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!bodyType || errored) {
    return <BodyTypeFallback maxHeight={maxHeight} />;
  }

  return (
    <img
      src={bodyTypeImageSrc(bodyType)}
      alt={`${BODY_TYPE_CONTENT[bodyType].label} body type illustration`}
      onError={() => setErrored(true)}
      className={`bbp-illustration ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
      draggable={false}
    />
  );
}

function BodyTypeFallback({ maxHeight }: { maxHeight?: number }) {
  return (
    <svg
      className="bbp-illustration bbp-illustration-fallback"
      style={maxHeight ? { maxHeight } : undefined}
      viewBox="0 0 200 420"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g stroke="rgba(201,168,118,0.4)" strokeWidth="0.6" fill="none">
        <ellipse cx="100" cy="38" rx="20" ry="26" />
        <path d="M80 60 Q100 50 120 60 L128 120 Q100 135 72 120 Z" />
        <path d="M72 120 Q100 140 128 120 L134 220 Q100 245 66 220 Z" />
        <path d="M66 220 Q100 240 134 220 L140 300 Q100 320 60 300 Z" />
        <path d="M70 300 L64 400 M130 300 L136 400" />
        <path d="M60 300 Q100 322 140 300" />
        <path d="M72 65 Q55 100 58 140 M128 65 Q145 100 142 140" />
      </g>
    </svg>
  );
}
