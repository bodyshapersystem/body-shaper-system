import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone } from "@/lib/format-datetime";
import { sendDailyRecapEmail } from "@/lib/email/service";
import { formatTech } from "@/lib/tech-count";
import { zoneShort } from "@/lib/tech-zones";

export const dynamic = "force-dynamic";

/**
 * 8 pm (business time) owner recap of today's sessions. Scheduled at
 * 00:00 and 01:00 UTC (vercel.json) so it lands at 8 pm in both EDT and
 * EST; only the run where the local hour is 20 sends, once per day.
 * Skips days without sessions. Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tz = await getBusinessTimezone();
  const now = new Date();
  const force = request.nextUrl.searchParams.get("force") === "1";
  const localHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now));
  if (!force && localHour !== 20) return NextResponse.json({ ok: true, skipped: `local hour ${localHour}` });

  const key = now.toLocaleDateString("en-CA", { timeZone: tz });
  const already = await prisma.emailEvent.findFirst({ where: { template: "DAILY_RECAP", createdAt: { gte: new Date(now.getTime() - 20 * 3600000) } } });
  if (already && !force) return NextResponse.json({ ok: true, skipped: "already sent" });

  const appts = (
    await prisma.appointment.findMany({
      where: { startsAt: { gte: new Date(now.getTime() - 30 * 3600000), lte: new Date(now.getTime() + 6 * 3600000) }, status: { in: ["SCHEDULED", "COMPLETED", "NO_SHOW"] } },
      orderBy: { startsAt: "asc" },
      include: { client: { select: { firstName: true, lastName: true } } },
    })
  ).filter((a) => a.startsAt.toLocaleDateString("en-CA", { timeZone: tz }) === key);
  if (appts.length === 0) return NextResponse.json({ ok: true, skipped: "no sessions today" });

  const sessions = appts.map((a) => {
    const techs = Array.isArray(a.technologies) ? (a.technologies as { name?: string; number?: number; zone?: string }[]).filter((t) => t?.name) : [];
    return {
      time: a.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }),
      client: `${a.client.firstName} ${a.client.lastName}`,
      planned: techs.length
        ? techs.map((t) => `${formatTech({ name: String(t.name).replace(/[™®]/g, "").replace(/ Elite/i, ""), number: t.number })}${t.zone ? ` (${zoneShort(String(t.name), t.zone)})` : ""}`).join(" + ")
        : a.title,
      status: a.status,
    };
  });
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: tz });
  await sendDailyRecapEmail({ dateKey: key, dateLabel, sessions });
  return NextResponse.json({ ok: true, sent: sessions.length });
}
