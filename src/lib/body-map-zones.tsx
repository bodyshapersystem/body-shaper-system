/**
 * Real, shared body-map zone data for the Session Area Map — plain
 * data, deliberately kept in a file WITHOUT "use client" so both the
 * interactive picker (SessionBodyMap, a client component) and the
 * read-only historical display (SessionAreaMapCard, rendered from
 * server components) can import it without crossing a React Server
 * Components boundary.
 *
 * IMPORTANT — after repeated attempts to hand-draw this silhouette in
 * SVG never satisfied Emmy ("no quiero que rediseñes... tienes que
 * copiar y pegar la misma imagen"), the base artwork is now Emmy's
 * OWN reference image, used as-is — not redrawn. The two PNGs at
 * /public/images/session-area-map/{front,back}.png are a direct crop
 * of her uploaded reference (IMG_0246.jpeg), with only the light-gray
 * dashed zone-template lines digitally removed (they were a distinct,
 * cooler gray from the warm-brown outline, so they could be filtered
 * out by color rather than redrawn) and the "front"/"back" text label
 * cropped off (the app renders its own label). The actual body line
 * art — every curve, proportion, and pixel — is her image, untouched.
 *
 * FRONT_IMAGE / BACK_IMAGE give the native pixel size of those PNGs;
 * IMAGE_VIEWBOX is that same size as an SVG viewBox string, so the
 * interactive/read-only zone overlay (an absolutely-positioned <svg>
 * on top of the <img>) shares the image's own coordinate space
 * exactly — no rescaling, no separate coordinate system to keep in
 * sync with a hand-drawn figure that no longer exists.
 *
 * Zone paths below were placed by reading the dashed zone-template
 * grid lines directly off the original reference (before they were
 * removed from the shipped image) with a pixel grid overlay, then
 * verified by rendering the zones as a semi-opaque overlay on the
 * actual shipped PNG and confirming visually that every zone sits on
 * the correct body part with no overflow past the silhouette.
 */

export const STROKE = "#B9A38F";
export const FILL_SELECTED = "rgba(199,158,147,0.8)";

export const FRONT_IMAGE = "/images/session-area-map/front.png";
export const BACK_IMAGE = "/images/session-area-map/back.png";
export const IMAGE_WIDTH = 300;
export const IMAGE_HEIGHT = 1122;
export const IMAGE_VIEWBOX = `0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`;

export type Zone = { name: string; path: string };

export const FRONT_ZONES: Zone[] = [
  { name: "Upper Left Abdomen", path: "M90,195 L152,195 L152,287 L92,287 Z" },
  { name: "Upper Right Abdomen", path: "M152,195 L214,195 L212,287 L152,287 Z" },
  { name: "Lower Left Abdomen", path: "M92,287 L152,287 L152,380 L98,380 Z" },
  { name: "Lower Right Abdomen", path: "M152,287 L212,287 L206,380 L152,380 Z" },
  { name: "Left Lateral", path: "M65,195 L90,195 L98,380 L75,380 Z" },
  { name: "Right Lateral", path: "M235,195 L210,195 L206,380 L225,380 Z" },
  {
    name: "Left Front Arm",
    path: "M62,160 Q38,205 25,260 Q13,320 16,375 Q11,398 21,418 Q34,428 44,414 Q49,394 47,368 Q54,318 62,268 Q70,218 82,178 Z",
  },
  {
    name: "Right Front Arm",
    path: "M238,160 Q262,205 275,260 Q287,320 284,375 Q289,398 279,418 Q266,428 256,414 Q251,394 253,368 Q246,318 238,268 Q230,218 218,178 Z",
  },
  { name: "Left Front Thigh", path: "M98,462 L142,462 L138,695 L103,695 Z" },
  { name: "Right Front Thigh", path: "M202,462 L158,462 L162,695 L197,695 Z" },
  { name: "Left Front Calf", path: "M103,715 L138,715 L132,968 L110,968 Z" },
  { name: "Right Front Calf", path: "M197,715 L162,715 L168,968 L190,968 Z" },
];

export const BACK_ZONES: Zone[] = [
  { name: "Upper Left Back", path: "M90,195 L152,195 L152,287 L92,287 Z" },
  { name: "Upper Right Back", path: "M152,195 L214,195 L212,287 L152,287 Z" },
  { name: "Lower Left Back", path: "M92,287 L152,287 L152,380 L98,380 Z" },
  { name: "Lower Right Back", path: "M152,287 L212,287 L206,380 L152,380 Z" },
  {
    name: "Left Posterior Arm",
    path: "M62,160 Q38,205 25,260 Q13,320 16,375 Q11,398 21,418 Q34,428 44,414 Q49,394 47,368 Q54,318 62,268 Q70,218 82,178 Z",
  },
  {
    name: "Right Posterior Arm",
    path: "M238,160 Q262,205 275,260 Q287,320 284,375 Q289,398 279,418 Q266,428 256,414 Q251,394 253,368 Q246,318 238,268 Q230,218 218,178 Z",
  },
  { name: "Left Glute", path: "M92,380 Q85,410 90,435 Q100,455 118,462 L150,462 L150,380 Z" },
  { name: "Right Glute", path: "M212,380 Q219,410 214,435 Q204,455 186,462 L154,462 L154,380 Z" },
  { name: "Left Posterior Thigh", path: "M98,462 L142,462 L138,695 L103,695 Z" },
  { name: "Right Posterior Thigh", path: "M202,462 L158,462 L162,695 L197,695 Z" },
  { name: "Left Posterior Calf", path: "M103,715 L138,715 L132,968 L110,968 Z" },
  { name: "Right Posterior Calf", path: "M197,715 L162,715 L168,968 L190,968 Z" },
];
