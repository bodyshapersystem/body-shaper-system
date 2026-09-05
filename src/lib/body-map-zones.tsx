/**
 * Real, shared body-map zone data (paths + figure outlines) — plain
 * data and stateless function components, deliberately kept in a
 * file WITHOUT "use client" so both the interactive picker
 * (SessionBodyMap, a client component) and the read-only historical
 * displays (SessionAreaMapCard, SessionMapCard, rendered from server
 * components) can import it safely without crossing a React Server
 * Components boundary.
 *
 * Figure rebuilt from scratch after direct comparison against Emmy's
 * 7 approved reference screens showed the previous version reading
 * as "abstract" despite looking structurally similar at a glance —
 * verified via headless-browser render iterations (saved as PNGs and
 * visually inspected, not just eyeballed as JSX) that the concrete,
 * fixable gaps were: no real waist/hip contrast (torso read as a
 * straight column), arms that just stopped in empty space with no
 * hand, feet that were blobby ovals with no toes, and hair that read
 * as ear-flaps rather than a bun. Fixed each directly: a real
 * hourglass torso (bust→waist→hip contrast), a bra + underwear
 * garment line (present in every reference frame), arms that close
 * into an actual hand shape with finger-separation ticks, feet with
 * toe ticks, and a proper pulled-back bun. Front and back use the
 * same torso/arm/leg skeleton (so treated-zone shading lines up
 * identically on both), differing only in the head (face on front,
 * blank crown + bun on back) and back-specific garment lines (bra
 * clasp, spine line, glute crease) instead of front's bra cups.
 *
 * The arm shape specifically went through a few failed attempts
 * worth noting for future-me: drawing the arm as two independent
 * edges (outer + inner) with their own hand-crafted curves reliably
 * produced a self-crossing "X" over the shoulder, because the inner
 * edge's control points swung medially at a different rate than the
 * outer edge's. The fix that actually worked: define the inner edge
 * as a literal parallel offset of the outer edge's own points (same
 * curve shape, shifted ~7-8 units toward the body), which guarantees
 * the two edges never cross since they're geometrically parallel by
 * construction rather than independently eyeballed.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M63,68 Q62,84 63,100 L80,100 L80,68 Q71,64 63,68 Z" },
  { name: "Upper Right Abdomen", path: "M97,68 Q98,84 97,100 L80,100 L80,68 Q89,64 97,68 Z" },
  { name: "Lower Left Abdomen", path: "M63,100 L80,100 L80,132 Q71,136 64,132 Q61,116 63,100 Z" },
  { name: "Lower Right Abdomen", path: "M97,100 L80,100 L80,132 Q89,136 96,132 Q99,116 97,100 Z" },
  { name: "Left Lateral", path: "M57,68 Q52,84 51,100 Q51,116 54,132 L63,132 Q61,116 63,100 Q62,84 63,68 Z" },
  { name: "Right Lateral", path: "M103,68 Q108,84 109,100 Q109,116 106,132 L97,132 Q99,116 97,100 Q98,84 97,68 Z" },
  {
    name: "Left Front Arm",
    path: "M66,42 Q56,46 50,56 Q44,68 42,82 Q41,96 41,110 Q41,118 42,124 Q45,128 47,124 Q48,118 48,110 Q48,96 49,82 Q51,68 57,56 Q63,46 73,42 Q70,41 66,42 Z",
  },
  {
    name: "Right Front Arm",
    path: "M94,42 Q104,46 110,56 Q116,68 118,82 Q119,96 119,110 Q119,118 118,124 Q115,128 113,124 Q112,118 112,110 Q112,96 111,82 Q109,68 103,56 Q97,46 87,42 Q90,41 94,42 Z",
  },
  { name: "Left Front Thigh", path: "M63,244 Q68,240 74,244 L72,286 Q67,289 63,286 Z" },
  { name: "Right Front Thigh", path: "M86,244 Q92,240 97,244 L97,286 Q92,289 88,286 Z" },
  { name: "Left Front Calf", path: "M64,296 Q69,293 74,296 L72,340 Q68,343 65,340 Z" },
  { name: "Right Front Calf", path: "M86,296 Q91,293 96,296 L94,340 Q90,343 88,340 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M63,68 Q62,84 63,100 L80,100 L80,68 Q71,64 63,68 Z" },
  { name: "Upper Right Back", path: "M97,68 Q98,84 97,100 L80,100 L80,68 Q89,64 97,68 Z" },
  { name: "Lower Left Back", path: "M63,100 L80,100 L80,132 Q71,136 64,132 Q61,116 63,100 Z" },
  { name: "Lower Right Back", path: "M97,100 L80,100 L80,132 Q89,136 96,132 Q99,116 97,100 Z" },
  { name: "Left Posterior Arm", path: "M66,44 Q60,52 54,64 Q51,80 50,92 Q50,102 50,108 L46,106 Q46,92 49,80 Q51,66 57,54 Q61,48 65,44 Z" },
  { name: "Right Posterior Arm", path: "M94,44 Q100,52 106,64 Q109,80 110,92 Q110,102 110,108 L114,106 Q114,92 111,80 Q109,66 103,54 Q99,48 95,44 Z" },
  { name: "Left Glute", path: "M54,132 Q52,144 56,153 Q62,160 68,163 L80,163 L80,132 Z" },
  { name: "Right Glute", path: "M106,132 Q108,144 104,153 Q98,160 92,163 L80,163 L80,132 Z" },
  { name: "Left Posterior Thigh", path: "M63,244 Q68,240 74,244 L72,286 Q67,289 63,286 Z" },
  { name: "Right Posterior Thigh", path: "M86,244 Q92,240 97,244 L97,286 Q92,289 88,286 Z" },
  { name: "Left Posterior Calf", path: "M64,296 Q69,293 74,296 L72,340 Q68,343 65,340 Z" },
  { name: "Right Posterior Calf", path: "M86,296 Q91,293 96,296 L94,340 Q90,343 88,340 Z" },
];

/** Shared torso + legs + arms skeleton — identical front and back. */
function BodySkeleton() {
  return (
    <>
      <path d="M74,31 Q74,35 72,39 M86,31 Q86,35 88,39" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path
        d="M70,39
           C 58,42 51,48 51,56
           C 51,64 55,70 57,76
           C 60,84 62,90 64,97
           C 66,104 66,110 63,116
           C 59,122 53,126 51,134
           C 50,140 51,146 55,152
           C 60,157 65,159 68,161
           L 68,163
           L 92,163
           L 92,161
           C 95,159 100,157 105,152
           C 109,146 110,140 109,134
           C 107,126 101,122 97,116
           C 94,110 94,104 96,97
           C 98,90 100,84 103,76
           C 105,70 109,64 109,56
           C 109,48 102,42 90,39
           Q 85,42 80,42
           Q 75,42 70,39 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M51,134 C 49,148 47,164 46,180 C 45,200 46,220 48,236 C 49,246 50,254 50,264
           C 50,278 49,292 50,306 C 51,318 52,328 53,338 L 53,344
           C 48,346 45,350 45,356 C 45,362 49,366 56,367 L 68,366
           C 71,364 71,360 68,357 L 66,344 L 66,338
           C 67,328 68,318 69,306 C 70,292 69,278 69,264 C 69,254 70,246 71,236
           C 72,220 71,200 70,180 C 69,168 68,163 68,163 L 51,134 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M58,363 L58,367 M62,364 L62,368 M50,361 L49,365" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M109,134 C 111,148 113,164 114,180 C 115,200 114,220 112,236 C 111,246 110,254 110,264
           C 110,278 111,292 110,306 C 109,318 108,328 107,338 L 107,344
           C 112,346 115,350 115,356 C 115,362 111,366 104,367 L 92,366
           C 89,364 89,360 92,357 L 94,344 L 94,338
           C 93,328 92,318 91,306 C 90,292 91,278 91,264 C 91,254 90,246 89,236
           C 88,220 89,200 90,180 C 91,168 92,163 92,163 L 109,134 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M102,363 L102,367 M98,364 L98,368 M110,361 L111,365" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M66,42 Q56,46 50,56 Q44,68 42,82 Q41,96 41,110 Q41,118 42,124
           Q37,129 35,137 Q34,144 39,148 Q43,150 47,147 Q49,143 49,124
           Q48,118 48,110 Q48,96 49,82 Q51,68 57,56 Q63,46 73,42
           Q70,41 66,42 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M38,138 L34,142 M39,144 L36,148 M42,147.5 L40,151" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
      <path
        d="M94,42 Q104,46 110,56 Q116,68 118,82 Q119,96 119,110 Q119,118 118,124
           Q123,129 125,137 Q126,144 121,148 Q117,150 113,147 Q111,143 111,124
           Q112,118 112,110 Q112,96 111,82 Q109,68 103,56 Q97,46 87,42
           Q90,41 94,42 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M122,138 L126,142 M121,144 L124,148 M118,147.5 L120,151" fill="none" stroke={STROKE} strokeWidth="0.7" strokeLinecap="round" />
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
      <path d="M53,133 Q80,145 107,133" fill="none" stroke={STROKE} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
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
      <path d="M80,44 Q78,70 80,96 Q82,120 80,140" fill="none" stroke={STROKE} strokeWidth="0.7" opacity="0.6" />
      <path
        d="M58,60 Q80,68 102,60 M78,62 L78,66 M82,62 L82,66 M69,40 L67,55 M91,40 L93,55"
        fill="none"
        stroke={STROKE}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M53,133 Q80,144 107,133" fill="none" stroke={STROKE} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
      <path d="M68,140 Q68,150 71,157 M92,140 Q92,150 89,157" fill="none" stroke={STROKE} strokeWidth="0.7" opacity="0.6" />
    </>
  );
}

/** @deprecated Use FrontFigureOutline / BackFigureOutline. Kept as an alias (front) so any stale import doesn't hard-crash. */
export const FigureOutline = FrontFigureOutline;
