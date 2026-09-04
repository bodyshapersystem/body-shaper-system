/**
 * Real Technology + Area logic for Session Area Map, per the
 * approved written specification (no reference image available for
 * this pass — implemented literally from the spec text). Technology
 * availability, presets, and objective sentences are all curated
 * exactly as specified — nothing invented, nothing left unrestricted
 * beyond what's written.
 */

export type Technology = "Exilis" | "EMS" | "Endospheres" | "Other";

export const TECHNOLOGIES: Technology[] = ["Exilis", "EMS", "Endospheres", "Other"];

// ---------- Real zone names (4-quadrant abdomen/back, per spec) ----------

export const FRONT_ABDOMEN_QUADRANTS = ["Upper Left Abdomen", "Upper Right Abdomen", "Lower Left Abdomen", "Lower Right Abdomen"];
export const LATERALS = ["Left Lateral", "Right Lateral"];
export const FRONT_ARMS = ["Left Front Arm", "Right Front Arm"];
export const FRONT_THIGHS = ["Left Front Thigh", "Right Front Thigh"];
export const FRONT_CALVES = ["Left Front Calf", "Right Front Calf"];

export const BACK_QUADRANTS = ["Upper Left Back", "Upper Right Back", "Lower Left Back", "Lower Right Back"];
export const POSTERIOR_ARMS = ["Left Posterior Arm", "Right Posterior Arm"];
export const GLUTES = ["Left Glute", "Right Glute"];
export const POSTERIOR_THIGHS = ["Left Posterior Thigh", "Right Posterior Thigh"];
export const POSTERIOR_CALVES = ["Left Posterior Calf", "Right Posterior Calf"];

// ---------- Technology-specific area rules (real restrictions, per spec) ----------

/**
 * Real per-technology zone availability. A zone not listed here for
 * the current technology is disabled — non-clickable, shown as
 * unavailable — never silently selectable. "Other" is intentionally
 * unrestricted (a generic/custom technology, per spec section 5's
 * dashed "Other" chip having no defined protocol of its own).
 */
export function isZoneAvailable(technology: Technology, zone: string): boolean {
  if (technology === "Endospheres" || technology === "Other") return true;

  const isCalf = FRONT_CALVES.includes(zone) || POSTERIOR_CALVES.includes(zone);
  if (isCalf) return false; // Exilis and EMS never include calves, per spec

  if (technology === "Exilis") {
    // Exilis: abdomen protocol (front quadrants + laterals + back), legs
    // (front/posterior thighs, optional glutes), optional posterior arms.
    // Never front arms.
    return !FRONT_ARMS.includes(zone);
  }

  if (technology === "EMS") {
    // EMS: abdomen (front only), glutes, legs (thighs only).
    // Never laterals, back, arms.
    const allowed = [...FRONT_ABDOMEN_QUADRANTS, ...GLUTES, ...FRONT_THIGHS, ...POSTERIOR_THIGHS];
    return allowed.includes(zone);
  }

  return true;
}

type Preset = { label: string; areas: string[] };

/**
 * Real, technology-specific quick presets — the exact sets from the
 * spec, never a generic one-size-fits-all list.
 */
export function getPresets(technology: Technology): Preset[] {
  if (technology === "Exilis") {
    return [
      { label: "Abdomen Protocol", areas: [...FRONT_ABDOMEN_QUADRANTS, ...LATERALS, ...BACK_QUADRANTS] },
      { label: "+ Posterior Arms", areas: POSTERIOR_ARMS },
      { label: "Legs — Posterior Only", areas: [...POSTERIOR_THIGHS] },
      { label: "Legs — Front + Back", areas: [...FRONT_THIGHS, ...POSTERIOR_THIGHS] },
    ];
  }
  if (technology === "EMS") {
    return [
      { label: "Abdomen", areas: [...FRONT_ABDOMEN_QUADRANTS] },
      { label: "Glutes", areas: [...GLUTES] },
      { label: "Legs — Front", areas: [...FRONT_THIGHS] },
      { label: "Legs — Back", areas: [...POSTERIOR_THIGHS] },
      { label: "Legs — Front + Back", areas: [...FRONT_THIGHS, ...POSTERIOR_THIGHS] },
    ];
  }
  if (technology === "Endospheres") {
    return [
      { label: "Abdomen + Back", areas: [...FRONT_ABDOMEN_QUADRANTS, ...LATERALS, ...BACK_QUADRANTS] },
      { label: "Full Legs", areas: [...FRONT_THIGHS, ...POSTERIOR_THIGHS, ...FRONT_CALVES, ...POSTERIOR_CALVES] },
      { label: "Posterior Legs + Glutes", areas: [...POSTERIOR_THIGHS, ...POSTERIOR_CALVES, ...GLUTES] },
      { label: "Arms", areas: [...FRONT_ARMS, ...POSTERIOR_ARMS] },
      { label: "Full Body", areas: [...FRONT_ABDOMEN_QUADRANTS, ...LATERALS, ...FRONT_ARMS, ...FRONT_THIGHS, ...FRONT_CALVES, ...BACK_QUADRANTS, ...POSTERIOR_ARMS, ...GLUTES, ...POSTERIOR_THIGHS, ...POSTERIOR_CALVES] },
    ];
  }
  return [];
}

/**
 * Real, curated objective sentences — approved wording only, per
 * spec section 10. Category is inferred from which real areas are
 * selected; if a session mixes categories, sentences for every
 * matched category are combined (deduplicated).
 */
