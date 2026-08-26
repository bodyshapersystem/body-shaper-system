import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: { firstName: { contains: "Adriana", mode: "insensitive" }, lastName: { contains: "Rojas", mode: "insensitive" } },
    });
    const clients = await prisma.client.findMany({
      where: { firstName: { contains: "Adriana", mode: "insensitive" }, lastName: { contains: "Rojas", mode: "insensitive" } },
      include: {
        blueprintAssessments: { orderBy: { version: "desc" }, include: { specialistObservations: true, strategyChanges: true } },
      },
    });

    let emails: unknown[] = [];
    if (clients.length > 0) {
      emails = await prisma.emailEvent.findMany({
        where: { clientId: clients[0].id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return NextResponse.json({ success: true, leads, clients, emails });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
