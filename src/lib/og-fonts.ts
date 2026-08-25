import { readFileSync } from "fs";

/**
 * Shared font loader for next/og ImageResponse routes. Fonts live at
 * src/app/api/_fonts/ (co-located with the API routes, NOT /public —
 * files under /public are served by Vercel's static CDN and aren't
 * guaranteed to exist in the serverless function's own filesystem at
 * runtime, which silently crashed every share-image route before this
 * was fixed). fetch(new URL(..., import.meta.url)) is resolved
 * relative to THIS file's location, so it works the same regardless
 * of which route calls it.
 */
export function loadOgFont(filename: string): Promise<ArrayBuffer> {
  const res = fetch(new URL(`../app/api/_fonts/${filename}`, import.meta.url));
  return res.then((r) => r.arrayBuffer());
}

export async function loadOgFonts(): Promise<{ serif: ArrayBuffer; serifItalic: ArrayBuffer; sans: ArrayBuffer }> {
  const [serif, serifItalic, sans] = await Promise.all([
    loadOgFont("CormorantGaramond.ttf"),
    loadOgFont("CormorantGaramond-Italic.ttf"),
    loadOgFont("Jost.ttf"),
  ]);
  return { serif, serifItalic, sans };
}

/**
 * Node.js-runtime variant — fetch(new URL(file, import.meta.url))
 * only resolves correctly under the Edge runtime (Next.js applies
 * special build-time handling for that exact pattern there). Under
 * the Node.js runtime — needed by any route that also embeds a real
 * remote image via <img>, since Edge's fetch can't reach external
 * URLs reliably for next/og — that same pattern throws "fetch failed:
 * not implemented... yet" because file:// isn't a supported fetch
 * protocol. fs.readFileSync accepts a file:// URL object directly,
 * so this is the correct loader for any Node.js-runtime share route.
 */
export function loadOgFontNode(filename: string): ArrayBuffer {
  const bytes = readFileSync(new URL(`../app/api/_fonts/${filename}`, import.meta.url));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export function loadOgFontsNode(): { serif: ArrayBuffer; serifItalic: ArrayBuffer; sans: ArrayBuffer } {
  return {
    serif: loadOgFontNode("CormorantGaramond.ttf"),
    serifItalic: loadOgFontNode("CormorantGaramond-Italic.ttf"),
    sans: loadOgFontNode("Jost.ttf"),
  };
}
