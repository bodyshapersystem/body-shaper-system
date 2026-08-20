import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { finishConversion } from "@/app/(hub)/hub/(protected)/leads/actions";
import type { Client, Lead } from "@prisma/client";

/**
 * Shared by every Stripe webhook flow that can originate a brand-new
 * client (consultation deposit booking, system starting-price
 * deposit, and any future paid flow): find the existing Client by
 * email, or create a real Lead → Supabase auth account → converted
 * Client (same finishConversion() the Hub's manual conversion uses —
 * same Rewards welcome bonus, portal invitation, welcome email).
 * Extracted so this non-trivial idempotent creation logic exists in
 * exactly one place rather than being copy-pasted per flow.
 */
export async function findOrCreateClientFromCheckout(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  source: string;
  systemUserId?: string;
}): Promise<{ success: true; clientId: string; client: Client } | { success: false; error: string }> {
  const { firstName, lastName, email, phone, city, source, systemUserId } = params;

  // Case-insensitive: a Stripe checkout where someone types their email
  // in different casing than an existing Client record would otherwise
  // silently create a duplicate Client instead of finding the real one
  // (same class of bug found and fixed in the Jotform document webhook).
  const existingClient = await prisma.client.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existingClient) {
    return { success: true, clientId: existingClient.id, client: existingClient };
  }

  const lead: Lead = await prisma.lead.create({
    data: { firstName, lastName, email, phone: phone || null, city: city || null, source, createdById: systemUserId },
  });
  await prisma.leadStatusHistory.create({
    data: { leadId: lead.id, toStatus: "NEW", changedById: systemUserId, note: `Created from ${source}` },
  });

  const admin = createSupabaseAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, email_confirm: true });

  let authUserId: string;
  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes("already")) {
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) {
        return { success: false, error: `Auth lookup failed for ${email}` };
      }
      authUserId = found.id;
    } else {
      return { success: false, error: `Auth creation failed: ${authError?.message ?? "unknown"}` };
    }
  } else {
    authUserId = authData.user.id;
  }

  const conversion = await finishConversion(lead, authUserId, systemUserId ?? "", "STANDARD");
  if (!conversion.success || !conversion.clientId) {
    return { success: false, error: conversion.error ?? "Conversion failed." };
  }

  const client = await prisma.client.findUnique({ where: { id: conversion.clientId } });
  if (!client) return { success: false, error: "Client lookup failed after creation." };

  return { success: true, clientId: client.id, client };
}