function areaCategory(zone: string): "abdomen" | "glutes" | "legs" | "back" | "arms" | null {
  if (FRONT_ABDOMEN_QUADRANTS.includes(zone) || LATERALS.includes(zone)) return "abdomen";
  if (GLUTES.includes(zone)) return "glutes";
  if (FRONT_THIGHS.includes(zone) || POSTERIOR_THIGHS.includes(zone) || FRONT_CALVES.includes(zone) || POSTERIOR_CALVES.includes(zone)) return "legs";
  if (BACK_QUADRANTS.includes(zone)) return "back";
  if (FRONT_ARMS.includes(zone) || POSTERIOR_ARMS.includes(zone)) return "arms";
  return null;
}

const OBJECTIVE_SENTENCES: Record<Technology, Partial<Record<"abdomen" | "glutes" | "legs" | "back" | "arms", string>>> = {
  Exilis: {
    abdomen: "reduce measurements, refine waist contour, and improve skin firmness.",
    legs: "refine leg contour and improve skin firmness.",
    glutes: "refine contour and improve skin firmness.",
    arms: "improve skin firmness and refine arm contour.",
    back: "refine contour and improve skin firmness.",
  },
  EMS: {
    abdomen: "build abdominal muscle, improve tone, and support a more defined core.",
    glutes: "activate and strengthen the glutes, support lift, and improve definition.",
    legs: "strengthen the legs and improve lower-body muscle tone.",
  },
  Endospheres: {
    legs: "smooth the appearance of cellulite, support circulation, and refine the legs.",
    abdomen: "support tissue decongestion, lymphatic support, and fluid-retention support.",
    glutes: "smooth the appearance of cellulite and support circulation.",
    back: "support tissue decongestion, lymphatic support, and fluid-retention support.",
    arms: "smooth the appearance of cellulite and support circulation.",
  },
  Other: {},
};

/**
 * Real objective generation — returns the approved sentence(s) for
 * every real category represented among the selected areas. Never
 * invents wording outside OBJECTIVE_SENTENCES above.
 */
export function generateObjectives(technology: Technology, areas: string[]): string[] {
  const categories = new Set<string>();
  for (const area of areas) {
    const cat = areaCategory(area);
    if (cat) categories.add(cat);
  }
  const sentences: string[] = [];
  for (const cat of categories) {
    const sentence = OBJECTIVE_SENTENCES[technology][cat as "abdomen" | "glutes" | "legs" | "back" | "arms"];
    if (sentence) sentences.push(sentence);
  }
  return sentences;
}

// ---------- Display grouping (Left/Right → one pill, per Emmy's approved mockups) ----------

/**
 * Real display-label grouping for the "selected areas" pill row.
 * Emmy's approved reference screens (7 real app-screen renders,
 * reviewed directly) consistently collapse every Left/Right pair
 * into a single pill — "laterals", "front thighs", "back arms" —
 * never showing "Left X" / "Right X" as two separate pills. Only
 * fully-selected pairs collapse; a manually one-sided selection
 * (rare, but possible via direct zone tap) still shows its own
 * real zone name rather than a misleading merged label.
 */
const AREA_GROUP_DEFS: { label: string; zones: string[] }[] = [
  { label: "Upper Abdomen", zones: ["Upper Left Abdomen", "Upper Right Abdomen"] },
  { label: "Lower Abdomen", zones: ["Lower Left Abdomen", "Lower Right Abdomen"] },
  { label: "Laterals", zones: LATERALS },
  { label: "Front Arms", zones: FRONT_ARMS },
  { label: "Back Arms", zones: POSTERIOR_ARMS },
  { label: "Front Thighs", zones: FRONT_THIGHS },
  { label: "Front Calves", zones: FRONT_CALVES },
  { label: "Upper Back", zones: ["Upper Left Back", "Upper Right Back"] },
  { label: "Lower Back", zones: ["Lower Left Back", "Lower Right Back"] },
  { label: "Glutes", zones: GLUTES },
  { label: "Posterior Thighs", zones: POSTERIOR_THIGHS },
  { label: "Posterior Calves", zones: POSTERIOR_CALVES },
];

/**
 * Groups real selected zone names into their display pills. Each
 * returned entry carries the underlying zone names it represents,
 * so a pill's "×" can deselect every zone it stands for at once —
 * not just the group label, which isn't a real zone by itself.
 */
export function groupSelectedAreas(areas: string[]): { label: string; zones: string[] }[] {
  const set = new Set(areas);
  const consumed = new Set<string>();
  const result: { label: string; zones: string[] }[] = [];
  for (const g of AREA_GROUP_DEFS) {
    if (g.zones.every((z) => set.has(z))) {
      result.push({ label: g.label, zones: g.zones });
      g.zones.forEach((z) => consumed.add(z));
    }
  }
  for (const a of areas) {
    if (!consumed.has(a)) result.push({ label: a, zones: [a] });
  }
  return result;
}

/**
 * Blueprint Alignment™ — real, direct keyword matching between this
 * session's real objectives/areas and the client's actual Blueprint
 * goals (treatmentInterests / goals text). No medical claims, no
 * invented alignment — a goal counts as matched only if its own
 * wording appears in what this session is actually targeting.
 */
export function computeBlueprintAlignment(
  blueprintGoals: string[],
  sessionAreas: string[],
  sessionObjectives: string[]
): { matched: string[]; unmatched: string[] } {
  const sessionText = [...sessionAreas, ...sessionObjectives].join(" ").toLowerCase();
  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const goal of blueprintGoals) {
    const cleaned = goal.trim();
    if (!cleaned) continue;
    const keywords = cleaned.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 3);
    const isMatch = keywords.some((k) => sessionText.includes(k));
    (isMatch ? matched : unmatched).push(cleaned);
  }
  return { matched, unmatched };
}
