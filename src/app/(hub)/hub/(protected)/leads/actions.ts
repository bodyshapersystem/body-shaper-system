"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { LeadStatus } from "@prisma/client";

const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
    name: formData.get("name"),
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
