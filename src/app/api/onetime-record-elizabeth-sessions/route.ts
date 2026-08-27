import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmt5vrhsu000fic04ubv2rnmn";

export async function GET() {
  try {
    const mondaySession = await prisma.appointment.create({
      data: {
        clientId: CLIENT_ID,
        title: "Endospheres Session (Complimentary)",
        startsAt: new Date("2026-08-24T14:00:00.000Z"),
        endsAt: new Date("2026-08-24T15:00:00.000Z"),
        status: "COMPLETED",
        technologies: [{ name: "Endospheres", minutes: 45, notes: "Complimentary session — not counted against her purchased 6-session Exilis package." }],
        notes: "Complimentary session. RENPHO scan + body measurements from this same day are recorded as her baseline.",
        skipAutomatedEmails: true,
      },
    });

    const todaySession = await prisma.appointment.create({
      data: {
        clientId: CLIENT_ID,
        title: "Exilis Session 1 of 6",
        startsAt: new Date("2026-08-27T18:00:00.000Z"),
        endsAt: new Date("2026-08-27T19:00:00.000Z"),
        status: "COMPLETED",
        technologies: [{ name: "Exilis", minutes: 45, notes: "Session 1 of 6 purchased." }],
        notes: "First of 6 purchased Exilis sessions. 5 sessions remain.",
        skipAutomatedEmails: true,
      },
    });

    return NextResponse.json({ success: true, mondaySession, todaySession });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
