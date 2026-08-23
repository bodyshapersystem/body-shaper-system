"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveProtocols(clientId: string) {
  return prisma.peptideProtocol.findMany({ where: { clientId, active: true }, orderBy: { createdAt: "asc" } });
}

/**
 * Real create-or-update for a peptide protocol. Multiple protocols
 * can be active at once — a client doing 2 or 3 peptides together
 * gets a card for each, not one overwriting the other. Pass
 * protocolId to edit an existing one; omit it to add a new peptide
 * (which is what triggers the welcome screen).
 */
export async function saveProtocol(fields: {
  protocolId?: string;
  peptideName: string;
  goalCategory?: string;
  customGoal?: string;
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

  try {
    const data = {
      peptideName: fields.peptideName.trim(),
      goalCategory: fields.goalCategory || null,
      customGoal: fields.customGoal?.trim() || null,
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
    };

    if (fields.protocolId) {
      const existing = await prisma.peptideProtocol.findUnique({ where: { id: fields.protocolId } });
      if (!existing || existing.clientId !== client.id) return { error: "Protocol not found." };
      await prisma.peptideProtocol.update({ where: { id: fields.protocolId }, data });
      revalidatePath("/portal/daily-trackers/journey");
      return { success: true, isNewPeptide: false, protocolId: fields.protocolId };
    }

    const created = await prisma.peptideProtocol.create({ data: { ...data, clientId: client.id } });
    revalidatePath("/portal/daily-trackers/journey");
    return { success: true, isNewPeptide: true, protocolId: created.id };
  } catch (err) {
    console.error("[saveProtocol] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong saving your protocol." };
  }
}

/** Soft-delete — stops tracking this peptide but keeps its dose/history for the record. */
export async function stopTrackingProtocol(protocolId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const protocol = await prisma.peptideProtocol.findUnique({ where: { id: protocolId } });
  if (!protocol || protocol.clientId !== client.id) return { error: "Not found." };

  try {
    await prisma.peptideProtocol.update({ where: { id: protocolId }, data: { active: false } });
  } catch (err) {
    console.error("[stopTrackingProtocol] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath("/portal/daily-trackers/journey");
  return { success: true };
}

export async function toggleProtocolReminder(protocolId: string, enabled: boolean) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const protocol = await prisma.peptideProtocol.findUnique({ where: { id: protocolId } });
  if (!protocol || protocol.clientId !== client.id) return { error: "Not found." };

  try {
    await prisma.peptideProtocol.update({ where: { id: protocolId }, data: { reminderEnabled: enabled } });
  } catch (err) {
    console.error("[toggleProtocolReminder] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
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

  try {
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
  } catch (err) {
    console.error("[logPeptideDose] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong logging your dose." };
  }

  revalidatePath("/portal/daily-trackers/journey");
  revalidatePath("/portal/daily-trackers/insights");
  return { success: true };
}

export async function deletePeptideLog(logId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const log = await prisma.peptideLog.findUnique({ where: { id: logId } });
  if (!log || log.clientId !== client.id) return { error: "Not found." };

  try {
    await prisma.peptideLog.delete({ where: { id: logId } });
  } catch (err) {
    console.error("[deletePeptideLog] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath("/portal/daily-trackers/journey");
  return { success: true };
}
