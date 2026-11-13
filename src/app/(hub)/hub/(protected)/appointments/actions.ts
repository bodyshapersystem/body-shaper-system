"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { CLIENT_CANCELLATION_WHERE } from "@/lib/cancellations";
import { sendRescheduleLimitCancellationEmail, sendAppointmentConfirmationEmail, sendSystemCompletedEmail, sendMidpointDataReadyEmail, sendMidpointDataMissingEmail } from "@/lib/email/service";
import { createNotification } from "@/lib/notifications";
import { getNextSessionNumber } from "@/lib/session-number";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { isMidpointEligible, getOrCreateMidpointReview } from "@/lib/midpoint";
import { suggestNextTechNumbers } from "@/lib/tech-count";

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

  let technologies: { name: string; minutes: number; number?: number; bodyArea?: string; intensity?: string; notes?: string }[] | undefined;
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
      technologyNames: technologies?.map((t) => t.name),
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

/**
 * Reschedule from the Hub. Never cancels or forfeits anything on its own: the original row is
 * kept as CANCELLED with cancelReason RESCHEDULED (never counted as a client cancellation) and a
 * new appointment is created at the new time. Only when the owner marks the change as requested
 * by the client does the session's client reschedule count go up. Reaching the limit only shows
 * a warning — the owner decides whether to send the reschedule-limit notice
 * (cancelForRescheduleLimit).
 */
export async function rescheduleAppointment(appointmentId: string, newStartsAt: string, requestedBy: "client" | "business" = "business") {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to edit appointments." };
  }

  const original = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!original) return { error: "Appointment not found." };
  const newStart = new Date(newStartsAt);
  if (isNaN(newStart.getTime())) return { error: "Choose a valid date and time." };

  const durationMs = original.endsAt ? original.endsAt.getTime() - original.startsAt.getTime() : null;
  const newEnd = durationMs !== null ? new Date(newStart.getTime() + durationMs) : null;
  const tag = `[Rescheduled to ${newStart.toISOString()}${requestedBy === "business" ? " — changed by Body Shaper" : " — requested by client"}]`;

  const [, created] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED", cancelReason: "RESCHEDULED", sessionForfeited: false, notes: original.notes ? `${original.notes}\n${tag}` : tag },
    }),
    prisma.appointment.create({
      data: {
        clientId: original.clientId,
        title: original.title,
        startsAt: newStart,
        endsAt: newEnd,
        status: "SCHEDULED",
        locationType: original.locationType,
        technologies: original.technologies ?? undefined,
        estimatedMinutes: original.estimatedMinutes,
        rescheduleCount: original.rescheduleCount + (requestedBy === "client" ? 1 : 0),
        createdById: user.id,
      },
    }),
  ]);

  revalidatePath(`/hub/clients/${original.clientId}`);
  revalidatePath("/hub/appointments");
  return { success: true, newAppointmentId: created.id, clientReschedules: created.rescheduleCount };
}

/**
 * Owner-triggered (never automatic): cancel this session because the client reached the
 * reschedule limit, mark it as used, and send the client the system notice by email plus a
 * portal message-style notification.
 */
export async function cancelForRescheduleLimit(appointmentId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to edit appointments." };
  }
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { client: true } });
  if (!appt) return { error: "Appointment not found." };
  if (appt.status !== "SCHEDULED") return { error: "Only scheduled appointments can be cancelled." };
  const attempts = Math.max(appt.rescheduleCount + 1, 3);
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelReason: "RESCHEDULE_LIMIT", sessionForfeited: true, notes: appt.notes ? `${appt.notes}\n[Cancelled — reschedule limit notice sent]` : "[Cancelled — reschedule limit notice sent]" },
  });
  await sendRescheduleLimitCancellationEmail({ clientId: appt.clientId, firstName: appt.client.firstName, email: appt.client.email, title: appt.title, startsAt: appt.startsAt, attempts }).catch((e) => console.error("reschedule-limit email", e));
  revalidatePath(`/hub/clients/${appt.clientId}`);
  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

