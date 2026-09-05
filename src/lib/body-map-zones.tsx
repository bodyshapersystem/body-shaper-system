/**
 * Real, shared body-map zone data (paths + figure outlines) — plain
 * data and stateless function components, deliberately kept in a
 * file WITHOUT "use client" so both the interactive picker
 * (SessionBodyMap, a client component) and the read-only historical
 * displays (SessionAreaMapCard, SessionMapCard, rendered from server
 * components) can import it safely without crossing a React Server
 * Components boundary.
 *
 * Figure rebuilt a second time after Emmy sent two more references
 * (a cleaner isolated Canva export and her zone-template page) and
 * pointed out the previous rebuild — while no longer "abstract" —
 * still didn't match: the torso's waist/hip curve was too exaggerated
 * (visible kinks at the waist-to-hip transition, reading as a
 * caricature rather than a fashion sketch) and the arms had a
 * mid-forearm bulge instead of one clean taper. Verified this
 * concretely, not just by feel: cropped Emmy's reference to isolate
 * the figure, resized my own render to the SAME aspect ratio (an
 * earlier same-pixel-dimensions comparison had silently distorted
 * one image relative to the other, hiding the real proportions) and
 * put them side by side. That comparison showed the actual gesture
 * and proportions were already close — the real gap was line
 * smoothness/elegance, not gross shape. Rebuilt the torso as one
 * continuous flowing cubic-bezier curve (no short segments meeting
 * at sharp angles) and the arms as a single clean taper, then
 * re-verified the same way before shipping. Front and back share one
 * torso/arm/leg skeleton so treated-zone shading lines up identically
 * on both; they differ only in the head (face on front, blank crown +
 * bun on back) and back-specific garment lines (bra clasp, spine
 * line, glute crease) instead of front's bra cups.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M63,68 Q62,84 63,100 L80,100 L80,68 Q71,64 63,68 Z" },
  { name: "Upper Right Abdomen", path: "M97,68 Q98,84 97,100 L80,100 L80,68 Q89,64 97,68 Z" },
  { name: "Lower Left Abdomen", path: "M62,100 L80,100 L80,140 Q71,145 63,140 Q59,120 62,100 Z" },
  { name: "Lower Right Abdomen", path: "M98,100 L80,100 L80,140 Q89,145 97,140 Q101,120 98,100 Z" },
  { name: "Left Lateral", path: "M56,68 Q51,84 51,100 Q50,118 54,135 L62,135 Q59,118 62,100 Q61,84 63,68 Z" },
  { name: "Right Lateral", path: "M104,68 Q109,84 109,100 Q110,118 106,135 L98,135 Q101,118 98,100 Q99,84 97,68 Z" },
  {
    name: "Left Front Arm",
    path: "M66,42 C55,47 48,56 45,68 C42,82 42,96 43,110 C43,116 44,120 45,124 C40,129 37,136 36,143 C35,148 38,151 43,150 C46,150 48,147 48,143 C51,138 52,130 51,120 C51,106 51,92 53,78 C55,64 60,52 68,44 Z",
  },
  {
    name: "Right Front Arm",
    path: "M94,42 C105,47 112,56 115,68 C118,82 118,96 117,110 C117,116 116,120 115,124 C120,129 123,136 124,143 C125,148 122,151 117,150 C114,150 112,147 112,143 C109,138 108,130 109,120 C109,106 109,92 107,78 C105,64 100,52 92,44 Z",
  },
  { name: "Left Front Thigh", path: "M62,182 C59,198 56,216 55,234 C54,248 55,262 55,272 L74,272 C73,258 73,244 73,230 C73,214 72,198 70,182 Z" },
  { name: "Right Front Thigh", path: "M98,182 C101,198 104,216 105,234 C106,248 105,262 105,272 L86,272 C87,258 87,244 87,230 C87,214 88,198 90,182 Z" },
  { name: "Left Front Calf", path: "M55,286 L74,286 C74,300 72,316 70,332 L59,332 C57,316 55,300 55,286 Z" },
  { name: "Right Front Calf", path: "M105,286 L86,286 C86,300 88,316 90,332 L101,332 C103,316 105,300 105,286 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M63,68 Q62,84 63,100 L80,100 L80,68 Q71,64 63,68 Z" },
  { name: "Upper Right Back", path: "M97,68 Q98,84 97,100 L80,100 L80,68 Q89,64 97,68 Z" },
  { name: "Lower Left Back", path: "M62,100 L80,100 L80,140 Q71,145 63,140 Q59,120 62,100 Z" },
  { name: "Lower Right Back", path: "M98,100 L80,100 L80,140 Q89,145 97,140 Q101,120 98,100 Z" },
  { name: "Left Posterior Arm", path: "M68,44 Q60,52 55,64 Q53,78 51,92 Q50,102 50,110 L46,108 Q46,96 48,82 Q51,68 58,56 Q63,48 66,44 Z" },
  { name: "Right Posterior Arm", path: "M92,44 Q100,52 105,64 Q107,78 109,92 Q110,102 110,110 L114,108 Q114,96 112,82 Q109,68 102,56 Q97,48 94,44 Z" },
  { name: "Left Glute", path: "M55,140 Q51,157 56,170 Q62,179 68,182 L80,182 L80,140 Q71,145 63,140 Q59,120 62,100 Q60,120 55,140 Z" },
  { name: "Right Glute", path: "M105,140 Q109,157 104,170 Q98,179 92,182 L80,182 L80,140 Q89,145 97,140 Q101,120 98,100 Q100,120 105,140 Z" },
  { name: "Left Posterior Thigh", path: "M62,182 C59,198 56,216 55,234 C54,248 55,262 55,272 L74,272 C73,258 73,244 73,230 C73,214 72,198 70,182 Z" },
  { name: "Right Posterior Thigh", path: "M98,182 C101,198 104,216 105,234 C106,248 105,262 105,272 L86,272 C87,258 87,244 87,230 C87,214 88,198 90,182 Z" },
  { name: "Left Posterior Calf", path: "M55,286 L74,286 C74,300 72,316 70,332 L59,332 C57,316 55,300 55,286 Z" },
  { name: "Right Posterior Calf", path: "M105,286 L86,286 C86,300 88,316 90,332 L101,332 C103,316 105,300 105,286 Z" },
];

/** Shared torso + legs + arms skeleton — identical front and back. */
function BodySkeleton() {
  return (
    <>
      <path d="M74,31 Q74,35 72,39 M86,31 Q86,35 88,39" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path
        d="M70,39
           C 60,42 53,48 52,58
           C 51,72 54,86 58,100
           C 61,112 64,122 66,131
           C 67,138 66,143 62,148
           C 56,154 51,159 51,167
           C 51,174 55,179 62,182
           Q 71,184.5 80,184.5
           Q 89,184.5 98,182
           C 105,179 109,174 109,167
           C 109,159 104,154 98,148
           C 94,143 93,138 94,131
           C 96,122 99,112 102,100
           C 106,86 109,72 108,58
           C 107,48 100,42 90,39
           Q 85,42 80,42
           Q 75,42 70,39 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M62,182
           C 59,198 56,216 55,234
           C 54,252 55,270 56,286
           C 57,300 58,314 58,326
           C 59,334 59,340 58,346
           L 58,344
           C 52,346 48,350 48,356
           C 48,362 52,366 59,367
           L 69,366
           C 72,364 72,360 69,357
           L 67,344
           L 67,338
           C 68,326 69,312 70,296
           C 71,278 70,260 70,242
           C 70,224 71,206 72,190
           C 71.5,187 71,184 70,182
           Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M58,363 L58,367 M62,364 L62,368 M50,361 L49,365" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M98,182
           C 101,198 104,216 105,234
           C 106,252 105,270 104,286
           C 103,300 102,314 102,326
           C 101,334 101,340 102,346
           L 102,344
           C 108,346 112,350 112,356
           C 112,362 108,366 101,367
           L 91,366
           C 88,364 88,360 91,357
           L 93,344
           L 93,338
           C 92,326 91,312 90,296
           C 89,278 90,260 90,242
           C 90,224 89,206 88,190
           C 88.5,187 89,184 90,182
           Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M102,363 L102,367 M98,364 L98,368 M110,361 L111,365" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M66,42
           C 55,47 48,56 45,68
           C 42,82 42,96 43,110
           C 43,116 44,120 45,124
           C 40,129 37,136 36,143
           C 35,148 38,151 43,150
           C 46,150 48,147 48,143
           C 51,138 52,130 51,120
           C 51,106 51,92 53,78
           C 55,64 60,52 68,44
           Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M39,140 L36,145 M41,146 L38,150 M44,148 L42,152" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M94,42
           C 105,47 112,56 115,68
           C 118,82 118,96 117,110
           C 117,116 116,120 115,124
           C 120,129 123,136 124,143
           C 125,148 122,151 117,150
           C 114,150 112,147 112,143
           C 109,138 108,130 109,120
           C 109,106 109,92 107,78
           C 105,64 100,52 92,44
           Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M121,140 L124,145 M119,146 L122,150 M116,148 L118,152" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
    </>
  );
}

