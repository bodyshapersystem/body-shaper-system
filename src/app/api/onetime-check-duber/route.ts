import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/onboarding";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { contains: "Duber", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "not found" });

  const documents = await prisma.document.findMany({
    where: { clientId: client.id },
    select: { id: true, category: true, title: true, uploadedAt: true },
  });

  const status = await getOnboardingStatus(client.id);

  return NextResponse.json({
    success: true,
    clientId: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    clientType: client.clientType,
    requiresContentRelease: client.requiresContentRelease,
    documents,
    onboardingStatus: status,
  });
}
