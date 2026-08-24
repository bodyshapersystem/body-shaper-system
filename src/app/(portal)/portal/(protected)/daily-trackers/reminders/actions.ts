"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReminderCenterData() {
  const client = await getCurrentPortalClient();
  if (!client) return null;

  const preferences = await prisma.reminderPreference.findMany({ where: { clientId: client.id } });
  return {
    quietHoursStart: client.quietHoursStart,
    quietHoursEnd: client.quietHoursEnd,
    preferences: preferences.map((p) => ({
      category: p.category,
      enabled: p.enabled,
      emailEnabled: p.emailEnabled,
      reminderTimes: p.reminderTimes,
      relevantDays: p.relevantDays,
    })),
  };
}

export async function saveReminderPreference(fields: {
  category: string;
  enabled: boolean;
  emailEnabled: boolean;
  reminderTimes: string[];
  relevantDays: string[];
}) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  try {
    await prisma.reminderPreference.upsert({
      where: { clientId_category: { clientId: client.id, category: fields.category } },
      create: {
        clientId: client.id,
        category: fields.category,
        enabled: fields.enabled,
        emailEnabled: fields.emailEnabled,
        reminderTimes: fields.reminderTimes,
        relevantDays: fields.relevantDays,
      },
      update: {
        enabled: fields.enabled,
        emailEnabled: fields.emailEnabled,
        reminderTimes: fields.reminderTimes,
        relevantDays: fields.relevantDays,
      },
    });
  } catch (err) {
    console.error("[saveReminderPreference] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath("/portal/daily-trackers/reminders");
  return { success: true };
}

export async function saveQuietHours(quietHoursStart: string | null, quietHoursEnd: string | null) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  try {
    await prisma.client.update({ where: { id: client.id }, data: { quietHoursStart, quietHoursEnd } });
  } catch (err) {
    console.error("[saveQuietHours] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath("/portal/daily-trackers/reminders");
  return { success: true };
}
