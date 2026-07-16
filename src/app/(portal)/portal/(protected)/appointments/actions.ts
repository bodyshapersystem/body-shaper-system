"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Real reschedule REQUEST — per direction, clients never edit
 * appointments directly, only request a change. Sends a real message
 * to the specialist via the same MessageThread system already used
 * for "Message Your Specialist", so it shows up as a real, visible
 * request rather than silently changing anything.
 */
export async function requestReschedule(appointmentId: string, note: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, clientId: client.id } });
  if (!appointment) return { error: "Appointment not found." };

  const dateLabel = appointment.startsAt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeLabel = appointment.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const thread = await prisma.messageThread.upsert({
    where: { clientId: client.id },
    create: { clientId: client.id },
    update: {},
  });

  const body = `I'd like to request a reschedule for my ${appointment.title} appointment on ${dateLabel} at ${timeLabel}.${note ? ` ${note}` : ""}`;

  await prisma.message.create({
    data: { threadId: thread.id, senderType: "CLIENT", body },
  });

  revalidatePath("/portal/messages");
  return { success: true };
}
