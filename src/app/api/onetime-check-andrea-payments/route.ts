import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
      select: { validatedSessionCount: true, planTotalCents: true, discountCents: true, recommendedSystem: true },
    });

    const payments = await prisma.payment.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { createdAt: "asc" },
      select: { amountCents: true, status: true, createdAt: true },
    });

    const totalPaidCents = payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").reduce((sum, p) => sum + p.amountCents, 0);

    const appointments = await prisma.appointment.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { startsAt: "asc" },
      select: { title: true, startsAt: true, status: true },
    });

    return NextResponse.json({ success: true, assessment, payments, totalPaidCents, appointments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
