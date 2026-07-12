"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function updateBusinessSettings(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "settings.manage")) {
    return { error: "You don't have permission to edit business settings." };
  }

  const discountRaw = formData.get("fullPaymentDiscount");
  const fullPaymentDiscountCents =
    discountRaw && String(discountRaw).trim() !== "" ? Math.round(Number(discountRaw) * 100) : null;

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessName: String(formData.get("businessName") || "Body Shaper System™"),
      contactEmail: (formData.get("contactEmail") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      fullPaymentDiscountCents,
    },
    update: {
      businessName: String(formData.get("businessName") || "Body Shaper System™"),
      contactEmail: (formData.get("contactEmail") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      fullPaymentDiscountCents,
    },
  });

  revalidatePath("/hub/settings");
  revalidatePath("/hub/payments");
  return { success: true };
}

export async function updateOwnProfile(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user) return { error: "Not signed in." };

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) return { error: "Name can't be empty." };

  await prisma.user.update({ where: { id: user.id }, data: { fullName } });
  revalidatePath("/hub/settings");
  return { success: true };
}
