import { b64 as serifB64 } from "./og-font-data/cormorant-garamond";
import { b64 as serifItalicB64 } from "./og-font-data/cormorant-garamond-italic";
import { b64 as sansB64 } from "./og-font-data/jost";

/**
 * Font bytes for next/og ImageResponse routes, embedded directly as
 * base64 in the JS bundle (src/lib/og-font-data/) rather than read
 * from a file at runtime. Two prior approaches both failed in
 * production and were confirmed via runtime logs before landing here:
 * fetch(new URL(file, import.meta.url)) throws "fetch failed: not
 * implemented" (file:// isn't a supported fetch protocol in this
 * runtime), and fs.readFileSync(new URL(...)) throws ENOENT because
 * Next.js's automatic file tracer — even with outputFileTracingIncludes
 * configured — never copied the .ttf files into the deployed function
 * bundle. Embedding the bytes as a bundled JS module sidesteps both
 * problems entirely, since webpack/Next.js always includes whatever a
 * route actually imports.
 */
function decode(b64: string): ArrayBuffer {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export function loadOgFontsNode(): { serif: ArrayBuffer; serifItalic: ArrayBuffer; sans: ArrayBuffer } {
  return {
    serif: decode(serifB64),
    serifItalic: decode(serifItalicB64),
    sans: decode(sansB64),
  };
}
