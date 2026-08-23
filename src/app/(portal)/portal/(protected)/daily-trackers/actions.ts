"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

function todayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Real, real-time upsert for today's tracker row — every card on the
 * page calls this with just the fields it owns, so cards can save
 * independently without clobbering each other.
 */
export async function updateTodayTracker(fields: Partial<{
  waterGlasses: number;
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepQuality: string;
  compressionWorn: boolean;
  compressionHours: number;
  moodCheckIn: string;
  moodNote: string;
  symptoms: string[];
  dailyNote: string;
  weightLbs: number;
}>) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const date = todayUtc();
  await prisma.dailyTracker.upsert({
    where: { clientId_date: { clientId: client.id, date } },
    create: { clientId: client.id, date, ...fields },
    update: fields,
  });

  revalidatePath("/portal/daily-trackers");
  return { success: true };
}

export async function requestNextSession(note: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const thread = await prisma.messageThread.upsert({ where: { clientId: client.id }, create: { clientId: client.id }, update: {} });
  await prisma.message.create({
    data: { threadId: thread.id, senderType: "CLIENT", body: `I'd like to book my next session.${note ? ` ${note}` : ""}` },
  });

  await createNotification({
    clientId: client.id,
    category: "APPOINTMENTS",
    description: `${client.firstName} ${client.lastName} requested a new appointment`,
    linkUrl: `/hub/clients/${client.id}?tab=messages`,
  });

  revalidatePath("/portal/messages");
  return { success: true };
}

/**
 * Peptide Calendar™ — the client logs which peptide they administered,
 * and when (real date + time, not just "today"), so there's an actual
 * record to look back on. This also feeds the Blueprint Score's
 * Tracking Engagement component (see src/lib/blueprint-score.ts).
 */
export async function logPeptideDose(fields: {
  peptideName: string;
  administeredAt: string; // ISO datetime from the client's local date+time inputs
  dosage?: string;
  notes?: string;
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
      notes: fields.notes?.trim() || null,
    },
  });

  revalidatePath("/portal/daily-trackers");
  return { success: true };
}

export async function deletePeptideLog(logId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const log = await prisma.peptideLog.findUnique({ where: { id: logId } });
  if (!log || log.clientId !== client.id) return { error: "Not found." };

  await prisma.peptideLog.delete({ where: { id: logId } });
  revalidatePath("/portal/daily-trackers");
  return { success: true };
}
