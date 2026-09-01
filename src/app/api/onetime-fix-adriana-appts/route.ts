import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session1 = await prisma.appointment.findUnique({ where: { id: "cmtdd18wo0001l404phbw7ohj" } });
    const session2 = await prisma.appointment.findUnique({ where: { id: "cmthxaban0001jx04h3vbz4er" } });
    if (!session1 || !session2) return NextResponse.json({ success: false, error: "One or both appointments not found." }, { status: 404 });

    const updated1 = await prisma.appointment.update({
      where: { id: "cmtdd18wo0001l404phbw7ohj" },
      data: {
        technologies: [{ name: "Exilis Elite™", minutes: 50 }],
        estimatedMinutes: 50,
      },
    });

    const updated2 = await prisma.appointment.update({
      where: { id: "cmthxaban0001jx04h3vbz4er" },
      data: {
        technologies: [{ name: "Exilis Elite™", minutes: 50 }, { name: "EMS™", minutes: 30 }],
        estimatedMinutes: 80,
      },
    });

    return NextResponse.json({ success: true, updated1, updated2 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
