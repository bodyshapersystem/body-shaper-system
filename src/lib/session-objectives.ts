/**
 * Real, curated Technology + Area → Objective library, per direction:
 * "The specialist should NOT have to manually write the treatment
 * objective every session... Do not let AI freely invent claims."
 * Every objective phrase here is one Emmy explicitly approved in the
 * spec — nothing generated, nothing invented per-session.
 */

export type Technology = "Exilis" | "EMS" | "Endospheres" | "Other";

export const TECHNOLOGIES: Technology[] = ["Exilis", "EMS", "Endospheres", "Other"];

export const ABDOMEN_PRESET = {
  front: ["Upper Abdomen", "Lower Abdomen", "Laterals"],
  back: ["Upper Back", "Lower Back"],
  optional: ["Back Arms"],
};

export const LEGS_PRESETS = {
  posteriorOnly: ["Left Glute", "Right Glute", "Left Posterior Thigh", "Right Posterior Thigh"],
  frontAndBack: [
    "Left Glute", "Right Glute", "Left Posterior Thigh", "Right Posterior Thigh",
    "Left Front Thigh", "Right Front Thigh",
  ],
  optional: ["Inner Thighs", "Outer Thighs", "Knees", "Right Calf", "Left Calf"],
};

type ObjectiveRule = { technology: Technology; match: (area: string) => boolean; objectives: string[] };

const RULES: ObjectiveRule[] = [
  { technology: "EMS", match: (a) => /abdomen/i.test(a), objectives: ["Muscle activation", "Core engagement", "Abdominal tone", "Definition"] },
  { technology: "EMS", match: (a) => /glute/i.test(a), objectives: ["Glute activation", "Muscle stimulation", "Firmness", "Definition", "Lift support"] },
  { technology: "EMS", match: (a) => /thigh/i.test(a), objectives: ["Muscle activation", "Lower-body tone", "Definition"] },
  { technology: "Exilis", match: (a) => /abdomen|flank|lateral|back|waistline/i.test(a), objectives: ["Contour refinement", "Skin firmness", "Waist definition", "Localized fat reduction support", "Measurement reduction support"] },
  { technology: "Exilis", match: (a) => /posterior.*arm|back arms?/i.test(a), objectives: ["Skin firmness", "Arm contour refinement", "Localized volume reduction support"] },
  { technology: "Exilis", match: (a) => /glute/i.test(a), objectives: ["Firmness", "Contour refinement", "Skin-quality support"] },
  { technology: "Exilis", match: (a) => /thigh|calf|calves|knee/i.test(a), objectives: ["Contour refinement", "Skin firmness", "Localized fat reduction support"] },
  { technology: "Endospheres", match: (a) => /thigh|calf|calves|knee/i.test(a), objectives: ["Cellulite appearance improvement", "Tissue smoothing", "Circulation support", "Lymphatic support", "Tissue mobilization"] },
  { technology: "Endospheres", match: (a) => /glute/i.test(a), objectives: ["Tissue smoothing", "Cellulite support", "Circulation support"] },
  { technology: "Endospheres", match: (a) => /abdomen/i.test(a), objectives: ["Tissue decongestion", "Lymphatic support", "Fluid retention support", "Tissue movement"] },
];

/**
 * Real objective generation — never invents a claim not in the
 * approved library above. Returns the deduplicated union of every
 * matching rule's objectives across all selected areas for this
 * technology; an area/technology combination with no matching rule
 * contributes nothing (the specialist can still add notes manually).
 */
export function generateObjectives(technology: Technology, areas: string[]): string[] {
  const objectives = new Set<string>();
  for (const area of areas) {
    for (const rule of RULES) {
      if (rule.technology === technology && rule.match(area)) {
        rule.objectives.forEach((o) => objectives.add(o));
      }
    }
  }
  return Array.from(objectives);
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