/** Front view: face + bra cups/band + underwear line. */
export function FrontFigureOutline() {
  return (
    <>
      <ellipse cx="80" cy="6" rx="6.5" ry="5" fill="none" stroke={STROKE} strokeWidth="1.1" />
      <path d="M75,4 Q80,2 85,4 Q82,6.5 80,6 Q78,6.5 75,4" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M68,15 Q66,6 80,4 Q94,6 92,15 M68,15 Q66,21 67,28 M92,15 Q94,21 93,28" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinecap="round" />
      <ellipse cx="80" cy="20" rx="10" ry="13" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path
        d="M72,17 Q74,16 76,17 M84,17 Q86,16 88,17 M72,20 Q74,21.3 76,20 M84,20 Q86,21.3 88,20"
        fill="none"
        stroke={STROKE}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path d="M80,21 L79,25.5 Q79,27 80.5,26.5" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path d="M77,29.5 Q80,31 83,29.5" fill="none" stroke={STROKE} strokeWidth="0.8" strokeLinecap="round" />
      <BodySkeleton />
      <path
        d="M56,58 Q80,66 104,58 M64,51 Q70,45 76,51 M84,51 Q90,45 96,51 M69,40 L66,53 M91,40 L94,53"
        fill="none"
        stroke={STROKE}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M55,150 Q80,161 105,150" fill="none" stroke={STROKE} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
    </>
  );
}

