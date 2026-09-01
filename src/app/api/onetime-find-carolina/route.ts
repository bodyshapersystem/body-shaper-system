import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: "Carolina", mode: "insensitive" } },
          { lastName: { contains: "Cordero", mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    let photos: unknown[] = [];
    if (clients.length === 1) {
      photos = await prisma.photo.findMany({
        where: { clientId: clients[0].id },
        orderBy: { uploadedAt: "desc" },
        take: 10,
      });
    }

    return NextResponse.json({ success: true, clients, photos });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
