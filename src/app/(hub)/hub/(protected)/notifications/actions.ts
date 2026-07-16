"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(id: string) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  revalidatePath("/hub/notifications");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };
  await prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/hub/notifications");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function getRecentNotifications(limit = 30) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { client: { select: { firstName: true, lastName: true } } },
  });
  return { success: true, notifications };
}
