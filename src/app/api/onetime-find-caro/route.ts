import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: find "Caro"/"Carolina" Cordero's client id + active assessment.
export async function GET() {
  const clients = await prisma.client.findMany({
    where: {
      lastName: { equals: "Cordero", mode: "insensitive" },
    },
    include: {
      blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1, select: { id: true, status: true } },
    },
  });
  return NextResponse.json({ success: true, clients: clients.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, assessmentId: c.blueprintAssessments[0]?.id ?? null })) });
}
