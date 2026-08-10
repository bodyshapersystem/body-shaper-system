import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: find Diana Escalante's client id and her active (or most
// recent) blueprint assessment id, so a measurement record can be
// attached correctly. Read-only.
export async function GET() {
  const clients = await prisma.client.findMany({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
    include: {
      blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, status: true, recommendedSystem: true, updatedAt: true } },
    },
  });

  return NextResponse.json({ success: true, clients });
}
