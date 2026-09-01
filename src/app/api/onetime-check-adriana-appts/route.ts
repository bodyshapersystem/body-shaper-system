import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await prisma.client.findFirst({
      where: { firstName: { contains: "Adriana", mode: "insensitive" }, lastName: { contains: "Rojas", mode: "insensitive" } },
    });
    if (!client) return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { clientId: client.id },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({ success: true, clientId: client.id, appointments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
