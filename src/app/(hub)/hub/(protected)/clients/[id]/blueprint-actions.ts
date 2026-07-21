"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { recordStrategyChange, getActiveAssessmentForClient } from "@/lib/blueprint-assessments";
import { createNotification } from "@/lib/notifications";
import type { PhotoType, Visibility, BodyType } from "@prisma/client";

const VALID_BODY_TYPES: BodyType[] = ["hourglass", "pear", "apple", "rectangle", "inverted_triangle"];

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

/**
 * Body Profile™ — single source of truth for body-type classification.
 * Set once by the Owner/specialist on the active assessment; every
 * downstream experience (Section 01 illustration, Body Profile card,
 * Blueprint PDF, Client Portal, analytics) reads this same field.
 * Intentionally never recalculated from measurements in the UI layer.
 */
export async function setBodyType(clientId: string, bodyType: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to set the Body Profile." };
  }
  if (!VALID_BODY_TYPES.includes(bodyType as BodyType)) {
    return { error: "Invalid body type." };
  }

  const assessment = await requireAssessment(clientId);

  await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: { bodyType: bodyType as BodyType },
  });

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
 * Section 3 — Progress Photos, part 1: generates a short-lived signed
 * upload URL so the browser can upload the file BYTES directly to
 * Supabase Storage, bypassing our server entirely. This works around
 * a known Next.js/Vercel issue where the Server Action body size
 * limit (meant to be raised via next.config.mjs) doesn't reliably
 * apply in production, causing real phone photos to fail with a 413
 * even after raising the configured limit. No file data passes
 * through this function — just a path/token.
 */
export async function createSignedPhotoUploadUrl(clientId: string, fileName: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload photos." };
  }

  const admin = createSupabaseAdminClient();
  const path = `photos/${clientId}/${Date.now()}-${fileName}`;

  const { data, error } = await admin.storage.from("client-documents").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not create upload URL." };

  return { success: true, path, token: data.token };
}

/**
 * Section 3 — Progress Photos, part 2: records the Photo row once the
 * browser has already uploaded the file directly to Storage using the
 * signed URL from createSignedPhotoUploadUrl. No file bytes here —
 * this is a small, fast DB write.
 */
