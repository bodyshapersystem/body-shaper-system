import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSocietyWelcomeEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

/**
 * Real hourly cron — sends the "Welcome to The Body Shaper System
 * Society™" email on a real delay (3-4 hours after the client's
 * RewardsAccount was created, which happens at the same real moment
 * as conversion/the main Welcome email). Runs hourly (not daily, like
 * the session-reminders cron) since a daily cadence can't reliably
 * hit a 3-4 hour window. Protected by CRON_SECRET, same as the other
 * cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  // Real 3-4 hour window (averages to ~3.5h, per direction), wide
  // enough to safely catch every account exactly once even though
  // this cron only runs once per hour, not continuously.
  const accounts = await prisma.rewardsAccount.findMany({
    where: {
      societyWelcomeEmailSentAt: null,
      createdAt: { lte: threeHoursAgo, gte: fourHoursAgo },
    },
    include: { client: true },
  });

  let sentCount = 0;
  for (const account of accounts) {
    const result = await sendSocietyWelcomeEmail({
      clientId: account.clientId,
      firstName: account.client.firstName,
      email: account.client.email,
      portalUrl: "https://www.bodyshapersystem.com/portal/rewards",
    }).catch(() => ({ success: false as const }));

    if (result.success) {
      await prisma.rewardsAccount.update({ where: { id: account.id }, data: { societyWelcomeEmailSentAt: new Date() } });
      sentCount += 1;
    }
  }

  return NextResponse.json({ success: true, accountsChecked: accounts.length, emailsSent: sentCount });
}
