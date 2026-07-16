/**
 * Real categorization of an appointment's color, based on its actual
 * title/technologies — matches the approved design system's 4
 * categories. No fabricated data: purely a classification of real
 * fields already on the Appointment row.
 */
export type AppointmentColorCategory = "combined" | "individual" | "consultation" | "unknown";

const COMBINED_SYSTEM_KEYWORDS = [
  "sculpt signature", "exilipo signature", "exilipo", "exilis + ems", "exilis+ems",
  "exilis + endospheres", "exilis+endospheres", "mom reset", "glp-1 reshape", "glp1 reshape",
  "e3 system", "e³ system", "custom system",
];
const CONSULTATION_KEYWORDS = [
  "consultation", "consult", "body blueprint", "blueprint", "photo", "measurement", "evaluation", "baseline",
];
const INDIVIDUAL_TREATMENT_KEYWORDS = [
  "exilis", "ems", "endospheres", "lymphatic", "massage", "cavitation", "carboxy",
];

export function categorizeAppointment(title: string, technologies?: string[] | null): AppointmentColorCategory {
  const haystack = [title, ...(technologies ?? [])].join(" ").toLowerCase();

  if (CONSULTATION_KEYWORDS.some((k) => haystack.includes(k))) return "consultation";
  if (COMBINED_SYSTEM_KEYWORDS.some((k) => haystack.includes(k))) return "combined";
  // Multiple individual technologies combined in one session (e.g. "Exilis + EMS")
  // reads as a combined system even if the exact system name isn't matched above.
  if ((technologies?.length ?? 0) >= 2) return "combined";
  if (INDIVIDUAL_TREATMENT_KEYWORDS.some((k) => haystack.includes(k))) return "individual";
  return "unknown";
}

export const CATEGORY_LABELS: Record<AppointmentColorCategory, string> = {
  combined: "Combined System",
  individual: "Individual Treatment",
  consultation: "Consultation / Blueprint",
  unknown: "Session",
};
