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
export async function loadOgFont(filename: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(`../app/api/_fonts/${filename}`, import.meta.url));
  return res.arrayBuffer();
}

export async function loadOgFonts(): Promise<{ serif: ArrayBuffer; serifItalic: ArrayBuffer; sans: ArrayBuffer }> {
  const [serif, serifItalic, sans] = await Promise.all([
    loadOgFont("CormorantGaramond.ttf"),
    loadOgFont("CormorantGaramond-Italic.ttf"),
    loadOgFont("Jost.ttf"),
  ]);
  return { serif, serifItalic, sans };
}
