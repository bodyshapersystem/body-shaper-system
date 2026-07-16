"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendWelcomeActivationEmail } from "@/lib/email/service";
import { randomUUID } from "crypto";
import type { DocumentCategory, Visibility } from "@prisma/client";
import {
  getActiveAssessmentForClient,
  startReassessment,
  recordStrategyChange,
  addSpecialistObservation,
} from "@/lib/blueprint-assessments";

const SITE_URL = "https://www.bodyshapersystem.com";

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Records one manual measurement scan. Never updates a prior row —
 * every scan is a new, permanent historical record (RENPHO-ready:
 * once real device sync exists, it writes rows the same way).
 */
export async function addMeasurement(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "measurements.manage")) {
    return { error: "You don't have permission to record measurements." };
  }

  const scanDateRaw = formData.get("scanDate");
  const scanDate = scanDateRaw ? new Date(String(scanDateRaw)) : new Date();

  await prisma.measurement.create({
    data: {
      clientId,
      scanDate,
      weightKg: num(formData, "weightKg"),
      bodyFatPercent: num(formData, "bodyFatPercent"),
      muscleMassKg: num(formData, "muscleMassKg"),
      bodyWaterPercent: num(formData, "bodyWaterPercent"),
      bmi: num(formData, "bmi"),
      visceralFat: num(formData, "visceralFat"),
      boneMassKg: num(formData, "boneMassKg"),
      bmr: num(formData, "bmr"),
      bodyAge: num(formData, "bodyAge"),
      deviceSource: String(formData.get("deviceSource") || "RENPHO Health"),
      notes: (formData.get("notes") as string) || undefined,
      createdById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Updates the client's active Blueprint Assessment™: goals and
 * treatment interests update directly; a change to the recommended
 * system is routed through recordStrategyChange (which only logs an
 * audit entry when the strategy actually changes); free-text notes
 * become a new Specialist Observation entry — an append-only log,
 * never overwritten. This does NOT create a new assessment version —
 * that's reserved for an intentional future reassessment
 * (startReassessment), per the Blueprint Assessment™ architecture.
 */
export async function addStrategyUpdate(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to edit the Blueprint Assessment." };
  }

  let assessment = await getActiveAssessmentForClient(clientId);
  if (!assessment) {
    assessment = await startReassessment(clientId, user.id);
  }

  const goals = (formData.get("goals") as string) || undefined;
  const treatmentInterests = (formData.get("treatmentInterests") as string) || undefined;
  const recommendedSystem = (formData.get("recommendedSystem") as string) || undefined;
  const observationNote = (formData.get("internalNotes") as string) || undefined;

  if (goals || treatmentInterests) {
    await prisma.blueprintAssessment.update({
      where: { id: assessment.id },
      data: { goals: goals ?? assessment.goals, treatmentInterests: treatmentInterests ?? assessment.treatmentInterests },
    });
  }

  if (recommendedSystem) {
    await recordStrategyChange({
      assessmentId: assessment.id,
      newStrategy: recommendedSystem,
      changedById: user.id,
    });
  }

  if (observationNote) {
    await addSpecialistObservation({ assessmentId: assessment.id, body: observationNote, authorId: user.id });
  }

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

export async function sendOwnerMessage(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "messages.manage")) {
    return { error: "You don't have permission to send messages." };
  }

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Message can't be empty." };

  const thread = await prisma.messageThread.upsert({
    where: { clientId },
    create: { clientId },
    update: {},
  });

  await prisma.message.create({
    data: { threadId: thread.id, senderType: "OWNER", senderUserId: user.id, body },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

export async function markMessagesRead(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };

  const thread = await prisma.messageThread.findUnique({ where: { clientId } });
  if (!thread) return { success: true };

  await prisma.message.updateMany({
    where: { threadId: thread.id, senderType: "CLIENT", readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Documents upload, part 1: signed upload URL — same fix as photos
 * (see blueprint-actions.ts createSignedPhotoUploadUrl for why: a
 * known Next.js/Vercel issue where the Server Action body size limit
 * doesn't reliably apply in production, even after raising it in
 * next.config.mjs). No file bytes pass through this function.
 */
export async function createSignedDocumentUploadUrl(clientId: string, fileName: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload documents." };
  }

  const admin = createSupabaseAdminClient();
  const path = `${clientId}/${Date.now()}-${fileName}`;

  const { data, error } = await admin.storage.from("client-documents").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not create upload URL." };

  return { success: true, path, token: data.token };
}

/**
 * Documents upload, part 2: records the Document row once the browser
 * has already uploaded the file directly to Storage via the signed
 * URL. No file bytes here.
 */
export async function recordClientDocument(
  clientId: string,
  data: { storagePath: string; title: string; fileType?: string; sizeBytes?: number; category?: DocumentCategory; visibility?: Visibility }
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload documents." };
  }

  await prisma.document.create({
    data: {
      clientId,
      title: data.title,
      storagePath: data.storagePath,
      fileType: data.fileType,
      sizeBytes: data.sizeBytes,
      category: data.category,
      visibility: data.visibility,
      uploadedById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  revalidatePath("/hub/documents");
  return { success: true };
}

/**
 * Client Records™ additions — view/download, rename/re-categorize,
 * and delete. All additive; no existing document logic changed.
 */
export async function getDocumentSignedUrl(storagePath: string) {
  const user = await getCurrentHubUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function updateDocument(documentId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to edit documents." };
  }

  const title = String(formData.get("title") || "").trim();
  const category = formData.get("category") as DocumentCategory | null;
  const visibility = formData.get("visibility") as Visibility | null;
  if (!title) return { error: "Title can't be empty." };

  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { title, category: category ?? undefined, visibility: visibility ?? undefined },
  });

  revalidatePath(`/hub/clients/${doc.clientId}`);
  revalidatePath("/hub/documents");
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to delete documents." };
  }

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return { error: "Document not found." };

  const admin = createSupabaseAdminClient();
  await admin.storage.from("client-documents").remove([doc.storagePath]);
  await prisma.document.delete({ where: { id: documentId } });

  revalidatePath(`/hub/clients/${doc.clientId}`);
  revalidatePath("/hub/documents");
  return { success: true };
}

/**
 * Resends the portal activation invitation. Safe to click any number
 * of times — never creates a duplicate Auth user or Client record
 * (those already exist), and refuses outright if the client has
 * already activated. If the existing token expired, issues a fresh
 * one rather than reusing an expired link.
 */
export async function resendInvitation(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to resend invitations." };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { user: true, portalInvite: true },
  });

  if (!client) return { error: "Client not found." };
  if (client.user.portalStatus === "ACTIVE") {
    return { error: "This client has already activated their account." };
  }
  if (!client.portalInvite) return { error: "No invitation found for this client." };

  let { token, expiresAt } = client.portalInvite;
  if (expiresAt < new Date()) {
    token = randomUUID();
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    await prisma.portalInvitation.update({
      where: { id: client.portalInvite.id },
      data: { token, expiresAt },
    });
  }

  const activationUrl = `${SITE_URL}/portal/activate?token=${token}`;
  const result = await sendWelcomeActivationEmail({
    clientId: client.id,
    firstName: client.firstName,
    email: client.email,
    activationUrl,
    invitationId: client.portalInvite.id,
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true, emailSent: result.success, emailError: result.success ? undefined : result.error };
}

/**
 * Combined real-data summary for the Clients V2 Overview tab — reuses
 * the same logic already built for Appointments/Payments (session
 * count, plan total/paid/balance) rather than recomputing it
 * differently here. "On Hold" in the progress ring maps to real
 * NO_SHOW appointments (a session that was scheduled but didn't
 * happen) — not a fabricated status.
 */
export async function getClientOverviewSummary(clientId: string) {
  const [client, completedCount, noShowCount, paidAgg, pendingAgg, nextAppointment] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        blueprintAssessments: {
          where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    }),
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { clientId, status: "NO_SHOW" } }),
    prisma.payment.aggregate({ where: { clientId, status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { clientId, status: "PENDING" }, _sum: { amountCents: true } }),
    prisma.appointment.findFirst({ where: { clientId, status: "SCHEDULED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
  ]);

  if (!client) return null;

  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? null;
  const remaining = totalSessions !== null ? Math.max(totalSessions - completedCount, 0) : null;
  const planTotalCents = assessment?.planTotalCents ?? null;
  const paidCents = paidAgg._sum.amountCents ?? 0;
  const pendingCents = pendingAgg._sum.amountCents ?? 0;
  const balanceCents = planTotalCents !== null ? Math.max(planTotalCents - paidCents, 0) : null;
  const overallProgressPercent = totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null;

  return {
    system: assessment?.recommendedSystem ?? null,
    totalSessions,
    completedCount,
    remaining,
    onHoldCount: noShowCount,
    overallProgressPercent,
    planTotalCents,
    paidCents,
    pendingCents,
    balanceCents,
    nextAppointment: nextAppointment ? { title: nextAppointment.title, startsAt: nextAppointment.startsAt } : null,
    status: client.archivedAt
      ? "Archived"
      : client.pausedAt
      ? "Paused"
      : assessment?.status === "COMPLETED"
      ? "Completed"
      : "Active",
  };
}

export async function toggleClientPause(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to change client status." };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  await prisma.client.update({
    where: { id: clientId },
    data: { pausedAt: client.pausedAt ? null : new Date() },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  revalidatePath("/hub/clients");
  return { success: true };
}

export async function addClientNote(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.view")) {
    return { error: "You don't have permission to add notes." };
  }

  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Note can't be empty." };

  await prisma.clientNote.create({
    data: { clientId, authorId: user.id, content },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Real-record cleanup — separate from Pause/Resume, which is a
 * reversible business-status toggle, not deletion. This is genuine,
 * permanent, cascading deletion of a test Client and every related
 * record (Documents, Payments, Appointments, Photos, Measurements,
 * BlueprintAssessments, Notes, Messages, Rewards, PortalInvitation,
 * EmailEvents), plus the underlying Supabase Auth login and User row
 * — so the same email can immediately be reused in a fresh test.
 */
export async function getClientDeletionPreview(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) return { error: "You don't have permission to do this." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  const [assessments, measurements, photos, appointments, payments, documents, notes, messages, rewards] = await Promise.all([
    prisma.blueprintAssessment.count({ where: { clientId } }),
    prisma.bodyMeasurement.count({ where: { clientId } }),
    prisma.photo.count({ where: { clientId } }),
    prisma.appointment.count({ where: { clientId } }),
    prisma.payment.count({ where: { clientId } }),
    prisma.document.count({ where: { clientId } }),
    prisma.clientNote.count({ where: { clientId } }),
    prisma.message.count({ where: { thread: { clientId } } }),
    prisma.rewardsAccount.count({ where: { clientId } }),
  ]);

  return {
    success: true,
    clientName: `${client.firstName} ${client.lastName}`,
    email: client.email,
    counts: { assessments, measurements, photos, appointments, payments, documents, notes, messages, rewards },
  };
}

export async function deleteClientPermanently(clientId: string, confirmationText: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to do this." };
  }
  if (confirmationText !== "DELETE") return { error: 'Type "DELETE" exactly to confirm.' };

  const client = await prisma.client.findUnique({ where: { id: clientId }, include: { user: true } });
  if (!client) return { error: "Client not found." };

  // Delete the Supabase Auth login first (outside the DB transaction —
  // if this fails we still proceed with DB cleanup rather than leaving
  // a half-deleted record; the auth account can be cleaned up manually
  // as a fallback).
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(client.user.authUserId).catch(() => undefined);

  // Deleting the Client row cascades to every related table
  // (Documents/Payments/Appointments/Photos/Measurements/
  // BlueprintAssessments/Notes/MessageThread/RewardsAccount/
  // PortalInvitation/EmailEvents) via the real onDelete: Cascade
  // foreign keys already in the schema.
  await prisma.client.delete({ where: { id: clientId } });
  await prisma.lead.delete({ where: { id: client.leadId } }).catch(() => undefined);
  await prisma.user.delete({ where: { id: client.userId } }).catch(() => undefined);

  revalidatePath("/hub/clients");
  return { success: true };
}
