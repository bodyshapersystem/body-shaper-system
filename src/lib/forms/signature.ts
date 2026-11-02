import "server-only";
import {jpegSize} from "@/lib/prepare-intake-pdf";

/** Validates the finger-drawn signature sent as a JPEG data URL. Returns the bytes or an error. */
export function parseDrawnSignature(dataUrl: unknown): { ok: true; jpeg: Buffer } | { ok: false; error: string } {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/jpeg;base64,")) return { ok: false, error: "Please draw your signature." };
  if (dataUrl.length > 600_000) return { ok: false, error: "Signature image is too large." };
  const jpeg = Buffer.from(dataUrl.slice("data:image/jpeg;base64,".length), "base64");
  const size = jpegSize(jpeg);
  if (!size || size.width < 100 || size.height < 40 || size.width > 2400 || size.height > 1200) return { ok: false, error: "Please draw your signature again." };
  return { ok: true, jpeg };
}

export function requestAudit(headers: Headers) {
  return {
    ip: (headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 50),
    userAgent: (headers.get("user-agent") || "").slice(0, 400),
  };
}
