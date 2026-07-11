"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { LeadStatus, PaymentStatus } from "@prisma/client";
import { sendWelcomeActivationEmail } from "@/lib/email/service";
import { linkAssessmentToClient } from "@/lib/blueprint-assessments";

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  city: z.string().optional(),
  goals: z.string().optional(),
  source: z.string().optional(),
});

export async function createLead(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.create")) {
    return { error: "You don't have permission to create leads." };
  }

  const parsed = createLeadSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    goals: formData.get("goals") || undefined,
    source: formData.get("source") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const lead = await prisma.lead.create({
    data: { ...parsed.data, createdById: user.id },
  });

  await prisma.leadStatusHistory.create({
    data: { leadId: lead.id, toStatus: "NEW", changedById: user.id, note: "Lead created" },
  });

  revalidatePath("/hub/leads");
  redirect(`/hub/leads/${lead.id}`);
}

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus, note?: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.edit")) {
    return { error: "You don't have permission to edit leads." };
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead not found." };

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status: newStatus } }),
    prisma.leadStatusHistory.create({
      data: {
        leadId,
        fromStatus: lead.status,
        toStatus: newStatus,
        changedById: user.id,
        note,
      },
    }),
  ]);

  revalidatePath("/hub/leads");
  revalidatePath(`/hub/leads/${leadId}`);
  return { success: true };
}

export async function recordLeadPayment(leadId: string, paymentStatus: PaymentStatus) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.edit")) {
    return { error: "You don't have permission to edit leads." };
  }

  await prisma.lead.update({ where: { id: leadId }, data: { paymentStatus } });

  revalidatePath(`/hub/leads/${leadId}`);
  return { success: true };
}

export async function archiveLead(leadId: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.archive")) {
    return { error: "You don't have permission to archive leads." };
  }

  // Soft delete only — archivedAt is set, the row is never removed.
  await prisma.lead.update({ where: { id: leadId }, data: { archivedAt: new Date() } });
  revalidatePath("/hub/leads");
  return { success: true };
}

/**
 * Converts a Lead into a permanent Client record. Idempotent: if this
 * lead has already converted, returns the existing client instead of
 * creating a second one — safe to click twice, safe to retry after a
 * partial failure on a prior attempt (checked BEFORE any writes).
 *
 * Same person, never duplicated: the Lead row is preserved as-is and
 * linked via clients.leadId (unique); a brand new Supabase Auth user +
 * BSS `users` row is created to own portal login, since a lead never
 * had one before.
 */
type ConversionResult = {
  error?: string;
  success?: boolean;
  clientId?: string;
  alreadyConverted?: boolean;
  activationUrl?: string;
  emailSent?: boolean;
  emailError?: string;
};

const SITE_URL = "https://www.bodyshapersystem.com";

export async function convertLeadToClient(leadId: string): Promise<ConversionResult> {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to convert leads." };
  }

  const existing = await prisma.client.findUnique({ where: { leadId } });
  if (existing) {
    return { success: true, clientId: existing.id, alreadyConverted: true };
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead not found." };
  if (lead.archivedAt) return { error: "Cannot convert an archived lead." };

  const clientRoleId = "role_client";

  const admin = createSupabaseAdminClient();

  // Create the Supabase Auth identity first — no password set here;
  // the person sets their own password via the portal activation link.
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: lead.email,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    // If this email already has a Supabase Auth account (e.g. retried
    // after a partial failure), look it up instead of failing.
    if (authError?.message?.toLowerCase().includes("already")) {
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list?.users.find((u) => u.email?.toLowerCase() === lead.email.toLowerCase());
      if (!found) return { error: `Auth account exists for ${lead.email} but could not be found.` };
      return await finishConversion(lead, found.id, user.id);
    }
    return { error: authError?.message ?? "Failed to create portal auth account." };
  }

  return await finishConversion(lead, authData.user.id, user.id);
}

async function finishConversion(
  lead: { id: string; firstName: string; lastName: string; email: string; phone: string | null; city: string | null },
  authUserId: string,
  convertedById: string
): Promise<ConversionResult> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const result = await prisma.$transaction(async (tx) => {
    // Reuse a matching users row if one already exists for this
    // authUserId (retry-safety), otherwise create it.
    let portalUser = await tx.user.findUnique({ where: { authUserId } });
    if (!portalUser) {
      portalUser = await tx.user.create({
        data: {
          authUserId,
          email: lead.email,
          fullName: `${lead.firstName} ${lead.lastName}`,
          roleId: "role_client",
          portalStatus: "INVITATION_PENDING",
          createdById: convertedById,
        },
      });
    }

    const client = await tx.client.create({
      data: {
        leadId: lead.id,
        userId: portalUser.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        createdById: convertedById,
      },
    });

    await tx.rewardsAccount.create({ data: { clientId: client.id, pointsBalance: 0 } });
    await tx.messageThread.create({ data: { clientId: client.id } });
    const invite = await tx.portalInvitation.create({
      data: { clientId: client.id, token, expiresAt },
    });

    await tx.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED", convertedAt: new Date() },
    });

    await tx.leadStatusHistory.create({
      data: {
        leadId: lead.id,
        toStatus: "CONVERTED",
        changedById: convertedById,
        note: "Converted to client",
      },
    });

    return { client, invite };
  });

  revalidatePath("/hub/leads");
  revalidatePath(`/hub/leads/${lead.id}`);
  revalidatePath("/hub/clients");

  // Re-link (never copy) the Lead-stage Blueprint Assessment™ to the
  // new Client. If the lead was created manually with no Jotform
  // submission, this creates a blank ACTIVE assessment instead — every
  // Client always has at least one baseline assessment.
  await linkAssessmentToClient(lead.id, result.client.id, convertedById);

  const activationUrl = `${SITE_URL}/portal/activate?token=${result.invite.token}`;

  // Send the Welcome + Activation email automatically — the Owner
  // should never need to copy this link by hand. Runs after the DB
  // transaction commits (email delivery is external I/O and shouldn't
  // hold a database transaction open). If sending fails, the client
  // and invitation still exist untouched — the Hub shows the failure
  // and offers "Resend Invitation", per the no-silent-failure rule.
  const emailResult = await sendWelcomeActivationEmail({
    clientId: result.client.id,
    firstName: lead.firstName,
    email: lead.email,
    activationUrl,
    invitationId: result.invite.id,
  });

  revalidatePath(`/hub/clients/${result.client.id}`);

  return {
    success: true,
    clientId: result.client.id,
    activationUrl,
    emailSent: emailResult.success,
    emailError: emailResult.success ? undefined : emailResult.error,
  };
}

