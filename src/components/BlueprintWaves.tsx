/**
 * BlueprintWaves — the official "Body Blueprint Waves™" graphic.
 *
 * This is the actual approved artwork — sourced directly from the
 * official BSS Design System asset export (a clean, dedicated
 * transparent-background render, not a screenshot crop). Do not
 * redraw, simplify, or replace this asset — if the waves ever need
 * to change, source a new export of the same official artwork.
 */
export default function BlueprintWaves({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: "url(/images/blueprint-waves.png)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "auto 135%",
      }}
      aria-hidden="true"
    />
  );
}
