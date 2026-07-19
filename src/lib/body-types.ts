import type { BodyType } from "@prisma/client";

/**
 * Body Profile™ — shared content and illustration mapping.
 *
 * `bodyType` itself is never computed in the UI: it is set once by the
 * Owner/specialist on `BlueprintAssessment.bodyType` (see
 * blueprint-actions.ts -> setBodyType) and every experience that needs
 * a label, description, focus list, or illustration reads from this
 * single map keyed by that same enum value. This file has no "server-only"
 * dependency so it can be imported by client components (illustration),
 * server components (Owner Hub report), the PDF generator, and — in the
 * Client Portal migration — the shared read-only Blueprint view.
 */

export const BODY_TYPE_ASSET_BASE = "/assets/body-types/";

export const BODY_TYPE_CONTENT: Record<
  BodyType,
  { label: string; file: string; description: string; focus: string[] }
> = {
  hourglass: {
    label: "Hourglass",
    file: "hourglass.png",
    description:
      "Balanced proportions with a naturally defined waist.",
    focus: ["Waist definition", "Lower abdomen", "Skin firmness", "Overall tightening"],
  },
  pear: {
    label: "Pear",
    file: "pear.png",
    description: "Fat is naturally stored in the hips, thighs, and lower body.",
    focus: ["Inner thighs", "Outer thighs", "Hips & glutes", "Cellulite reduction"],
  },
  apple: {
    label: "Apple",
    file: "apple.png",
    description: "Fat is primarily concentrated around the midsection.",
    focus: ["Abdomen", "Waist contour", "Visceral fat reduction", "Skin tightening"],
  },
  rectangle: {
    label: "Rectangle",
    file: "rectangle.png",
    description: "Shoulders, waist, and hips are relatively aligned.",
    focus: ["Create curves", "Waist definition", "Full body toning", "Muscle definition"],
  },
  inverted_triangle: {
    label: "Inverted Triangle",
    file: "inverted-triangle.png",
    description: "Shoulders are wider than hips.",
    focus: ["Lower body shaping", "Hip enhancement", "Overall balance", "Feminine contouring"],
  },
};

export const BODY_TYPE_OPTIONS: BodyType[] = [
  "hourglass",
  "pear",
  "apple",
  "rectangle",
  "inverted_triangle",
];

export function bodyTypeImageSrc(bodyType: BodyType): string {
  return `${BODY_TYPE_ASSET_BASE}${BODY_TYPE_CONTENT[bodyType].file}`;
}

/**
 * Real, automatic "why this system was selected" text, generated from
 * the client's actual body type — NOT a body-type-to-system-name
 * mapping (per direction: body type and the named System are two
 * separate things). Used as a fallback so this section always has
 * real content tied to the client's own body type, even before a
 * specialist writes their own custom validation notes; the
 * specialist's own words always take priority when present.
 */
export function getBodyTypeRationale(bodyType: BodyType): string {
  const content = BODY_TYPE_CONTENT[bodyType];
  return `Your Personalized System™ was built around your ${content.label.toLowerCase()} body type — ${content.description.toLowerCase()} Your plan prioritizes ${content.focus.slice(0, -1).join(", ").toLowerCase()}, and ${content.focus[content.focus.length - 1].toLowerCase()}.`;
}
