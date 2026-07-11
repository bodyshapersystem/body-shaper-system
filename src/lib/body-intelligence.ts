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
 * somewhere to write results (weight lost, inches lost, body fat
 * reduced, muscle gained), using well-known columns for the metrics
 * named today and a JSON `metrics` field for whatever gets added
 * later without another migration.
 */
export async function createProgressSnapshot(params: {
  clientId: string;
  assessmentId?: string;
  baselineMeasurementId?: string;
  latestMeasurementId?: string;
  weightLostKg?: number;
  bodyFatReducedPercent?: number;
  muscleGainedKg?: number;
  waistCmLost?: number;
  metrics?: Prisma.InputJsonValue;
  notes?: string;
}) {
  return prisma.progressSnapshot.create({ data: params });
}

export async function getClientProgressSnapshots(clientId: string) {
  return prisma.progressSnapshot.findMany({ where: { clientId }, orderBy: { calculatedAt: "desc" } });
}

/**
 * Assembles everything a future Body Intelligence Report™ (or any
 * dashboard) would need for one client: the active Blueprint
 * Assessment™ (strategy), full measurement/scan/photo history
 * (results), strategy change history (evolution), and any recorded
 * progress snapshots (timeline). No PDF/report generation exists yet
 * — this is the single data-assembly point a future generator would
 * call instead of re-querying all of this itself.
 */
export async function getClientBodyIntelligence(clientId: string) {
  const [activeAssessment, bodyMeasurements, renphoScans, photos, progressSnapshots] = await Promise.all([
    prisma.blueprintAssessment.findFirst({
      where: { clientId, status: "ACTIVE" },
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
    professionalMeasurements: bodyMeasurements,
    renphoAnalysis: renphoScans,
    progressPhotos: photos,
    strategyEvolution: activeAssessment?.strategyChanges ?? [],
    resultsTimeline: progressSnapshots,
  };
}
