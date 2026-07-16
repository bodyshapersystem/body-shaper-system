"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

const FORM_URLS: Record<string, string> = {
  POLICIES_APPOINTMENTS: "https://form.jotform.com/261860243106046",
  CONSENT_TREATMENT: "https://form.jotform.com/beautyboxmia/waiver---release-form",
};

/**
 * Real reminder — sends an actual message to the client via the same
 * MessageThread system used elsewhere (visible in their Portal), and
 * logs a real Notification so it shows in the Activity Feed too.
 */
export async function sendDocumentReminder(clientId: string, docTitle: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) return { error: "You don't have permission to do this." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  const thread = await prisma.messageThread.upsert({ where: { clientId }, create: { clientId }, update: {} });
  await prisma.message.create({
    data: { threadId: thread.id, senderType: "OWNER", body: `Just a friendly reminder to complete your "${docTitle}" — let us know if you need any help!` },
  });

  await createNotification({
    clientId,
    category: "DOCUMENTS",
    description: `Reminder sent to ${client.firstName} ${client.lastName} for ${docTitle}`,
    linkUrl: `/hub/clients/${clientId}?tab=messages`,
  });

  revalidatePath("/hub/documents");
  return { success: true };
}

/**
 * Real resend — re-sends the actual real form link (the same
 * Jotform forms already wired to real e-signature webhooks) via a
 * message to the client, so they can complete it again without
 * digging through old emails.
 */
export async function resendDocumentForm(clientId: string, category: string, docTitle: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) return { error: "You don't have permission to do this." };

  const formUrl = FORM_URLS[category];
  if (!formUrl) return { error: "This document doesn't have a resendable form link." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  const link = category === "CONSENT_TREATMENT" ? `${formUrl}?email=${encodeURIComponent(client.email)}` : formUrl;

  const thread = await prisma.messageThread.upsert({ where: { clientId }, create: { clientId }, update: {} });
  await prisma.message.create({
    data: { threadId: thread.id, senderType: "OWNER", body: `Here's your "${docTitle}" form again: ${link}` },
  });

  await createNotification({
    clientId,
    category: "DOCUMENTS",
    description: `${docTitle} form resent to ${client.firstName} ${client.lastName}`,
    linkUrl: `/hub/clients/${clientId}?tab=messages`,
  });

  revalidatePath("/hub/documents");
  return { success: true };
}

/**
 * Real, server-side signed-URL generation — same pattern used
 * everywhere else in the app (photos, uploaded documents). Never
 * do this from the browser Supabase client, which would bypass our
 * own permission check.
 */
export async function getRequiredDocumentSignedUrl(storagePath: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) return { error: "You don't have permission to do this." };

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage.from("client-documents").createSignedUrl(storagePath, 60 * 5);
  return { success: true, url: data?.signedUrl ?? null };
}
