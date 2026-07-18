"use server";

import { prisma } from "@/lib/prisma";

export async function submitReferralLead(clientId: string, formData: FormData) {
  const referrer = await prisma.client.findUnique({ where: { id: clientId } });
  if (!referrer) return { error: "This referral link isn't valid." };

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = (formData.get("phone") as string) || undefined;

  if (!firstName || !lastName || !email) return { error: "Please fill in your name and email." };

  const existing = await prisma.lead.findFirst({ where: { email } });
  if (existing) return { error: "It looks like you're already in our system — our team will be in touch soon!" };

  await prisma.lead.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      source: "referral",
      referredByClientId: referrer.id,
    },
  });

  return { success: true, referrerName: referrer.firstName };
}
