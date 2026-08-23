export type GoalCategory = "WEIGHT_LOSS" | "ENERGY_PERFORMANCE" | "SKIN_REGENERATIVE" | "MUSCLE_COMPOSITION" | "GENERAL_CUSTOM";

export const GOAL_CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: "WEIGHT_LOSS", label: "Weight Loss / Body Composition" },
  { value: "ENERGY_PERFORMANCE", label: "Energy / Performance / Wellness" },
  { value: "SKIN_REGENERATIVE", label: "Skin / Regenerative / Longevity" },
  { value: "MUSCLE_COMPOSITION", label: "Muscle / Body Composition" },
  { value: "GENERAL_CUSTOM", label: "General / Custom" },
];

/**
 * Real personalized goal copy for the Peptide Journey™ welcome
 * screen — one fixed block per category, per the approved copy
 * direction. GENERAL_CUSTOM falls back to the client's own free-text
 * goal when they provided one.
 */
export function getGoalCopy(goalCategory: string | null, customGoal: string | null): { focusLine: string; body: string } {
  switch (goalCategory) {
    case "WEIGHT_LOSS":
      return {
        focusLine: "weight loss + body composition",
        body: "We know losing weight matters — but preserving muscle, supporting skin quality and building the body you want along the way matters too.\n\nWe'll follow your weight, body fat, muscle mass, measurements, hydration, habits and progress as your body changes.",
      };
    case "ENERGY_PERFORMANCE":
      return {
        focusLine: "energy + performance",
        body: "More energy is only the beginning.\n\nWe'll track how your body feels, performs and recovers along the way — including sleep, movement, hydration, mood, energy and body-composition changes.",
      };
    case "SKIN_REGENERATIVE":
      return {
        focusLine: "skin quality + regeneration",
        body: "Improving skin quality happens over time.\n\nWe'll follow changes in your tissue, body composition, hydration, recovery and overall progress as your protocol evolves.",
      };
    case "MUSCLE_COMPOSITION":
      return {
        focusLine: "muscle + definition",
        body: "The goal isn't simply a number on the scale.\n\nWe'll follow muscle mass, body fat, measurements, strength-focused habits and definition as your body responds.",
      };
    default:
      return {
        focusLine: customGoal?.trim() || "your personal goal",
        body: "Every body responds differently.\n\nWe'll use your trackers, Body Blueprint and progress data to understand your personal response over time.",
      };
  }
}
