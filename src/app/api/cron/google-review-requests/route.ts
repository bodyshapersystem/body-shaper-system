import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGoogleReviewRequestEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

/**
 * Real hourly cron (see vercel.json) — finds every BlueprintAssessment
 * marked COMPLETED between 24 and 25 hours ago that hasn't had a
 * review request sent yet (reviewRequestSentAt is null — covers both
 * "never sent" and "Emmy already sent it manually", since the manual
 * button also sets this field), and sends the real Google review
 * request email. Protected by CRON_SECRET.
 *
 * The 24-25h window (not "completedAt < 24h ago") is deliberate: this
 * runs hourly, so without an upper bound every run would re-catch
 * every assessment completed more than a day ago that somehow never
 * got reviewRequestSentAt set, and resend indefinitely.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const assessments = await prisma.blueprintAssessment.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: windowStart, lt: windowEnd },
      reviewRequestSentAt: null,
      clientId: { not: null },
    },
    include: { client: true },
  });

  let sentCount = 0;
  for (const assessment of assessments) {
    if (!assessment.client) continue;
    const result = await sendGoogleReviewRequestEmail({
      clientId: assessment.client.id,
      firstName: assessment.client.firstName,
      email: assessment.client.email,
    }).catch(() => ({ success: false as const }));
    if (result.success) {
      sentCount += 1;
      await prisma.blueprintAssessment.update({ where: { id: assessment.id }, data: { reviewRequestSentAt: new Date() } });
    }
  }

  return NextResponse.json({ success: true, checked: assessments.length, sent: sentCount });
}
