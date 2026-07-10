/**
 * BlueprintWaves — the official "Body Blueprint Waves™" graphic.
 *
 * This PNG was delivered with genuine alpha transparency (not a
 * screenshot, not a checkerboard-baked flat image) and is used here
 * completely unmodified — no extraction, no re-coloring, no cropping
 * of the file itself. Do not redraw, simplify, or replace it.
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
