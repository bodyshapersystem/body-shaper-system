"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { computeBlueprintAlignment, type Technology } from "@/lib/session-objectives";
import { revalidatePath } from "next/cache";

function splitGoals(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Real Session logging — saves a permanent Appointment record (the
 * client's existing session-history architecture) with the real
 * technology, real treated areas, real auto-generated objectives
 * (session-objectives.ts — never invented), and a real Blueprint
 * Alignment snapshot computed against the client's actual Blueprint
 * goals at this moment. Frozen at save time: later Blueprint changes
 * never retroactively alter a past session's recorded alignment.
 */
export async function logSession(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "appointments.manage")) {
    return { error: "You don't have permission to log a session." };
  }

  const technology = formData.get("technology") as Technology;
  const areas = formData.getAll("areas") as string[];
  const objectives = formData.getAll("objectives") as string[];
  const specialistNotes = (formData.get("specialistNotes") as string) || null;
  const sessionDateRaw = formData.get("sessionDate") as string;

  if (!technology || areas.length === 0) {
    return { error: "Select a technology and at least one treated area." };
  }

  const [client, assessment] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.blueprintAssessment.findFirst({ where: { clientId }, orderBy: { version: "desc" } }),
  ]);
  if (!client) return { error: "Client not found." };

  const blueprintGoals = [...splitGoals(assessment?.goals), ...splitGoals(assessment?.treatmentInterests)];
  const alignment = computeBlueprintAlignment(blueprintGoals, areas, objectives);

  const startsAt = sessionDateRaw ? new Date(sessionDateRaw) : new Date();

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      title: `${technology} Session`,
      startsAt,
      status: "COMPLETED",
      technologies: [{ name: technology, areas, objectives }],
      notes: specialistNotes,
      blueprintAlignment: alignment,
      createdById: user.id,
      skipAutomatedEmails: true,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  revalidatePath(`/hub/clients/${clientId}/progress-photos`);
  return { success: true, appointmentId: appointment.id, alignment };
}

/**
 * Real Session History for the client — every logged session with
 * its real technology, areas, objectives, and Blueprint Alignment
 * snapshot, most recent first.
 */
export async function getSessionHistory(clientId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId, technologies: { not: null } },
    orderBy: { startsAt: "desc" },
  });

  return appointments.map((a) => ({
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    status: a.status,
    technologies: a.technologies as { name: string; areas?: string[]; objectives?: string[] }[] | null,
    blueprintAlignment: a.blueprintAlignment as { matched: string[]; unmatched: string[] } | null,
    notes: a.notes,
  }));
}
