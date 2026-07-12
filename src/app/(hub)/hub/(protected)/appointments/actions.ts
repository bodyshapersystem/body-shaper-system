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

/**
 * Read-only summary used by the redesigned scheduler UI to show the
 * client's session context (system, progress, specialist) after
 * selecting them — no scheduling logic, no writes. Session count and
 * phase/milestone are real where the data exists (completed
 * appointments, validated session target from the Blueprint
 * Assessment™); "Current Phase" and "Expected Milestone" are
 * placeholders until the Personalized System™ tracks phases
 * explicitly, exactly as scoped for this pass.
 */
export async function getClientSessionContext(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return null;

  const [client, completedCount] = await Promise.all([
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
  ]);

  if (!client) return null;

  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? 8;
  const currentSession = Math.min(completedCount + 1, totalSessions);
  const progressPercent = Math.round((completedCount / totalSessions) * 100);

  return {
    firstName: client.firstName,
    lastName: client.lastName,
    system: assessment?.recommendedSystem ?? null,
    currentSession,
    totalSessions,
    progressPercent,
    specialistName: user.fullName,
    durationMinutes: 75,
  };
}
