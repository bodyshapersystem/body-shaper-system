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
  { name: "Left Front Thigh", path: "M108,430 L162,430 L156,600 L114,600 Z" },
  { name: "Right Front Thigh", path: "M228,430 L174,430 L180,600 L222,600 Z" },
  { name: "Left Front Calf", path: "M114,610 L156,610 L148,780 L122,780 Z" },
  { name: "Right Front Calf", path: "M222,610 L180,610 L188,780 L214,780 Z" },
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
  { name: "Left Posterior Thigh", path: "M108,462 L162,462 L156,600 L114,600 Z" },
  { name: "Right Posterior Thigh", path: "M228,462 L174,462 L180,600 L222,600 Z" },
  { name: "Left Posterior Calf", path: "M114,610 L156,610 L148,780 L122,780 Z" },
  { name: "Right Posterior Calf", path: "M222,610 L180,610 L188,780 L214,780 Z" },
];
