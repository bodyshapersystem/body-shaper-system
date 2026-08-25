import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: "Gabriela", mode: "insensitive" } },
          { lastName: { contains: "Escalona", mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return NextResponse.json({ success: true, clients });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
