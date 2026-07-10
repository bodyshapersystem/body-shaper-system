/**
 * BlueprintWaves — the "Body Blueprint Waves™" decorative motif: a set
 * of flowing vertical wave lines with a subtle embossed / foil finish,
 * used on the right side of both navigation drawers (public site +
 * client portal). Not part of BrandOverlay's tiled pattern system —
 * this is a single positioned graphic, not a repeating texture.
 *
 * The "foil" effect is approximated with layered strokes: a faint
 * light highlight offset up-left, the main mocha line, and a soft
 * darker shadow offset down-right — the same trick used for embossed
 * paper/foil-stamped print finishes, without relying on CSS/SVG
 * lighting filters (inconsistent across browsers).
 */
export default function BlueprintWaves({ className = "" }: { className?: string }) {
  const waves = [
    "M70,0 C110,70 30,140 70,210 C110,280 30,350 70,420 C110,490 30,560 70,630 C100,690 40,750 70,800",
    "M120,0 C160,80 80,150 120,230 C160,300 80,360 120,440 C155,510 85,570 120,640 C150,700 90,760 120,800",
    "M170,0 C205,90 140,160 170,240 C205,310 140,370 170,450 C200,520 145,580 170,650 C195,710 150,770 170,800",
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 220 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {waves.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#F6ECD9" strokeWidth="1.1" opacity="0.55" transform="translate(-1,-1)" />
          <path d={d} fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.85" />
          <path d={d} fill="none" stroke="#3d2f26" strokeWidth="1" opacity="0.18" transform="translate(1,1)" />
        </g>
      ))}
    </svg>
  );
}
