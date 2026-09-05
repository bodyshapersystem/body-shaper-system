/**
 * Real, shared body-map zone data for the Session Area Map — plain
 * data, deliberately kept in a file WITHOUT "use client" so both the
 * interactive picker (SessionBodyMap, a client component) and the
 * read-only historical display (SessionAreaMapCard, rendered from
 * server components) can import it without crossing a React Server
 * Components boundary.
 *
 * IMPORTANT — the base artwork is Emmy's OWN reference image, used
 * as-is, never redrawn. Current source: her "ems / upper+lower
 * abdomen selected" app screenshot. Since that screenshot has no
 * dashed zone-template grid (unlike the earlier IMG_0246 reference),
 * cleanup here was different: the pink selected-abdomen fill was
 * digitally removed by color (it's a distinct high-saturation
 * pink — high R, R-G and R-B both large — versus the low-saturation
 * warm-brown outline and near-white background, so it could be
 * isolated and erased without touching the linework), with a few
 * pixels of mask dilation to also catch the anti-aliased edge halo
 * around the fill. This also means the abdomen zone coordinates
 * below aren't estimated — they're the exact bounding box (and
 * center dividers) of that pink fill, measured directly, so the
 * quadrants are pixel-exact rather than approximated.
 *
 * This source screenshot's own card viewport cuts the figure off
 * around mid-shin (no feet visible) — matched exactly rather than
 * inventing feet that aren't in Emmy's reference.
 *
 * FRONT_IMAGE / BACK_IMAGE give the native pixel size of those PNGs;
 * IMAGE_VIEWBOX is that same size as an SVG viewBox string, so the
 * interactive/read-only zone overlay (an absolutely-positioned <svg>
 * on top of the <img>) shares the image's own coordinate space
 * exactly — no rescaling, no separate coordinate system to keep in
 * sync with a hand-drawn figure that no longer exists.
 *
 * Remaining zones (laterals, arms, thighs, calves — no pink example
 * was available for these) were placed by reading the outline
 * directly off the image with a pixel grid overlay, then verified by
 * rendering the zones as a semi-opaque overlay on the actual shipped
 * PNG and confirming visually that every zone sits on the correct
 * body part with no overflow past the silhouette.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export const FRONT_IMAGE = "/images/session-area-map/front.png";
export const BACK_IMAGE = "/images/session-area-map/back.png";
export const IMAGE_WIDTH = 420;
export const IMAGE_HEIGHT = 780;
export const IMAGE_VIEWBOX = `0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`;

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M120,271 L168,271 L168,331 L120,331 Z" },
  { name: "Upper Right Abdomen", path: "M168,271 L216,271 L216,331 L168,331 Z" },
  { name: "Lower Left Abdomen", path: "M120,331 L168,331 L168,392 L120,392 Z" },
  { name: "Lower Right Abdomen", path: "M168,331 L216,331 L216,392 L168,392 Z" },
  { name: "Left Lateral", path: "M100,220 L120,271 L120,392 L102,392 L88,300 Z" },
  { name: "Right Lateral", path: "M236,220 L216,271 L216,392 L234,392 L248,300 Z" },
  {
    name: "Left Front Arm",
    path: "M85,160 Q55,220 40,290 Q25,360 22,420 Q10,460 22,485 Q35,495 45,478 Q48,455 45,430 Q55,360 70,300 Q85,240 105,180 Z",
  },
  {
    name: "Right Front Arm",
    path: "M251,160 Q281,220 296,290 Q311,360 314,420 Q326,460 314,485 Q301,495 291,478 Q288,455 291,430 Q281,360 266,300 Q251,240 231,180 Z",
  },
  { name: "Left Front Thigh", path: "M79,440 L100,550 L111,600 L108,650 L158,650 L160,600 L161,550 L151,440 Z" },
  { name: "Right Front Thigh", path: "M258,440 L238,550 L227,600 L229,650 L180,650 L177,600 L177,550 L186,440 Z" },
  { name: "Left Front Calf", path: "M108,650 L114,700 L127,750 L129,778 L159,778 L156,750 L159,700 L158,650 Z" },
  { name: "Right Front Calf", path: "M229,650 L224,700 L211,750 L208,778 L179,778 L182,750 L178,700 L180,650 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M120,271 L168,271 L168,331 L120,331 Z" },
  { name: "Upper Right Back", path: "M168,271 L216,271 L216,331 L168,331 Z" },
  { name: "Lower Left Back", path: "M120,331 L168,331 L168,392 L120,392 Z" },
  { name: "Lower Right Back", path: "M168,331 L216,331 L216,392 L168,392 Z" },
  {
    name: "Left Posterior Arm",
    path: "M85,160 Q55,220 40,290 Q25,360 22,420 Q10,460 22,485 Q35,495 45,478 Q48,455 45,430 Q55,360 70,300 Q85,240 105,180 Z",
  },
  {
    name: "Right Posterior Arm",
    path: "M251,160 Q281,220 296,290 Q311,360 314,420 Q326,460 314,485 Q301,495 291,478 Q288,455 291,430 Q281,360 266,300 Q251,240 231,180 Z",
  },
  { name: "Left Glute", path: "M140,355 Q135,410 155,450 Q175,465 198,462 L198,355 Z" },
  { name: "Right Glute", path: "M260,355 Q265,410 245,450 Q225,465 202,462 L202,355 Z" },
  { name: "Left Posterior Thigh", path: "M113,462 L132,550 L143,600 L141,650 L190,650 L193,600 L193,550 L196,462 Z" },
  { name: "Right Posterior Thigh", path: "M288,462 L270,550 L260,600 L262,650 L212,650 L210,600 L210,550 L212,462 Z" },
  { name: "Left Posterior Calf", path: "M141,650 L146,700 L159,750 L162,778 L191,778 L188,750 L191,700 L190,650 Z" },
  { name: "Right Posterior Calf", path: "M262,650 L257,700 L243,750 L240,778 L211,778 L214,750 L211,700 L212,650 Z" },
];
