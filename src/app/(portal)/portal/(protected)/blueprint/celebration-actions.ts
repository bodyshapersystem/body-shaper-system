"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function markCompositionCelebrationSeen(measurementId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  await prisma.client.update({ where: { id: client.id }, data: { lastCelebratedMeasurementId: measurementId } });
  return { success: true };
}

export async function markMeasurementCelebrationSeen(bodyMeasurementId: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  await prisma.client.update({ where: { id: client.id }, data: { lastCelebratedBodyMeasurementId: bodyMeasurementId } });
  return { success: true };
}

export async function markPhotoCelebrationSeen(sessionNumber: number) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  await prisma.client.update({ where: { id: client.id }, data: { lastCelebratedPhotoSessionNumber: sessionNumber } });
  return { success: true };
}
