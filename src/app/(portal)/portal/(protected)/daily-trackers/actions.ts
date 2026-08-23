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
