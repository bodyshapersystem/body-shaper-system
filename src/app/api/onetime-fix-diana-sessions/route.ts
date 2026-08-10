import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: assigns explicit sessionNumber to Diana Escalante's 10
// photos so they group correctly (first 4 = session 1, next 2 =
// session 2 (incomplete, left as-is from before), today's 4 = session
// 3) instead of the automatic chunk-of-4 merging old leftovers with
// today's upload.
const SESSION_1 = ["cmrn0oxso0001l7042fd0w3ny", "cmrn0pkxl0003l70464fqg6ao", "cmrn0qabg0005l704hnftsb2b", "cmrn0qr7j0007l704algdm70r"];
const SESSION_2 = ["cmrn0rc5i0009l704ahtqnw1l", "cmrn0rviw000bl704xx3rpc6d"];
const SESSION_3 = ["cmsnkscvh0001l504xy6787lu", "cmsnksr880005l504m6c2d7mx", "cmsnkt15z0009l504bfqh8wl4", "cmsnkt9du000dl504swuzdujp"];

export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Diana Escalante not found" });

  await prisma.photo.updateMany({ where: { id: { in: SESSION_1 }, clientId: client.id }, data: { sessionNumber: 1 } });
  await prisma.photo.updateMany({ where: { id: { in: SESSION_2 }, clientId: client.id }, data: { sessionNumber: 2 } });
  await prisma.photo.updateMany({ where: { id: { in: SESSION_3 }, clientId: client.id }, data: { sessionNumber: 3 } });

  const check = await prisma.photo.findMany({
    where: { clientId: client.id },
    orderBy: { uploadedAt: "asc" },
    select: { id: true, type: true, sessionNumber: true, uploadedAt: true },
  });

  return NextResponse.json({ success: true, photos: check });
}
