/**
 * BlueprintWaves — the official "Body Blueprint Waves™" graphic.
 *
 * Sourced directly from the official BSS Design System vertical asset
 * export (a dedicated portrait-orientation transparent PNG, purpose-
 * built for this exact placement — not a screenshot, not a landscape
 * crop). Do not redraw, simplify, or replace this asset.
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
