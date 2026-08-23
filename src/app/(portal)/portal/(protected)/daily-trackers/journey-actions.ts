"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveProtocol(clientId: string) {
  return prisma.peptideProtocol.findFirst({ where: { clientId, active: true }, orderBy: { updatedAt: "desc" } });
}

/**
 * Real upsert for the client's active protocol — one active protocol
 * at a time (deactivates any prior one rather than deleting it, so
 * history isn't lost).
 */
export async function saveProtocol(fields: {
  peptideName: string;
  dose?: string;
  frequency: string;
  injectionDays: string[];
  injectionTime: string;
  injectionSite?: string;
  protocolStartDate?: string;
  provider?: string;
  notes?: string;
  reminderEnabled: boolean;
  refillOrderByDate?: string;
}) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  if (!fields.peptideName.trim()) return { error: "Please enter which peptide you're taking." };
  if (!fields.injectionTime) return { error: "Please set an injection time." };

  await prisma.peptideProtocol.updateMany({ where: { clientId: client.id, active: true }, data: { active: false } });

  await prisma.peptideProtocol.create({
    data: {
      clientId: client.id,
      peptideName: fields.peptideName.trim(),
      dose: fields.dose?.trim() || null,
      frequency: fields.frequency,
      injectionDays: fields.injectionDays,
      injectionTime: fields.injectionTime,
      injectionSite: fields.injectionSite || null,
      protocolStartDate: fields.protocolStartDate ? new Date(fields.protocolStartDate) : null,
      provider: fields.provider?.trim() || null,
      notes: fields.notes?.trim() || null,
      reminderEnabled: fields.reminderEnabled,
      refillOrderByDate: fields.refillOrderByDate ? new Date(fields.refillOrderByDate) : null,
    },
  });

  revalidatePath("/portal/daily-trackers/journey");
  return { success: true };
}

export async function toggleProtocolReminder(protocolId: string, enabled: boolean) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const protocol = await prisma.peptideProtocol.findUnique({ where: { id: protocolId } });
  if (!protocol || protocol.clientId !== client.id) return { error: "Not found." };

  await prisma.peptideProtocol.update({ where: { id: protocolId }, data: { reminderEnabled: enabled } });
  revalidatePath("/portal/daily-trackers/journey");
  return { success: true };
}

/**
 * Real dose log — real date/time, optional site, optional 1-5
 * post-injection check-in ratings. Tracking only, never a dosing
 * recommendation.
 */
export async function logPeptideDose(fields: {
  peptideName: string;
  administeredAt: string;
  dosage?: string;
  injectionSite?: string;
  notes?: string;
  appetite?: number;
  energy?: number;
  bloating?: number;
  digestion?: number;
  sleepRating?: number;
  mood?: number;
  nausea?: number;
}) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const peptideName = fields.peptideName.trim();
  if (!peptideName) return { error: "Please enter which peptide you took." };
  if (!fields.administeredAt) return { error: "Please pick a date and time." };

  await prisma.peptideLog.create({
    data: {
      clientId: client.id,
      peptideName,
      administeredAt: new Date(fields.administeredAt),
      dosage: fields.dosage?.trim() || null,
      injectionSite: fields.injectionSite || null,
      notes: fields.notes?.trim() || null,
      appetite: fields.appetite ?? null,
      energy: fields.energy ?? null,
      bloating: fields.bloating ?? null,
      digestion: fields.digestion ?? null,
      sleepRating: fields.sleepRating ?? null,
      mood: fields.mood ?? null,
      nausea: fields.nausea ?? null,
    },
  });

  revalidatePath("/portal/daily-trackers/journey");
  revalidatePath("/portal/daily-trackers/insights");
  return { success: true };
}

export async function deletePeptideLog(logId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const log = await prisma.peptideLog.findUnique({ where: { id: logId } });
  if (!log || log.clientId !== client.id) return { error: "Not found." };

  await prisma.peptideLog.delete({ where: { id: logId } });
  revalidatePath("/portal/daily-trackers/journey");
  return { success: true };
}
