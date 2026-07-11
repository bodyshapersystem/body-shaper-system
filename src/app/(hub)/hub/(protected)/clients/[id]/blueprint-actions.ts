"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { recordStrategyChange, getActiveAssessmentForClient } from "@/lib/blueprint-assessments";
import type { PhotoType, Visibility } from "@prisma/client";

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function requireAssessment(clientId: string) {
  const assessment = await getActiveAssessmentForClient(clientId);
  if (!assessment) throw new Error("No active Blueprint Assessment found for this client.");
  return assessment;
}

/**
 * Section 1 — Professional Body Measurements. Every submission is a
 * new historical row (BodyMeasurement is never updated in place).
 */
export async function addProfessionalMeasurement(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "measurements.manage")) {
    return { error: "You don't have permission to record measurements." };
  }

  const assessment = await getActiveAssessmentForClient(clientId);
  const measuredAtRaw = formData.get("measuredAt");

  await prisma.bodyMeasurement.create({
    data: {
      clientId,
      assessmentId: assessment?.id,
      measuredAt: measuredAtRaw ? new Date(String(measuredAtRaw)) : new Date(),
      waistCm: num(formData, "waistCm"),
      highWaistCm: num(formData, "highWaistCm"),
      lowerAbdomenCm: num(formData, "lowerAbdomenCm"),
      hipsCm: num(formData, "hipsCm"),
      chestCm: num(formData, "chestCm"),
      rightArmCm: num(formData, "rightArmCm"),
      leftArmCm: num(formData, "leftArmCm"),
      rightThighCm: num(formData, "rightThighCm"),
      leftThighCm: num(formData, "leftThighCm"),
      notes: (formData.get("notes") as string) || undefined,
      specialistId: user.id,
    },
  });

  await maybeAdvanceToBaselineCompleted(clientId);

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Section 2 — Body Composition (Renpho Health, manual entry). Every
 * scan is a new historical row (Measurement is never updated).
 */
export async function addBodyComposition(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "measurements.manage")) {
    return { error: "You don't have permission to record body composition." };
  }

  const assessment = await getActiveAssessmentForClient(clientId);
  const measuredAtRaw = formData.get("measuredAt");

  await prisma.measurement.create({
    data: {
      clientId,
      assessmentId: assessment?.id,
      scanDate: measuredAtRaw ? new Date(String(measuredAtRaw)) : new Date(),
      weightKg: num(formData, "weightKg"),
      bmi: num(formData, "bmi"),
      bodyFatPercent: num(formData, "bodyFatPercent"),
      muscleMassKg: num(formData, "muscleMassKg"),
      skeletalMuscleKg: num(formData, "skeletalMuscleKg"),
      bodyWaterPercent: num(formData, "bodyWaterPercent"),
      proteinPercent: num(formData, "proteinPercent"),
      visceralFat: num(formData, "visceralFat"),
      boneMassKg: num(formData, "boneMassKg"),
      bmr: num(formData, "bmr"),
      bodyAge: num(formData, "bodyAge"),
      subcutaneousFatPercent: num(formData, "subcutaneousFatPercent"),
      fatFreeWeightKg: num(formData, "fatFreeWeightKg"),
      deviceSource: "RENPHO Health",
      notes: (formData.get("notes") as string) || undefined,
      createdById: user.id,
    },
  });

  await maybeAdvanceToBaselineCompleted(clientId);

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

async function maybeAdvanceToBaselineCompleted(clientId: string) {
  const assessment = await getActiveAssessmentForClient(clientId);
  if (!assessment || assessment.status !== "BASELINE_PENDING") return;

  const { complete } = await checkValidationRequirements(assessment.id, clientId);
  if (complete) {
    await prisma.blueprintAssessment.update({ where: { id: assessment.id }, data: { status: "BASELINE_COMPLETED" } });
  }
}

/**
 * Section 3 — Progress Photos. Stored in the existing private
 * "client-documents" Storage bucket under a photos/ prefix (no new
 * bucket/RLS setup needed for this milestone). Default visibility is
 * INTERNAL_ONLY per direction — nothing here exposes photos to the
 * Portal yet.
 */
