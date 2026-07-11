"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Records one manual measurement scan. Never updates a prior row —
 * every scan is a new, permanent historical record (RENPHO-ready:
 * once real device sync exists, it writes rows the same way).
 */
export async function addMeasurement(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "measurements.manage")) {
    return { error: "You don't have permission to record measurements." };
  }

  const scanDateRaw = formData.get("scanDate");
  const scanDate = scanDateRaw ? new Date(String(scanDateRaw)) : new Date();

  await prisma.measurement.create({
    data: {
      clientId,
      scanDate,
      weightKg: num(formData, "weightKg"),
      bodyFatPercent: num(formData, "bodyFatPercent"),
      muscleMassKg: num(formData, "muscleMassKg"),
      bodyWaterPercent: num(formData, "bodyWaterPercent"),
      bmi: num(formData, "bmi"),
      visceralFat: num(formData, "visceralFat"),
      boneMassKg: num(formData, "boneMassKg"),
      bmr: num(formData, "bmr"),
      bodyAge: num(formData, "bodyAge"),
      deviceSource: String(formData.get("deviceSource") || "RENPHO Health"),
      notes: (formData.get("notes") as string) || undefined,
      createdById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Adds a new Body Blueprint version. Never overwrites a prior
 * version — version history is permanent.
 */
export async function addBodyBlueprintVersion(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to edit Body Blueprints." };
  }

  const latest = await prisma.bodyBlueprint.findFirst({
    where: { clientId },
    orderBy: { version: "desc" },
  });

  await prisma.bodyBlueprint.create({
    data: {
      clientId,
      version: (latest?.version ?? 0) + 1,
      goals: (formData.get("goals") as string) || undefined,
      treatmentInterests: (formData.get("treatmentInterests") as string) || undefined,
      recommendedSystem: (formData.get("recommendedSystem") as string) || undefined,
      internalNotes: (formData.get("internalNotes") as string) || undefined,
      createdById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

export async function sendOwnerMessage(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "messages.manage")) {
    return { error: "You don't have permission to send messages." };
  }

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Message can't be empty." };

  const thread = await prisma.messageThread.upsert({
    where: { clientId },
    create: { clientId },
    update: {},
  });

  await prisma.message.create({
    data: { threadId: thread.id, senderType: "OWNER", senderUserId: user.id, body },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

export async function markMessagesRead(clientId: string) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };

  const thread = await prisma.messageThread.findUnique({ where: { clientId } });
  if (!thread) return { success: true };

  await prisma.message.updateMany({
    where: { threadId: thread.id, senderType: "CLIENT", readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}

/**
 * Uploads a document to Supabase Storage (bucket: "client-documents")
 * and records its metadata. Uses the admin client since this is a
 * privileged Hub-only write, gated by the permission check above.
 */
export async function uploadClientDocument(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) {
    return { error: "You don't have permission to upload documents." };
  }

  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") || file?.name || "Document");
  if (!file || file.size === 0) return { error: "Choose a file to upload." };

  const admin = createSupabaseAdminClient();
  const path = `${clientId}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("client-documents")
    .upload(path, Buffer.from(arrayBuffer), { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  await prisma.document.create({
    data: {
      clientId,
      title,
      storagePath: path,
      fileType: file.type || undefined,
      sizeBytes: file.size,
      uploadedById: user.id,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
