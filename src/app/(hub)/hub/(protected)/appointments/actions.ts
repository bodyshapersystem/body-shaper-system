"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { sendAppointmentConfirmationEmail, sendSystemCompletedEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";

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
  const technologiesRaw = (formData.get("technologies") as string) || undefined;
  const estimatedMinutesRaw = formData.get("estimatedMinutes");
  const locationTypeRaw = String(formData.get("locationType") || "HOME");
  const locationType = locationTypeRaw === "STUDIO" ? "STUDIO" : "HOME";

  if (!clientId || !title || !startsAtRaw) {
    return { error: "Client, title, and start time are required." };
  }

  let technologies: string[] | undefined;
  if (technologiesRaw) {
    try {
      const parsed = JSON.parse(technologiesRaw);
      if (Array.isArray(parsed)) technologies = parsed;
    } catch {
      // ignore malformed technologies payload — appointment still saves
    }
  }

  const startsAt = new Date(startsAtRaw);
  const isBackdated = startsAt.getTime() < Date.now();

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      title,
      startsAt,
      endsAt: endsAtRaw ? new Date(endsAtRaw) : undefined,
      technologies,
      estimatedMinutes: estimatedMinutesRaw ? Number(estimatedMinutesRaw) : undefined,
      locationType,
      notes,
      createdById: user.id,
      // A backdated entry is, by definition, already done — and per
      // direction, entering historical sessions must never trigger
      // the client-facing confirmation email.
      status: isBackdated ? "COMPLETED" : undefined,
      skipAutomatedEmails: isBackdated,
    },
  });

  // Real confirmation email — never blocks/fails the scheduling
  // action itself if the send fails; the appointment is already saved.
  // Skipped entirely for backdated/historical entries.
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (client && !isBackdated) {
    const timezone = await getBusinessTimezone();
    await sendAppointmentConfirmationEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      sessionTitle: title,
      dateLabel: formatDateInTimezone(appointment.startsAt, timezone, { weekday: "long", month: "long", day: "numeric" }),
      timeLabel: formatTimeInTimezone(appointment.startsAt, timezone),
      systemName: client.blueprintAssessments[0]?.recommendedSystem ?? undefined,
      portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
    }).catch(() => undefined);
    await createNotification({
      clientId,
      category: "APPOINTMENTS",
      description: `Appointment confirmed for ${client.firstName} ${client.lastName} — ${title}`,
      linkUrl: `/hub/appointments`,
    });
  } else if (client && isBackdated) {
    // Still log it internally — Emmy should see it was added, just
    // without ever emailing the client about a session that already happened.
    await createNotification({
      clientId,
      category: "APPOINTMENTS",
      description: `Logged a past appointment for ${client.firstName} ${client.lastName} — ${title} (no email sent)`,
      linkUrl: `/hub/appointments`,
    });
  }

  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function updateAppointment(
  appointmentId: string,
  data: { startsAt?: string; endsAt?: string; status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"; notes?: string; locationType?: "HOME" | "STUDIO" }
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to edit appointments." };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      status: data.status,
      notes: data.notes,
      locationType: data.locationType,
    },
  });

  // Real "System Completed" trigger — fires once, the moment
  // completed sessions first reach the client's real total session
  // count (never re-fires on later completed appointments).
  if (data.status === "COMPLETED") {
    const client = await prisma.client.findUnique({
      where: { id: updated.clientId },
      include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } },
    });
    const assessment = client?.blueprintAssessments[0];
    const totalSessions = assessment?.validatedSessionCount ?? null;
    if (client && totalSessions !== null) {
      const completedCount = await prisma.appointment.count({ where: { clientId: client.id, status: "COMPLETED" } });
      if (completedCount === totalSessions) {
        await sendSystemCompletedEmail({
          clientId: client.id,
          firstName: client.firstName,
          email: client.email,
          systemName: assessment?.recommendedSystem ?? "Personalized System™",
          portalUrl: "https://www.bodyshapersystem.com/portal/dashboard",
        }).catch(() => undefined);
        await createNotification({
          clientId: client.id,
          category: "GENERAL",
          description: `${client.firstName} ${client.lastName} completed their ${assessment?.recommendedSystem ?? "Personalized System™"}`,
          linkUrl: `/hub/clients/${client.id}`,
        });
      }
    }
  }

  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  return updateAppointment(appointmentId, { status: "CANCELLED" });
}

/**
 * Read-only summary used by the scheduler UI to show the client's
 * session context (system, progress, specialist) after selecting
 * them — no scheduling logic, no writes. Session count and
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
    prisma.appointment.count({
      where: { clientId, OR: [{ status: "COMPLETED" }, { status: "SCHEDULED", startsAt: { lt: new Date() } }] },
    }),
  ]);

  if (!client) return null;

  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? null;
  const currentSession = totalSessions !== null ? Math.min(completedCount + 1, totalSessions) : completedCount + 1;
  const progressPercent = totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null;

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

/**
 * Real permanent delete for a test Appointment — separate from
 * cancelAppointment() (which just sets status=CANCELLED, a
 * reversible business action, not deletion). Removes the row
 * entirely so it stops showing up anywhere, for cleaning up test data.
 */
export async function deleteAppointmentPermanently(appointmentId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to delete appointments." };
  }
  await prisma.appointment.delete({ where: { id: appointmentId } });
  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}
