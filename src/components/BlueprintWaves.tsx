/**
 * BlueprintWaves — the official "Body Blueprint Waves™" graphic.
 *
 * Source delivered on a solid white background (not a checkerboard,
 * not pre-existing alpha) — converted to transparency by treating
 * white as fully transparent, while preserving each pixel's original
 * color exactly (no re-coloring). Do not redraw, simplify, or replace
 * this asset.
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
