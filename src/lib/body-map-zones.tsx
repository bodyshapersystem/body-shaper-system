/**
 * Real, shared body-map zone data (paths + figure outline) — plain
 * data and a stateless function component, deliberately kept in a
 * file WITHOUT "use client" so both the interactive picker
 * (SessionBodyMap, a client component) and the read-only historical
 * display (SessionMapCard, rendered from server components) can
 * import it safely without crossing a React Server Components
 * boundary.
 *
 * Figure rebuilt to trace Emmy's exact approved mockup (reviewed
 * directly via Canva — an actual high-resolution app-screen render,
 * not a low-res thumbnail): dramatic hourglass waist/hip proportions,
 * visible hands and feet, elegant fashion-illustration silhouette —
 * verified visually via multiple headless-browser render iterations
 * against the reference before shipping.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M63,150 Q71,146 80,150 L80,164 Q73,163 66,164 Q62,158 63,150 Z" },
  { name: "Upper Right Abdomen", path: "M80,150 Q89,146 97,150 Q98,158 94,164 Q87,163 80,164 Z" },
  { name: "Lower Left Abdomen", path: "M66,164 L80,164 L80,178 Q72,180 68,178 Q64,172 66,164 Z" },
  { name: "Lower Right Abdomen", path: "M80,164 L94,164 Q96,172 92,178 Q88,180 80,178 Z" },
  { name: "Left Lateral", path: "M56,150 Q52,158 56,166 L63,150 Z" },
  { name: "Right Lateral", path: "M104,150 Q108,158 104,166 L97,150 Z" },
  { name: "Left Front Arm", path: "M55,53 Q47,66 44,82 Q41,100 43,118 Q42,132 45,145 Q42,150 38,151 L44,154 Q47,150 46,144 Q49,130 50,116 Q52,98 55,82 Q58,66 63,55 Z" },
  { name: "Right Front Arm", path: "M103,53 Q111,66 114,82 Q117,100 115,118 Q116,132 113,145 Q116,150 120,151 L114,154 Q111,150 112,144 Q109,130 108,116 Q106,98 103,82 Q100,66 95,55 Z" },
  { name: "Left Front Thigh", path: "M63,244 Q68,240 74,244 L72,286 Q67,289 63,286 Z" },
  { name: "Right Front Thigh", path: "M86,244 Q92,240 97,244 L97,286 Q92,289 88,286 Z" },
  { name: "Left Front Calf", path: "M64,296 Q69,293 74,296 L72,340 Q68,343 65,340 Z" },
  { name: "Right Front Calf", path: "M86,296 Q91,293 96,296 L94,340 Q90,343 88,340 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M60,98 Q70,94 80,98 L80,120 Q70,117 60,120 Z" },
  { name: "Upper Right Back", path: "M80,98 Q90,94 100,98 L100,120 Q90,117 80,120 Z" },
  { name: "Lower Left Back", path: "M60,120 Q70,117 80,120 L80,150 Q68,158 62,150 Q58,136 60,120 Z" },
  { name: "Lower Right Back", path: "M80,120 Q90,117 100,120 Q102,136 98,150 Q92,158 80,150 Z" },
  { name: "Left Posterior Arm", path: "M44,82 Q41,100 43,118 L48,116 Q46,100 49,84 Z" },
  { name: "Right Posterior Arm", path: "M114,82 Q117,100 115,118 L110,116 Q112,100 109,84 Z" },
  { name: "Left Glute", path: "M62,152 Q71,164 80,164 Q80,180 70,184 Q60,180 58,166 Z" },
  { name: "Right Glute", path: "M98,152 Q89,164 80,164 Q80,180 90,184 Q100,180 102,166 Z" },
  { name: "Left Posterior Thigh", path: "M63,244 Q68,240 74,244 L72,286 Q67,289 63,286 Z" },
  { name: "Right Posterior Thigh", path: "M86,244 Q92,240 97,244 L97,286 Q92,289 88,286 Z" },
  { name: "Left Posterior Calf", path: "M64,296 Q69,293 74,296 L72,340 Q68,343 65,340 Z" },
  { name: "Right Posterior Calf", path: "M86,296 Q91,293 96,296 L94,340 Q90,343 88,340 Z" },
];

export function FigureOutline() {
  return (
    <>
      <ellipse cx="80" cy="20" rx="11" ry="14" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M70,12 Q80,4 90,12" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M69,15 Q64,22 65,32" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M91,15 Q96,22 95,32" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M74,32 Q74,38 72,42 M86,32 Q86,38 88,42" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path
        d="M72,42 Q60,45 55,53 Q51,62 54,72 Q58,84 56,96 Q52,110 55,124
           Q52,138 56,150 Q62,160 70,164 Q66,178 64,196 Q62,220 64,240
           L62,340 Q62,352 64,362 L70,362 Q68,352 68,340 L69,242
           Q74,234 80,234 Q86,234 91,242 L92,340 Q92,352 90,362 L96,362
           Q98,352 96,340 L94,240 Q96,220 94,196 Q92,178 88,164
           Q96,160 102,150 Q106,138 103,124 Q106,110 102,96 Q100,84 104,72
           Q107,62 103,53 Q98,45 86,42 Q83,46 80,46 Q77,46 72,42 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M55,53 Q47,66 44,82 Q41,100 43,118 Q42,132 45,145 Q42,150 38,151 M45,145 Q46,150 44,154"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M103,53 Q111,66 114,82 Q117,100 115,118 Q116,132 113,145 Q116,150 120,151 M113,145 Q112,150 114,154"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M64,362 L70,362 Q71,368 66,370 Q58,372 53,369 Q52,366 56,364 Z" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M96,362 L90,362 Q89,368 94,370 Q102,372 107,369 Q108,366 104,364 Z" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
    </>
  );
}
