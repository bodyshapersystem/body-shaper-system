import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: "Elizabeth", mode: "insensitive" } },
          { lastName: { contains: "Tamayo", mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (clients.length === 0) {
      return NextResponse.json({ success: true, clients: [] });
    }

    const clientId = clients[0].id;
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      orderBy: { startsAt: "desc" },
      take: 10,
      select: { id: true, title: true, startsAt: true, status: true, rescheduleCount: true },
    });

    return NextResponse.json({ success: true, clients, appointments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
