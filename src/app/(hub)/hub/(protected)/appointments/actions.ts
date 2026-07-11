"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createAppointment(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to schedule appointments." };
  }

  const clientId = String(formData.get("clientId") || "");
  const title = String(formData.get("title") || "").trim();
  const startsAtRaw = String(formData.get("startsAt") || "");
  const endsAtRaw = String(formData.get("endsAt") || "");
  const notes = (formData.get("notes") as string) || undefined;

  if (!clientId || !title || !startsAtRaw) {
    return { error: "Client, title, and start time are required." };
  }

  await prisma.appointment.create({
    data: {
      clientId,
      title,
      startsAt: new Date(startsAtRaw),
      endsAt: endsAtRaw ? new Date(endsAtRaw) : undefined,
      notes,
      createdById: user.id,
    },
  });

  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function updateAppointment(
  appointmentId: string,
  data: { startsAt?: string; endsAt?: string; status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"; notes?: string }
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to edit appointments." };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      status: data.status,
      notes: data.notes,
    },
  });

  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  return updateAppointment(appointmentId, { status: "CANCELLED" });
}
