/**
 * Real, shared body-map zone data (paths + figure outline) — plain
 * data and a stateless function component, deliberately kept in a
 * file WITHOUT "use client" so both the interactive picker
 * (SessionBodyMap, a client component) and the read-only historical
 * display (SessionMapCard, rendered from server components like
 * systems-sessions/page.tsx) can import it safely. Importing plain
 * exports from a "use client" file into a Server Component crosses a
 * React Server Components boundary that isn't reliably supported for
 * non-default exports and was the real cause of a server-side
 * exception in production — moving the shared data here avoids that
 * boundary entirely.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M62,148 Q71,142 80,148 L80,172 Q74,172 68,172 Q60,160 62,148 Z" },
  { name: "Upper Right Abdomen", path: "M80,148 Q89,142 98,148 Q100,160 92,172 Q86,172 80,172 Z" },
  { name: "Lower Left Abdomen", path: "M68,172 L80,172 L80,190 Q70,186 68,172 Z" },
  { name: "Lower Right Abdomen", path: "M80,172 L92,172 Q90,186 80,190 L80,172 Z" },
  { name: "Left Lateral", path: "M62,148 Q58,158 62,168 L68,172 Q64,162 65,150 Z" },
  { name: "Right Lateral", path: "M98,148 Q102,158 98,168 L92,172 Q96,162 95,150 Z" },
  { name: "Left Front Arm", path: "M58,58 C52,72 48,90 47,110 L52,155 L58,153 C56,133 55,113 57,95 C59,80 61,68 64,60 Z" },
  { name: "Right Front Arm", path: "M102,58 C108,72 112,90 113,110 L108,155 L102,153 C104,133 105,113 103,95 C101,80 99,68 96,60 Z" },
  { name: "Left Front Thigh", path: "M63,222 Q69,219 74,223 L73,270 Q68,273 64,270 Z" },
  { name: "Right Front Thigh", path: "M86,223 Q91,219 97,222 L96,270 Q92,273 87,270 Z" },
  { name: "Left Front Calf", path: "M64,300 Q69,297 74,300 L72,340 Q68,343 65,340 Z" },
  { name: "Right Front Calf", path: "M86,300 Q91,297 96,300 L94,340 Q90,343 88,340 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M64,150 Q72,145 80,150 L80,164 Q73,161 66,164 Q63,158 64,150 Z" },
  { name: "Upper Right Back", path: "M80,150 Q88,145 96,150 Q97,158 94,164 Q87,161 80,164 Z" },
  { name: "Lower Left Back", path: "M66,164 L80,164 L80,178 Q73,181 68,178 Q64,172 66,164 Z" },
  { name: "Lower Right Back", path: "M80,164 L94,164 Q96,172 92,178 Q87,181 80,178 Z" },
  { name: "Left Posterior Arm", path: "M46,92 C43,102 42,115 43,127 L50,126 C49,114 50,102 53,92 Z" },
  { name: "Right Posterior Arm", path: "M114,92 C117,102 118,115 117,127 L110,126 C111,114 110,102 107,92 Z" },
  { name: "Left Glute", path: "M64,200 Q72,196 80,200 L79,220 Q70,223 63,215 Z" },
  { name: "Right Glute", path: "M96,200 Q88,196 80,200 L81,220 Q90,223 97,215 Z" },
  { name: "Left Posterior Thigh", path: "M63,222 Q69,219 74,223 L73,270 Q68,273 64,270 Z" },
  { name: "Right Posterior Thigh", path: "M86,223 Q91,219 97,222 L96,270 Q92,273 87,270 Z" },
  { name: "Left Posterior Calf", path: "M64,300 Q69,297 74,300 L72,340 Q68,343 65,340 Z" },
  { name: "Right Posterior Calf", path: "M86,300 Q91,297 96,300 L94,340 Q90,343 88,340 Z" },
];

export function FigureOutline() {
  return (
    <>
      <circle cx="80" cy="9" r="5" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <circle cx="80" cy="27" r="13" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d="M69,18 Q62,20 62,30" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d="M91,18 Q98,20 98,30" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <line x1="75" y1="40" x2="75" y2="50" stroke={STROKE} strokeWidth="1.3" />
      <line x1="85" y1="40" x2="85" y2="50" stroke={STROKE} strokeWidth="1.3" />
      <polyline points="75,50 58,58 62,90 66,130 63,150 66,170" fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <polyline points="85,50 102,58 98,90 94,130 97,150 94,170" fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M66,170 Q80,178 94,170" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <polyline points="58,58 50,90 47,125 49,155" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="102,58 110,90 113,125 111,155" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="66,172 63,220 62,280 60,340 60,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="74,172 74,220 73,280 72,340 71,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="86,172 86,220 87,280 88,340 89,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="94,172 97,220 98,280 100,340 100,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M60,380 L71,380 L71,386 L64,386 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
      <path d="M100,380 L89,380 L89,386 L96,386 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
    </>
  );
}
