"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function updateBusinessSettings(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) {
    return { error: "You don't have permission to edit business settings." };
  }

  const discountRaw = formData.get("fullPaymentDiscount");
  const fullPaymentDiscountCents =
    discountRaw && String(discountRaw).trim() !== "" ? Math.round(Number(discountRaw) * 100) : null;

  const data = {
    businessName: String(formData.get("businessName") || "Body Shaper System™"),
    contactEmail: (formData.get("contactEmail") as string) || undefined,
    contactPhone: (formData.get("contactPhone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    timezone: (formData.get("timezone") as string) || undefined,
    fullPaymentDiscountCents,
  };

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  revalidatePath("/hub/settings");
  revalidatePath("/hub/payments");
  return { success: true };
}

export async function updatePreferences(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) {
    return { error: "You don't have permission to edit preferences." };
  }

  const data = {
    language: String(formData.get("language") || "English"),
    measurementUnits: String(formData.get("measurementUnits") || "Imperial"),
    currency: String(formData.get("currency") || "USD"),
    dateFormat: String(formData.get("dateFormat") || "MM/DD/YYYY"),
    weekStartsOn: String(formData.get("weekStartsOn") || "Monday"),
  };

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  revalidatePath("/hub/settings");
  return { success: true };
}

export async function updateBusinessLogo(storagePath: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) {
    return { error: "You don't have permission to change the logo." };
  }
  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: { id: "default", logoStoragePath: storagePath },
    update: { logoStoragePath: storagePath },
  });
  revalidatePath("/hub/settings");
  return { success: true };
}

export async function createSignedLogoUploadUrl(fileName: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) {
    return { error: "You don't have permission to change the logo." };
  }
  const ext = fileName.split(".").pop() || "png";
  const path = `logo/${randomUUID()}.${ext}`;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not prepare upload." };
  return { path: data.path, token: data.token };
}

export async function getBusinessLogoUrl(storagePath: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(storagePath, 60 * 60);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function updateOwnProfile(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) return { error: "Name can't be empty." };
  const phone = (formData.get("phone") as string) || null;

  await prisma.user.update({ where: { id: user.id }, data: { fullName, phone } });
  revalidatePath("/hub/settings");
  return { success: true };
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailNotifications: formData.get("emailNotifications") === "on",
      appointmentReminders: formData.get("appointmentReminders") === "on",
      paymentNotifications: formData.get("paymentNotifications") === "on",
      leadNotifications: formData.get("leadNotifications") === "on",
      weeklyReports: formData.get("weeklyReports") === "on",
    },
  });
  revalidatePath("/hub/settings");
  return { success: true };
}

/**
 * Real password change via Supabase Auth — same mechanism as the
 * password-reset flow, just while already signed in rather than via
 * an emailed recovery link. No plaintext password handling or custom
 * hashing; Supabase Auth owns this entirely.
 */
export async function changeOwnPassword(newPassword: string) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.authUserId, { password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
