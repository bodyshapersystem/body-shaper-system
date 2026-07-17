import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSessionReminderEmail } from "@/lib/email/service";
import { getBusinessTimezone, formatTimeInTimezone } from "@/lib/format-datetime";

export const dynamic = "force-dynamic";

/**
 * Real daily cron (see vercel.json) — finds every real SCHEDULED
 * appointment happening tomorrow and sends a real reminder email.
 * Protected by CRON_SECRET so this can't be triggered by anyone
 * else hitting the URL.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timezone = await getBusinessTimezone();
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: { status: "SCHEDULED", startsAt: { gte: tomorrowStart, lt: tomorrowEnd } },
    include: { client: true },
  });

  let sentCount = 0;
  for (const appt of appointments) {
    const locationLabel = appt.locationType === "HOME" ? `At Your Home${appt.client.city ? ` (${appt.client.city})` : ""}` : "Studio Location";
    const result = await sendSessionReminderEmail({
      clientId: appt.clientId,
      firstName: appt.client.firstName,
      email: appt.client.email,
      sessionTitle: appt.title,
      timeLabel: formatTimeInTimezone(appt.startsAt, timezone),
      locationLabel,
      portalUrl: "https://www.bodyshapersystem.com/portal/appointments",
    }).catch(() => ({ success: false as const }));
    if (result.success) sentCount += 1;
  }

  return NextResponse.json({ success: true, appointmentsFound: appointments.length, remindersSent: sentCount });
}
