import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: "Andrea", mode: "insensitive" } },
          { lastName: { contains: "Trujillo", mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (clients.length === 0) {
      return NextResponse.json({ success: true, clients: [], message: "No client found" });
    }

    const clientId = clients[0].id;

    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      orderBy: { startsAt: "asc" },
      select: { id: true, title: true, startsAt: true, status: true, technologies: true, sessionNumber: true, createdAt: true },
    });

    const photos = await prisma.photo.findMany({
      where: { clientId },
      orderBy: { uploadedAt: "asc" },
      select: { id: true, type: true, uploadedAt: true, sessionNumber: true },
    });

    const bodyMeasurements = await prisma.bodyMeasurement.findMany({
      where: { clientId },
      orderBy: { measuredAt: "asc" },
      select: { id: true, measuredAt: true, sessionNumber: true },
    });

    return NextResponse.json({ success: true, clients, appointments, photos, bodyMeasurements });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