export async function updateAppointment(
  appointmentId: string,
  data: { startsAt?: string; endsAt?: string; status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"; notes?: string; locationType?: "HOME" | "STUDIO"; sessionForfeited?: boolean }
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
      sessionForfeited: data.sessionForfeited,
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
      const realCompletedCount = await prisma.appointment.count({ where: { clientId: client.id, status: "COMPLETED" } });
      const completedCount = realCompletedCount + (assessment?.priorCompletedSessions ?? 0);
      if (completedCount === totalSessions) {
        await sendSystemCompletedEmail({
          clientId: client.id,
          firstName: client.firstName,
          email: client.email,
          systemName: assessment?.recommendedSystem ?? "Personalized System™",
          portalUrl: "https://www.bodyshapersystem.com/portal/blueprint",
        }).catch(() => undefined);
        await createNotification({
          clientId: client.id,
          category: "GENERAL",
          description: `${client.firstName} ${client.lastName} completed their ${assessment?.recommendedSystem ?? "Personalized System™"}`,
          linkUrl: `/hub/clients/${client.id}`,
        });
      }

      // Real Midpoint Data™ trigger — fires once, the first time
      // completed sessions cross 50% of the validated total. Never
      // hardcoded to a specific session number, and never re-fires
      // (getOrCreateMidpointReview returns the existing row if one's
      // already on file for this assessment).
      if (assessment && isMidpointEligible(completedCount, totalSessions)) {
        const alreadyExists = await prisma.midpointReview.findFirst({ where: { assessmentId: assessment.id } });
        if (!alreadyExists) {
          const review = await getOrCreateMidpointReview(client.id, assessment.id);
          const systemName = assessment.recommendedSystem ?? "Personalized System™";
          if (review.hasSufficientData) {
            await sendMidpointDataReadyEmail({ clientId: client.id, firstName: client.firstName, email: client.email, systemName }).catch(() => undefined);
            await prisma.midpointReview.update({ where: { id: review.id }, data: { dataReadyEmailSent: true } });
          } else {
            await sendMidpointDataMissingEmail({ clientId: client.id, firstName: client.firstName, email: client.email, systemName }).catch(() => undefined);
            await prisma.midpointReview.update({ where: { id: review.id }, data: { dataMissingEmailSent: true } });
          }
          await createNotification({
            clientId: client.id,
            category: "GENERAL",
            description: `${client.firstName} ${client.lastName} reached their Midpoint — ${review.hasSufficientData ? "data ready for review" : "awaiting updated Blueprint"}`,
            linkUrl: `/hub/clients/${client.id}`,
          });
        }
      }
    }
  }

  revalidatePath("/hub/appointments");
  revalidatePath("/hub/dashboard");
  return { success: true };
}

/**
 * Cancellation from the Hub. "business" = changed by Body Shaper: never counts against the
 * client and never consumes a session. "client" = the client cancelled: her first real client
 * cancellation is forgiven, later ones consume the session. Reschedules and business
 * cancellations are never counted as prior client cancellations.
 */
export async function cancelAppointment(appointmentId: string, cancelledBy: "client" | "business" = "client") {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId }, select: { clientId: true } });
  if (!appointment) return { error: "Appointment not found." };
  const res = await updateAppointment(appointmentId, { status: "CANCELLED", sessionForfeited: false });
  if ("error" in res) return res;
  if (cancelledBy === "business") {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { cancelReason: "BUSINESS" } });
    return res;
  }
  const priorClientCancellations = await prisma.appointment.count({
    where: { clientId: appointment.clientId, id: { not: appointmentId }, ...CLIENT_CANCELLATION_WHERE },
  });
  await prisma.appointment.update({ where: { id: appointmentId }, data: { cancelReason: "CLIENT", sessionForfeited: priorClientCancellations >= 1 } });
  return res;
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
  const smartNextSession = await getNextSessionNumber(clientId);
  const currentSession = totalSessions !== null ? Math.min(smartNextSession, totalSessions) : smartNextSession;
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
 * Real appointment history for a specific client — every past
 * appointment actually on file (completed or scheduled-and-past),
 * used to mark days on a real calendar and list what was actually
 * done, so the specialist can see this client's real visit pattern
 * while scheduling the next one.
 */
export async function getClientAppointmentHistory(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return [];

  const appointments = await prisma.appointment.findMany({
    where: {
      clientId,
      OR: [{ status: "COMPLETED" }, { status: "SCHEDULED", startsAt: { lt: new Date() } }],
    },
    orderBy: { startsAt: "desc" },
  });

  return appointments.map((a) => ({
    id: a.id,
    title: a.title,
    startsAt: a.startsAt.toISOString(),
    status: a.status,
    technologies: a.technologies as { name: string; minutes: number; number?: number; bodyArea?: string }[] | null,
  }));
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

/**
 * Suggested next per-technology count for a client ("Exilis #4"),
 * based on their most recent numbered, non-cancelled appointment for
 * each technology. Only a suggestion — the scheduler lets the
 * specialist type any number (e.g. 1 when a new package starts).
 */
export async function getClientTechNumberSuggestions(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return {};
  const appointments = await prisma.appointment.findMany({
    where: { clientId, status: { not: "CANCELLED" } },
    select: { startsAt: true, technologies: true },
  });
  return suggestNextTechNumbers(appointments);
}

/**
 * Edit only the per-technology counts on an existing appointment.
 * `numbers` is keyed by the technology's exact stored name; an empty
 * value clears that technology's count.
 */
export async function updateAppointmentTechNumbers(appointmentId: string, numbers: Record<string, number | null>) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to edit appointments." };
  }
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId }, select: { technologies: true, clientId: true } });
  if (!appt || !Array.isArray(appt.technologies)) return { error: "This appointment has no technologies to number." };

  const technologies = (appt.technologies as Record<string, unknown>[]).map((t) => {
    const name = String(t.name ?? "");
    if (!(name in numbers)) return t;
    const n = numbers[name];
    const { number: _old, ...rest } = t;
    return n && n > 0 ? { ...rest, number: Math.floor(n) } : rest;
  });

  await prisma.appointment.update({ where: { id: appointmentId }, data: { technologies: technologies as Prisma.InputJsonValue } });
  revalidatePath("/hub/appointments");
  revalidatePath(`/hub/clients/${appt.clientId}`);
  return { success: true };
}
