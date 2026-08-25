/**
 * A sparkle glyph for next/og ImageResponse templates, drawn with
 * plain divs (no font glyph, no image/SVG data-URI).
 *
 * History: the Unicode ✦/✧ characters aren't in the bundled fonts,
 * so Satori rendered them as a "?" placeholder. Replacing them with
 * an SVG data-URI <img> then broke differently — Satori threw
 * "Cannot read properties of undefined (reading '256')" trying to
 * parse the SVG, since its image support is built for raster
 * formats (PNG/JPEG), not full SVG rendering. Two overlapping
 * rounded bars form a simple sparkle/cross shape using only
 * absolute-position divs, which Satori always supports natively —
 * no font, no image parsing, nothing left to fail.
 */
export function sparkleStyle(size: number, color: string) {
  const barThickness = size * 0.22;
  const radius = barThickness / 2;
  return {
    wrap: { width: size, height: size, position: "relative" as const },
    horizontal: {
      position: "absolute" as const,
      width: size,
      height: barThickness,
      background: color,
      borderRadius: radius,
      top: (size - barThickness) / 2,
      left: 0,
    },
    vertical: {
      position: "absolute" as const,
      width: barThickness,
      height: size,
      background: color,
      borderRadius: radius,
      top: 0,
      left: (size - barThickness) / 2,
    },
  };
}
