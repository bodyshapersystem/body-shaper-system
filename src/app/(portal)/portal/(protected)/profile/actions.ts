"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createSignedAvatarUploadUrl(fileName: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  const ext = fileName.split(".").pop() || "png";
  const path = `avatars/${client.userId}-${randomUUID()}.${ext}`;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not prepare upload." };
  return { path: data.path, token: data.token };
}

export async function updateOwnAvatar(storagePath: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  await prisma.user.update({ where: { id: client.userId }, data: { avatarStoragePath: storagePath } });
  revalidatePath("/portal/profile");
  return { success: true };
}

export async function updateOwnPortalProfile(formData: FormData) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };

  const phone = (formData.get("phone") as string) || null;
  await prisma.client.update({ where: { id: client.id }, data: { phone } });
  revalidatePath("/portal/profile");
  return { success: true };
}

export async function updatePortalNotificationPreferences(formData: FormData) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  await prisma.user.update({
    where: { id: client.userId },
    data: { emailNotifications: formData.get("emailNotifications") === "on" },
  });
  revalidatePath("/portal/profile");
  return { success: true };
}

/** Real password change via Supabase Auth — same mechanism used in the Owner Hub. */
export async function changeOwnPortalPassword(newPassword: string) {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: client.userId } });
  if (!user) return { error: "Account not found." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.authUserId, { password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
