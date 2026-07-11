import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, PhotoType } from "@prisma/client";

/**
 * Body Intelligence™ — the measurable evolution of a client's body
 * over time. The Blueprint Assessment™ defines strategy; Body
 * Intelligence™ measures results. Nothing here is ever overwritten —
 * every measurement, scan, and photo is a new permanent historical
 * row.
 *
 * This is a logical API layer, not a physical parent table:
 * BodyMeasurement, Measurement (Renpho), Photo, and ProgressSnapshot
 * each link directly to Client (and optionally to a
 * BlueprintAssessment) rather than through an intermediate
 * "BodyIntelligence" record, since that record would hold no data of
 * its own — it would just be an empty pass-through. The relationship
 * diagram (Blueprint -> Body Intelligence -> Measurements -> Renpho
 * -> Photos -> Progress) is expressed here, in this API surface and
 * in getClientBodyIntelligence's assembly, not as an extra table.
 *
 * Plain library functions — callers are responsible for their own
 * auth checks.
 */

export async function addRenphoScan(params: {
  clientId: string;
  assessmentId?: string;
  scanDate: Date;
  weightKg?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  skeletalMuscleKg?: number;
  bodyWaterPercent?: number;
  proteinPercent?: number;
  bmi?: number;
  visceralFat?: number;
  subcutaneousFatPercent?: number;
  boneMassKg?: number;
  bmr?: number;
  bodyAge?: number;
  fatFreeWeightKg?: number;
  deviceSource?: string;
  notes?: string;
  createdById?: string;
}) {
  return prisma.measurement.create({ data: params });
}

export async function getClientRenphoScans(clientId: string) {
  return prisma.measurement.findMany({ where: { clientId }, orderBy: { scanDate: "desc" } });
}

export async function getClientBodyMeasurements(clientId: string) {
  return prisma.bodyMeasurement.findMany({ where: { clientId }, orderBy: { measuredAt: "desc" } });
}

export async function getClientPhotos(clientId: string, type?: PhotoType) {
  return prisma.photo.findMany({
    where: { clientId, ...(type ? { type } : {}) },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Manually records a progress snapshot. No automatic calculation job
 * exists yet — this just gives a future job/report generator
 * somewhere to write results. `date` is the point in time the
 * snapshot represents; `generatedAt` (defaulted) is when the record
 * itself was produced — these can differ (e.g. a snapshot generated
 * today for last week's data). `aiSummary` is reserved for a future
 * AI-generated narrative; nothing writes to it yet. `metrics` is a
 * JSON escape hatch for any future delta type not listed as its own
 * column.
 */
export async function createProgressSnapshot(params: {
  clientId: string;
  assessmentId?: string;
  baselineMeasurementId?: string;
  latestMeasurementId?: string;
  date: Date;
  weightDeltaKg?: number;
  bodyFatDeltaPercent?: number;
  visceralFatDelta?: number;
  skeletalMuscleDeltaKg?: number;
  inchesLost?: number;
  estimatedFatLossKg?: number;
  estimatedMuscleGainKg?: number;
  adherenceScore?: number;
  specialistSummary?: string;
  aiSummary?: string;
  metrics?: Prisma.InputJsonValue;
  notes?: string;
}) {
  return prisma.progressSnapshot.create({ data: params });
}

export async function getClientProgressSnapshots(clientId: string) {
  return prisma.progressSnapshot.findMany({ where: { clientId }, orderBy: { generatedAt: "desc" } });
}

/**
 * The single source of truth for a client's full Body Intelligence™
 * picture — Blueprint (strategy), Professional Measurements, Renpho,
 * Photos, Progress Snapshots (timeline), Strategy History, and the
 * Active Treatment Plan. Every future report or dashboard should call
 * this instead of querying individual modules directly, so adding a
 * new module later means updating this one function, not every
 * caller.
 *
 * `aiRecommendations` is a reserved placeholder — always null today.
 * No AI generation exists yet; this just fixes the shape of the
 * return value now so a future AI layer can populate it without
 * changing what callers already depend on.
 */
export async function getClientBodyIntelligence(clientId: string) {
  const [activeAssessment, bodyMeasurements, renphoScans, photos, progressSnapshots] = await Promise.all([
    prisma.blueprintAssessment.findFirst({
      where: {
        clientId,
        status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] },
      },
      orderBy: { version: "desc" },
      include: {
        strategyChanges: { orderBy: { changedAt: "desc" } },
        specialistObservations: { orderBy: { createdAt: "desc" } },
      },
    }),
    getClientBodyMeasurements(clientId),
    getClientRenphoScans(clientId),
    getClientPhotos(clientId),
    getClientProgressSnapshots(clientId),
  ]);

  return {
    blueprintSummary: activeAssessment,
    activeTreatmentPlan: activeAssessment
      ? { recommendedSystem: activeAssessment.recommendedSystem, treatmentInterests: activeAssessment.treatmentInterests }
      : null,
    professionalMeasurements: bodyMeasurements,
    renphoAnalysis: renphoScans,
    progressPhotos: photos,
    strategyEvolution: activeAssessment?.strategyChanges ?? [],
    resultsTimeline: progressSnapshots,
    aiRecommendations: null as null, // reserved for future use
  };
}
