"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function replyAsClient(formData: FormData) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Message can't be empty." };

  const thread = await prisma.messageThread.upsert({
    where: { clientId: client.id },
    create: { clientId: client.id },
    update: {},
  });

  await prisma.message.create({
    data: { threadId: thread.id, senderType: "CLIENT", body },
  });

  revalidatePath("/portal/messages");
  return { success: true };
}
