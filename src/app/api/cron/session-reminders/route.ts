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

  // Real automation: auto-mark past SCHEDULED appointments as
  // COMPLETED. Program Completion / Next Milestone already treat
  // past-scheduled appointments as done at display time (no delay),
  // but this keeps the actual Appointment.status field itself
  // accurate too, so the real Appointments list reflects reality
  // without the Owner needing to manually flip every session.
  const pastScheduled = await prisma.appointment.updateMany({
    where: { status: "SCHEDULED", startsAt: { lt: new Date() } },
    data: { status: "COMPLETED" },
  });

  // Real automation: Birthday -> +100 Body Credits™ (fires once per
  // year — guarded by checking no "Birthday" transaction already
  // exists in the last 300 days, since month/day repeats every year).
  const today = new Date();
  const clientsWithBirthday = await prisma.client.findMany({
    where: { birthday: { not: null }, archivedAt: null },
    include: { rewardsAccount: true },
  });
  let birthdaysAwarded = 0;
  for (const c of clientsWithBirthday) {
    if (!c.birthday || !c.rewardsAccount) continue;
    if (c.birthday.getUTCMonth() !== today.getUTCMonth() || c.birthday.getUTCDate() !== today.getUTCDate()) continue;

    const recentBirthdayBonus = await prisma.rewardsTransaction.findFirst({
      where: { rewardsAccountId: c.rewardsAccount.id, action: "Birthday Bonus", createdAt: { gte: new Date(Date.now() - 300 * 86400000) } },
    });
    if (recentBirthdayBonus) continue;

    const { computeTier } = await import("@/lib/rewards");
    const newLifetime = c.rewardsAccount.lifetimePoints + 100;
    await prisma.$transaction([
      prisma.rewardsAccount.update({
        where: { id: c.rewardsAccount.id },
        data: { pointsBalance: { increment: 100 }, lifetimePoints: newLifetime, tier: computeTier(newLifetime) },
      }),
      prisma.rewardsTransaction.create({ data: { rewardsAccountId: c.rewardsAccount.id, points: 100, action: "Birthday Bonus" } }),
    ]);
    birthdaysAwarded += 1;
  }

  return NextResponse.json({ success: true, appointmentsFound: appointments.length, remindersSent: sentCount, birthdaysAwarded, autoCompletedAppointments: pastScheduled.count });
}