/** Back view: no facial features, bun seen from behind, bra clasp + spine + glute crease. */
export function BackFigureOutline() {
  return (
    <>
      <ellipse cx="80" cy="6" rx="7" ry="5.5" fill="none" stroke={STROKE} strokeWidth="1.1" />
      <path d="M74,4 Q80,1.5 86,4 Q83,7 80,6.5 Q77,7 74,4" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M69,15 Q66,8 80,5 Q94,8 91,15 M69,15 Q67,21 68,28 M91,15 Q93,21 92,28" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinecap="round" />
      <ellipse cx="80" cy="20" rx="10" ry="13" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M72,13 Q80,10 88,13" fill="none" stroke={STROKE} strokeWidth="0.8" opacity="0.8" />
      <BodySkeleton />
      <path d="M80,44 Q78,72 80,100 Q82,124 80,145" fill="none" stroke={STROKE} strokeWidth="0.7" opacity="0.6" />
      <path
        d="M58,60 Q80,68 102,60 M78,62 L78,66 M82,62 L82,66 M69,40 L67,55 M91,40 L93,55"
        fill="none"
        stroke={STROKE}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M55,150 Q80,161 105,150" fill="none" stroke={STROKE} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
      <path d="M68,158 Q68,168 71,176 M92,158 Q92,168 89,176" fill="none" stroke={STROKE} strokeWidth="0.7" opacity="0.6" />
    </>
  );
}

/** @deprecated Use FrontFigureOutline / BackFigureOutline. Kept as an alias (front) so any stale import doesn't hard-crash. */
export const FigureOutline = FrontFigureOutline;