export async function uploadProgressPhoto(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload photos." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a photo to upload." };

  const type = formData.get("type") as PhotoType;
  const visibility = (formData.get("visibility") as Visibility) || "INTERNAL_ONLY";
  const takenAtRaw = formData.get("takenAt");
  const notes = (formData.get("notes") as string) || undefined;

  const assessment = await getActiveAssessmentForClient(clientId);

  const admin = createSupabaseAdminClient();
  const path = `photos/${clientId}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("client-documents")
    .upload(path, Buffer.from(arrayBuffer), { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  await prisma.photo.create({
    data: {
      clientId,
      assessmentId: assessment?.id,
      type,
      storagePath: path,
      takenAt: takenAtRaw ? new Date(String(takenAtRaw)) : undefined,
      specialistId: user.id,
      notes,
      visibility,
    },
  });

  await maybeAdvanceToBaselineCompleted(clientId);

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Section 4 — Specialist Observations. Append-only — never
 * overwritten. Default visibility INTERNAL_ONLY.
 */
export async function addObservation(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to add observations." };
  }

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "Observation can't be empty." };
  const visibility = (formData.get("visibility") as Visibility) || "INTERNAL_ONLY";

  const assessment = await requireAssessment(clientId).catch(() => null);
  if (!assessment) return { error: "No active Blueprint Assessment found for this client." };

  await prisma.specialistObservation.create({
    data: { assessmentId: assessment.id, authorId: user.id, body, visibility },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Checks whether the required baseline records exist for validation:
 * at least one Professional Measurement, at least one Body
 * Composition (Renpho) scan, and baseline photos covering FRONT,
 * LEFT, RIGHT, BACK (DETAIL is never required).
 */
async function checkValidationRequirements(assessmentId: string, clientId: string) {
  const [measurementCount, scanCount, photos] = await Promise.all([
    prisma.bodyMeasurement.count({ where: { clientId } }),
    prisma.measurement.count({ where: { clientId } }),
    prisma.photo.findMany({ where: { clientId }, select: { type: true } }),
  ]);

  const photoTypes = new Set(photos.map((p) => p.type));
  const requiredPhotoTypes: PhotoType[] = ["FRONT", "LEFT", "RIGHT", "BACK"];
  const missingPhotoTypes = requiredPhotoTypes.filter((t) => !photoTypes.has(t));

  const missing: string[] = [];
  if (measurementCount === 0) missing.push("at least one Professional Measurements record");
  if (scanCount === 0) missing.push("at least one Body Composition record");
  if (missingPhotoTypes.length > 0) missing.push(`baseline photos: ${missingPhotoTypes.join(", ")}`);

  return { complete: missing.length === 0, missing };
}

/**
 * Section 5 — Strategy Validation. Only calls recordStrategyChange
 * (which only writes an audit row) if the validated system actually
 * differs from the current recommendedSystem — confirming an
 * unchanged strategy creates no audit noise. Refuses to set
 * status = VALIDATED unless the baseline completion requirements are
 * met.
 */
export async function validateAssessment(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to validate this assessment." };
  }

  const assessment = await getActiveAssessmentForClient(clientId);
  if (!assessment) return { error: "No active Blueprint Assessment found for this client." };

  const { complete, missing } = await checkValidationRequirements(assessment.id, clientId);
  if (!complete) {
    return { error: `Cannot validate yet — missing: ${missing.join("; ")}.` };
  }

  const validatedSystem = (formData.get("validatedSystem") as string) || undefined;
  const validatedFrequency = (formData.get("validatedFrequency") as string) || undefined;
  const validatedSessionCount = num(formData, "validatedSessionCount");
  const complementarySessions = (formData.get("complementarySessions") as string) || undefined;
  const homeCareGuidance = (formData.get("homeCareGuidance") as string) || undefined;
  const optimizationNotes = (formData.get("optimizationNotes") as string) || undefined;
  const validationNotes = (formData.get("validationNotes") as string) || undefined;
  const baselineAppointmentDateRaw = formData.get("baselineAppointmentDate");

  if (validatedSystem) {
    await recordStrategyChange({
      assessmentId: assessment.id,
      newStrategy: validatedSystem,
      reason: validationNotes,
      changedById: user.id,
    });
  }

  await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: {
      status: "VALIDATED",
      validatedAt: new Date(),
      validatedById: user.id,
      validatedFrequency,
      validatedSessionCount,
      complementarySessions,
      homeCareGuidance,
      optimizationNotes,
      validationNotes,
      baselineAppointmentDate: baselineAppointmentDateRaw
        ? new Date(String(baselineAppointmentDateRaw))
        : assessment.baselineAppointmentDate ?? new Date(),
      initialFrequency: assessment.initialFrequency ?? validatedFrequency,
      initialSessionCount: assessment.initialSessionCount ?? validatedSessionCount,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
