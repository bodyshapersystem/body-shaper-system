import { readFileSync } from "fs";

/**
 * Shared font loader for next/og ImageResponse routes. Fonts live at
 * src/app/api/_fonts/ (co-located with the API routes, NOT /public —
 * files under /public are served by Vercel's static CDN and aren't
 * guaranteed to exist in the serverless function's own filesystem at
 * runtime).
 *
 * Uses fs.readFileSync(new URL(...)) rather than fetch(new URL(...)):
 * empirically confirmed in production (via runtime logs) that fetch()
 * cannot load file:// URLs here at all — "TypeError: fetch failed /
 * not implemented... yet" — regardless of Edge or Node.js runtime.
 * fs.readFileSync accepts a file:// URL object directly and works
 * reliably, but requires the Node.js runtime (Edge has no `fs`
 * module) — every route using this must also set
 * `export const runtime = "nodejs"`.
 */
function loadOgFont(filename: string): ArrayBuffer {
  const bytes = readFileSync(new URL(`../app/api/_fonts/${filename}`, import.meta.url));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export function loadOgFontsNode(): { serif: ArrayBuffer; serifItalic: ArrayBuffer; sans: ArrayBuffer } {
  return {
    serif: loadOgFont("CormorantGaramond.ttf"),
    serifItalic: loadOgFont("CormorantGaramond-Italic.ttf"),
    sans: loadOgFont("Jost.ttf"),
  };
}
