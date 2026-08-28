import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const updated = await prisma.businessSettings.update({
      where: { id: "default" },
      data: { fullPaymentDiscountCents: 12000 },
    });
    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
