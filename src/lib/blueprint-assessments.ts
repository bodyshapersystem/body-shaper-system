import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, PhotoType } from "@prisma/client";

/**
 * Blueprint Assessment™ — the exclusive clinical/strategic layer.
 * Contains: Jotform intake, professional assessment, body
 * measurements, Renpho scans, photos, strategy, and reassessments.
 * Administrative forms (waivers, prep guides) live in
 * src/lib/forms.ts instead — never here.
 *
 * These are plain library functions, not Server Actions — callers
 * (a webhook route, a future Hub Server Action, a future Portal
 * query) are responsible for their own auth checks before calling
 * anything here. Nothing in this file assumes a Hub session exists,
 * since the Jotform webhook calls createOrUpdateDraftAssessment with
 * no session at all.
 */

/**
 * Creates or updates the Lead-stage draft assessment for a given
 * Lead. Safe to call on every Jotform submission: @@unique(leadId)
 * means a second submission before activation updates the same row
 * instead of creating a duplicate draft.
 */
export async function createOrUpdateDraftAssessment(
  leadId: string,
  data: {
    jotformSubmissionId?: string;
    jotformRawData: Prisma.InputJsonValue;
    goals?: string;
    treatmentInterests?: string;
    recommendedSystem?: string;
  }
) {
  return prisma.blueprintAssessment.upsert({
    where: { leadId },
    create: {
      leadId,
      status: "DRAFT",
      jotformSubmissionId: data.jotformSubmissionId,
      jotformRawData: data.jotformRawData,
      goals: data.goals,
      treatmentInterests: data.treatmentInterests,
      recommendedSystem: data.recommendedSystem,
    },
    update: {
      jotformSubmissionId: data.jotformSubmissionId,
      jotformRawData: data.jotformRawData,
      goals: data.goals,
      treatmentInterests: data.treatmentInterests,
      recommendedSystem: data.recommendedSystem,
    },
  });
}

/**
 * Re-links the Lead-stage draft assessment to the newly-created
 * Client, marking it ACTIVE. This is a RE-LINK, never a copy — same
 * row, same id, same history. If no draft assessment exists (e.g. a
 * Lead created manually in the Hub with no Jotform submission), a
 * blank ACTIVE assessment is created so every Client always has at
 * least one — the "professional baseline" the first appointment
 * enriches.
 */
export async function linkAssessmentToClient(leadId: string, clientId: string, createdById?: string) {
  const existing = await prisma.blueprintAssessment.findUnique({ where: { leadId } });

  if (existing) {
    return prisma.blueprintAssessment.update({
      where: { id: existing.id },
      data: { clientId, status: "ACTIVE" },
    });
  }

  return prisma.blueprintAssessment.create({
    data: { leadId, clientId, status: "ACTIVE", createdById },
  });
}

export async function getActiveAssessmentForClient(clientId: string) {
  return prisma.blueprintAssessment.findFirst({
    where: { clientId, status: "ACTIVE" },
    orderBy: { version: "desc" },
  });
}

export async function getClientAssessments(clientId: string) {
  return prisma.blueprintAssessment.findMany({
    where: { clientId },
    orderBy: { version: "desc" },
    include: {
      bodyMeasurements: { orderBy: { measuredAt: "desc" } },
      renphoScans: { orderBy: { scanDate: "desc" } },
      photos: { orderBy: { uploadedAt: "desc" } },
      specialistObservations: { orderBy: { createdAt: "desc" } },
      strategyChanges: { orderBy: { changedAt: "desc" } },
    },
  });
}

export async function getAssessmentDetail(assessmentId: string) {
  return prisma.blueprintAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      bodyMeasurements: { orderBy: { measuredAt: "desc" } },
      renphoScans: { orderBy: { scanDate: "desc" } },
      photos: { orderBy: { uploadedAt: "desc" } },
      specialistObservations: { orderBy: { createdAt: "desc" } },
      strategyChanges: { orderBy: { changedAt: "desc" } },
    },
  });
}

/**
 * Starts a brand new reassessment version for a client — NOT for
 * routine strategy tweaks (use recordStrategyChange for those on the
 * existing assessment). This is for an intentional future
 * reassessment. Demotes the current ACTIVE assessment to SUPERSEDED.
 */
export async function startReassessment(clientId: string, createdById?: string) {
  const current = await getActiveAssessmentForClient(clientId);
  const nextVersion = (current?.version ?? 0) + 1;

  if (current) {
    await prisma.blueprintAssessment.update({ where: { id: current.id }, data: { status: "SUPERSEDED" } });
  }

  return prisma.blueprintAssessment.create({
    data: {
      clientId,
      version: nextVersion,
      status: "ACTIVE",
      goals: current?.goals,
      treatmentInterests: current?.treatmentInterests,
      recommendedSystem: current?.recommendedSystem,
      createdById,
    },
  });
}

export async function addBodyMeasurement(params: {
  clientId: string;
  assessmentId?: string;
  measuredAt: Date;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  thighCm?: number;
  armCm?: number;
  notes?: string;
  createdById?: string;
}) {
  return prisma.bodyMeasurement.create({ data: params });
}

export async function addPhoto(params: {
  clientId: string;
  assessmentId?: string;
  type: PhotoType;
  storagePath: string;
  takenAt?: Date;
  notes?: string;
  uploadedById?: string;
}) {
  return prisma.photo.create({ data: params });
}

export async function addSpecialistObservation(params: { assessmentId: string; body: string; authorId?: string }) {
  return prisma.specialistObservation.create({ data: params });
}

/**
 * Records a strategy change AND updates the assessment's current
 * recommendedSystem. Only writes a StrategyChange row when the
 * strategy actually changes (previousStrategy !== newStrategy) — a
 * routine confirmation with no change updates nothing and logs
 * nothing, to keep the audit trail meaningful rather than noisy.
 * (This is a default choice, not fixed — flag if you'd rather log
 * confirmations too.)
 */
export async function recordStrategyChange(params: {
  assessmentId: string;
  newStrategy: string;
  reason?: string;
  changedById?: string;
}) {
  const { assessmentId, newStrategy, reason, changedById } = params;

  const assessment = await prisma.blueprintAssessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new Error("Assessment not found");

  if (assessment.recommendedSystem === newStrategy) {
    return { changed: false as const, assessment };
  }

  const [change, updated] = await prisma.$transaction([
    prisma.strategyChange.create({
      data: { assessmentId, previousStrategy: assessment.recommendedSystem, newStrategy, reason, changedById },
    }),
    prisma.blueprintAssessment.update({ where: { id: assessmentId }, data: { recommendedSystem: newStrategy } }),
  ]);

  return { changed: true as const, change, assessment: updated };
}