export async function recordProgressPhoto(
  clientId: string,
  data: {
    storagePath: string;
    type: PhotoType;
    visibility?: Visibility;
    takenAt?: string;
    notes?: string;
  }
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload photos." };
  }

  const assessment = await getActiveAssessmentForClient(clientId);

  await prisma.photo.create({
    data: {
      clientId,
      assessmentId: assessment?.id,
      type: data.type,
      storagePath: data.storagePath,
      takenAt: data.takenAt ? new Date(data.takenAt) : undefined,
      specialistId: user.id,
      notes: data.notes,
      visibility: data.visibility ?? "INTERNAL_ONLY",
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

  // Per direction: validation is no longer blocked on having every
  // baseline requirement (measurements/RENPHO/all 4 photos) on file -
  // the specialist can confirm the strategy with whatever's been
  // recorded so far. checkValidationRequirements() is kept and still
  // called further down for real, informational tracking, not as a
  // hard gate.

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

  const validatedClient = await prisma.client.findUnique({ where: { id: clientId } });
  if (validatedClient) {
    await createNotification({
      clientId,
      category: "FORMS",
      description: `${validatedClient.firstName} ${validatedClient.lastName}'s Body Blueprint™ Assessment was validated`,
      linkUrl: `/hub/clients/${clientId}?tab=blueprint`,
    });

    // Real automation: Completed Blueprint™ -> +15 Body Credits™
    const rewardsAccount = await prisma.rewardsAccount.findUnique({ where: { clientId } });
    if (rewardsAccount) {
      const { computeTier } = await import("@/lib/rewards");
      const newLifetime = rewardsAccount.lifetimePoints + 15;
      await prisma.$transaction([
        prisma.rewardsAccount.update({
          where: { id: rewardsAccount.id },
          data: { pointsBalance: { increment: 15 }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
        }),
        prisma.rewardsTransaction.create({
          data: { rewardsAccountId: rewardsAccount.id, points: 15, action: "Completed Body Blueprint™" },
        }),
      ]);
    }
  }

  return { success: true };
}

/**
 * Progress Photos, part 3: generates a short-lived signed READ URL so
 * a photo thumbnail can be displayed. The storage bucket is private
 * (signed-upload-only), so this is required for any display —
 * separate from createSignedPhotoUploadUrl, which is upload-only.
 */
export async function getPhotoSignedUrl(storagePath: string) {
  const user = await getCurrentHubUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Deletes a progress photo — both the DB row and the underlying
 * storage object. This does not touch any other Blueprint record;
 * measurements/scans/observations/strategy history are all
 * unaffected by removing a photo.
 */
export async function deletePhoto(photoId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to delete photos." };
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return { error: "Photo not found." };

  const admin = createSupabaseAdminClient();
  await admin.storage.from("client-documents").remove([photo.storagePath]);
  await prisma.photo.delete({ where: { id: photoId } });

  revalidatePath(`/hub/clients/${photo.clientId}`);
  return { success: true };
}

/**
 * Edit Personalized System™ — separate from validateAssessment().
 * validateAssessment() is gated behind the full baseline-completion
 * checklist and always forces status=VALIDATED (it's the one-time
 * "validate the Blueprint" gate). This action lets the Owner update
 * Assigned System / Weekly Frequency / Number of Sessions at ANY
 * time afterward, regardless of assessment status, without touching
 * status or requiring the checklist again — real ongoing plan
 * management, not just the initial validation step.
 */
export async function updatePersonalizedPlan(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to edit the Personalized System™." };
  }

  const assessment = await getActiveAssessmentForClient(clientId);
  if (!assessment) return { error: "No active Blueprint Assessment found for this client." };

  const newSystem = (formData.get("recommendedSystem") as string) || undefined;
  const validatedFrequency = (formData.get("validatedFrequency") as string) || undefined;
  const validatedSessionCount = num(formData, "validatedSessionCount");

  if (newSystem && newSystem !== assessment.recommendedSystem) {
    await recordStrategyChange({
      assessmentId: assessment.id,
      newStrategy: newSystem,
      reason: "Updated via Edit Personalized System™",
      changedById: user.id,
    });
  }

  await prisma.blueprintAssessment.update({
    where: { id: assessment.id },
    data: {
      validatedFrequency: validatedFrequency ?? assessment.validatedFrequency,
      validatedSessionCount: validatedSessionCount ?? assessment.validatedSessionCount,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Real quick-edit for the Personalized System / System Architecture
 * fields shown on the Blueprint report — lets the Owner fix/update
 * these without re-running the full validation flow. Only touches
 * fields that were actually submitted (empty string clears a field).
 */
export async function updateSystemDetails(assessmentId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to edit this." };
  }

  const recommendedSystem = (formData.get("recommendedSystem") as string) || null;
  const treatmentInterests = (formData.get("treatmentInterests") as string) || null;
  const goals = (formData.get("goals") as string) || null;
  const validatedFrequency = (formData.get("validatedFrequency") as string) || null;
  const validatedSessionCountRaw = formData.get("validatedSessionCount");
  const validatedSessionCount = validatedSessionCountRaw ? Number(validatedSessionCountRaw) : null;
  const complementarySessions = (formData.get("complementarySessions") as string) || null;
  const homeCareGuidance = (formData.get("homeCareGuidance") as string) || null;

  const assessment = await prisma.blueprintAssessment.findUnique({ where: { id: assessmentId }, select: { clientId: true } });
  if (!assessment) return { error: "Assessment not found." };

  await prisma.blueprintAssessment.update({
    where: { id: assessmentId },
    data: {
      recommendedSystem,
      treatmentInterests,
      goals,
      validatedFrequency,
      validatedSessionCount,
      complementarySessions,
      homeCareGuidance,
    },
  });

  revalidatePath(`/hub/clients/${assessment.clientId}`);
  return { success: true };
}

/**
 * Real RENPHO scan recording — every field except scanDate is
 * optional. Per direction, this must work with just a few real
 * numbers filled in (e.g. weight/BMI/body fat) rather than forcing
 * every field to be completed before saving.
 */
export async function recordRenphoScan(clientId: string, assessmentId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to record this." };
  }

  const scanDateRaw = formData.get("scanDate") as string;
  if (!scanDateRaw) return { error: "Scan date is required." };

  function num(key: string): number | null {
    const raw = formData.get(key);
    if (!raw || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  await prisma.measurement.create({
    data: {
      clientId,
      assessmentId,
      scanDate: new Date(scanDateRaw),
      weightKg: num("weightKg"),
      bodyFatPercent: num("bodyFatPercent"),
      muscleMassKg: num("muscleMassKg"),
      skeletalMuscleKg: num("skeletalMuscleKg"),
      bodyWaterPercent: num("bodyWaterPercent"),
      proteinPercent: num("proteinPercent"),
      bmi: num("bmi"),
      visceralFat: num("visceralFat"),
      subcutaneousFatPercent: num("subcutaneousFatPercent"),
      boneMassKg: num("boneMassKg"),
      bmr: num("bmr") ? Math.round(num("bmr")!) : null,
      bodyAge: num("bodyAge") ? Math.round(num("bodyAge")!) : null,
      fatFreeWeightKg: num("fatFreeWeightKg"),
      notes: (formData.get("notes") as string) || null,
      createdById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
