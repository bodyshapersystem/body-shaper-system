import { prisma } from "@/lib/prisma";

export type NextPhaseCategory = "CONTINUE" | "MUSCLE_SUPPORT" | "FIRMNESS_SUPPORT" | "TISSUE_SUPPORT" | "SYSTEM_EVOLUTION";

/** Real check — completed / total >= 0.50, never hardcoded to a specific session number. */
export function isMidpointEligible(completedSessions: number, totalSessions: number | null | undefined): boolean {
  if (!totalSessions || totalSessions <= 0) return false;
  return completedSessions / totalSessions >= 0.5;
}

const NEXT_PHASE_COPY: Record<NextPhaseCategory, { headline: string; body: string; addOn: string | null }> = {
  CONTINUE: {
    headline: "Your System is right on track. ✦",
    body: "Your midpoint data shows balanced progress and no changes are recommended at this time.",
    addOn: null,
  },
  MUSCLE_SUPPORT: {
    headline: "Muscle Support Opportunity",
    body: "Your midpoint data shows muscle mass trending down while weight is decreasing.\n\nBased on your body-composition trend and current goals, additional muscle-focused support may complement the second half of your System.",
    addOn: "EMS",
  },
  FIRMNESS_SUPPORT: {
    headline: "Firmness Support Opportunity",
    body: "Your measurements are decreasing and skin firmness remains one of your Body Blueprint priorities.\n\nAdditional skin-focused support may complement your next phase.",
    addOn: "Exilis",
  },
  TISSUE_SUPPORT: {
    headline: "Recovery + Tissue Support",
    body: "Your recent progress suggests that additional tissue-focused support may complement your current phase.",
    addOn: "Endospheres",
  },
  SYSTEM_EVOLUTION: {
    headline: "Your body has moved beyond your starting point.",
    body: "Your Blueprint now shows goals that may benefit from a more complete next phase.",
    addOn: "Sculpt Signature™",
  },
};

/**
 * Real create-once Midpoint Data™ record — never regenerated on
 * every page view (the comparison should never silently shift), and
 * never re-triggers commercial review once it's already been decided.
 * Returns the existing review if one is already on file for this
 * assessment.
 */
export async function getOrCreateMidpointReview(clientId: string, assessmentId: string) {
  const existing = await prisma.midpointReview.findFirst({ where: { assessmentId } });
  if (existing) return existing;

  const [scans, tapeMeasurements, assessment] = await Promise.all([
    prisma.measurement.findMany({ where: { assessmentId }, orderBy: { scanDate: "asc" } }),
    prisma.bodyMeasurement.findMany({ where: { assessmentId }, orderBy: { measuredAt: "asc" } }),
    prisma.blueprintAssessment.findUnique({ where: { id: assessmentId } }),
  ]);

  // "Sufficient data" per spec: baseline + at least one updated scan
  // or measurement recorded since — a single (baseline-only) scan is
  // not enough to compare anything against.
  const hasSufficientData = scans.length >= 2 || tapeMeasurements.length >= 2;

  const baseline = scans[0];
  const midpoint = scans[scans.length - 1];
  const baselineTape = tapeMeasurements[0];
  const midpointTape = tapeMeasurements[tapeMeasurements.length - 1];

  let category: NextPhaseCategory | null = null;
  let insightText: string | null = null;

  if (hasSufficientData) {
    const weightDelta = (midpoint?.weightKg ?? 0) - (baseline?.weightKg ?? 0);
    const fatDelta = (midpoint?.bodyFatPercent ?? 0) - (baseline?.bodyFatPercent ?? 0);
    const muscleDelta = (midpoint?.muscleMassKg ?? 0) - (baseline?.muscleMassKg ?? 0);
    const waistDelta = baselineTape && midpointTape ? (midpointTape.waistCm ?? 0) - (baselineTape.waistCm ?? 0) : 0;

    const weightDown = weightDelta < -0.1;
    const fatDown = fatDelta < -0.1;
    const muscleDown = muscleDelta < -0.1;
    const waistDown = waistDelta < -0.3;

    const goalsText = (assessment?.treatmentInterests ?? "").toLowerCase();
    const wantsDefinition = /definition|recomposition|tone|muscle/.test(goalsText);
    const wantsFirmness = /firmness|skin|tighten/.test(goalsText);
    const isSculptStart = (assessment?.recommendedSystem ?? "").toLowerCase().includes("sculpt start");

    if (isSculptStart && wantsDefinition && wantsFirmness) {
      category = "SYSTEM_EVOLUTION";
      insightText =
        "Your body has moved beyond your starting point.\n\nYour weight, body fat and measurements have all shifted since your baseline, and your Blueprint shows more than one goal area at play.\n\nThis is worth discussing as we plan your next phase.";
    } else if (weightDown && muscleDown && wantsDefinition) {
      category = "MUSCLE_SUPPORT";
      insightText =
        "Your body is getting smaller, but we're also seeing a change in muscle mass.\n\nYour weight and body fat are trending down, while muscle mass has decreased slightly during the first half of your System.\n\nBecause definition and body composition are part of your Blueprint goals, this is an important signal as we plan your next phase.";
    } else if (waistDown && wantsFirmness) {
      category = "FIRMNESS_SUPPORT";
      insightText =
        "Your measurements are trending down, and your body is responding well to your System.\n\nSkin firmness remains one of your Blueprint priorities, so we're keeping a close eye on this as your measurements continue to change.";
    } else if (weightDown && fatDown) {
      category = "TISSUE_SUPPORT";
      insightText =
        "Your body composition is moving in the right direction — weight and body fat are both trending down since your baseline.\n\nWe'll continue watching tissue quality and recovery signals as you move into the second half of your System.";
    } else {
      category = "CONTINUE";
      insightText =
        "Your body has been responding steadily through the first half of your System.\n\nWe're seeing consistent signals across your measurements and composition, and your current plan continues to fit what your body needs.";
    }
  }

  const copy = category ? NEXT_PHASE_COPY[category] : null;

  return prisma.midpointReview.create({
    data: {
      clientId,
      assessmentId,
      hasSufficientData,
      baselineWeightKg: baseline?.weightKg,
      baselineBodyFatPercent: baseline?.bodyFatPercent,
      baselineMuscleMassKg: baseline?.muscleMassKg,
      baselineSkeletalMuscleKg: baseline?.skeletalMuscleKg,
      baselineBodyWaterPercent: baseline?.bodyWaterPercent,
      baselineWaistCm: baselineTape?.waistCm,
      midpointWeightKg: midpoint?.weightKg,
      midpointBodyFatPercent: midpoint?.bodyFatPercent,
      midpointMuscleMassKg: midpoint?.muscleMassKg,
      midpointSkeletalMuscleKg: midpoint?.skeletalMuscleKg,
      midpointBodyWaterPercent: midpoint?.bodyWaterPercent,
      midpointWaistCm: midpointTape?.waistCm,
      insightText,
      nextPhaseCategory: category,
      nextPhaseCopy: copy?.body ?? null,
      suggestedAddOn: copy?.addOn ?? null,
      // CONTINUE (or no data yet) needs no Owner review — there's no
      // commercial ask to gate. Every support/evolution category
      // does, per direction: AI may suggest, but a human must approve
      // before the client ever sees a paid-treatment recommendation.
      reviewStatus: !category || category === "CONTINUE" ? "NOT_APPLICABLE" : "PENDING_REVIEW",
    },
  });
}

export function getNextPhaseHeadline(category: string | null): string {
  if (!category) return "";
  return NEXT_PHASE_COPY[category as NextPhaseCategory]?.headline ?? "";
}
