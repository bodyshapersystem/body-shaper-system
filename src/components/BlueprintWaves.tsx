/**
 * BlueprintWaves — the official "Body Blueprint Waves™" graphic.
 *
 * Per explicit direction, this is NOT a hand-redrawn SVG interpretation.
 * It is the actual approved artwork, extracted directly from the
 * approved mockup (foil highlight strokes isolated onto a transparent
 * PNG, background removed), reused as-is everywhere the waves appear.
 * Do not redraw, simplify, or replace this asset — if the waves ever
 * need to change, source a new export of the same official artwork.
 */
export default function BlueprintWaves({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: "url(/images/blueprint-waves.png)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "auto 100%",
      }}
      aria-hidden="true"
    />
  );
}
