import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { email: { contains: "emmy", mode: "insensitive" } },
    include: { role: true },
  });
  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { firstName: { equals: "Emmy", mode: "insensitive" } },
        { email: { contains: "emmy", mode: "insensitive" } },
      ],
    },
  });
  return NextResponse.json({ success: true, users, clients });
}
