/**
 * A drawn SVG sparkle/star glyph for use inside next/og ImageResponse
 * templates. The Unicode ✦/✧ characters aren't present in the
 * Cormorant Garamond or Jost font files bundled for these routes, so
 * Satori (which can only render glyphs the given fonts actually
 * contain) fell back to a "?" placeholder wherever they appeared.
 * An SVG path has no font-glyph dependency at all, so it always
 * renders correctly regardless of font coverage.
 */
export function sparkleSvg(size: number, color: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2c0 4.5 1.5 8 6 8-4.5 0-6 3.5-6 8 0-4.5-1.5-8-6-8 4.5 0 6-3.5 6-8z"/></svg>`
  ).toString("base64")}`;
}
