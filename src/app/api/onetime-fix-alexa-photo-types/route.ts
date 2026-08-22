import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: fixes the mislabeled BACK photo in Alexa Olavarria's
// session 3 (was uploaded as FRONT by mistake).
export async function GET() {
  const photo = await prisma.photo.update({
    where: { id: "cmt3muql00003l704l7loc8j4" },
    data: { type: "BACK" },
  });
  return NextResponse.json({ success: true, photoId: photo.id, newType: photo.type });
}
