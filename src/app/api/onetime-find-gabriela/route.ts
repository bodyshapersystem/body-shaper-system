import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const clients = await prisma.client.findMany({
    where: { firstName: { contains: "Gabriela", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1, select: { id: true } } },
  });
  return NextResponse.json({
    success: true,
    clients: clients.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, assessmentId: c.blueprintAssessments[0]?.id ?? null })),
  });
}
