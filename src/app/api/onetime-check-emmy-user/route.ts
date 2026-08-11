import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Emmy", mode: "insensitive" }, lastName: { equals: "Branger", mode: "insensitive" } },
    include: { portalInvite: true },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const user = await prisma.user.findUnique({
    where: { id: client.userId },
    include: { role: true },
  });

  return NextResponse.json({ success: true, client, user });
}
