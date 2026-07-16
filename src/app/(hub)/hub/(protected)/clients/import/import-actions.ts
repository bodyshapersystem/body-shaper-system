"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ImportRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string; // Service Zone
  birthday?: string; // ISO date string
  lastAppointment?: string; // ISO date string
  lastTreatment?: string;
  lifetimeValue?: string; // dollars, as typed in the sheet
  notes?: string;
};

export type ImportResult = {
  successCount: number;
  failures: { row: number; email: string; reason: string }[];
};

/**
 * Real bulk import — creates a genuine Lead + Client + dormant portal
 * User (Supabase Auth account, INVITATION_PENDING, no invite email
 * sent) for each row, exactly like a normal conversion, since the
 * schema requires both. Every imported client is immediately paused
 * (pausedAt=now) — this IS "Inactive Clients" per direction, using
 * the real existing Pause mechanism rather than inventing a parallel
 * status field. Processes rows sequentially with per-row error
 * capture, so one bad row doesn't fail the whole batch.
 */
export async function bulkImportClients(rows: ImportRow[]): Promise<ImportResult | { error: string }> {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to import clients." };
  }
  if (rows.length > 500) {
    return { error: "Please import in batches of 500 or fewer at a time." };
  }

  const admin = createSupabaseAdminClient();
  const failures: ImportResult["failures"] = [];
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.email || !row.firstName || !row.lastName) {
        failures.push({ row: i + 1, email: row.email ?? "—", reason: "Missing required First Name, Last Name, or Email." });
        continue;
      }

      const existingClient = await prisma.client.findFirst({ where: { email: row.email } });
      if (existingClient) {
        failures.push({ row: i + 1, email: row.email, reason: "A client with this email already exists — skipped." });
        continue;
      }

      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: row.email,
        email_confirm: true,
      });
      if (authError || !authData.user) {
        failures.push({ row: i + 1, email: row.email, reason: authError?.message ?? "Could not create portal account." });
        continue;
      }

      const lifetimeValueCents = row.lifetimeValue ? Math.round(parseFloat(row.lifetimeValue.replace(/[^0-9.]/g, "")) * 100) : null;

      await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || null,
            city: row.city || null,
            status: "CONVERTED",
            source: "Legacy Import",
            convertedAt: new Date(),
          },
        });

        const portalUser = await tx.user.create({
          data: {
            authUserId: authData.user.id,
            email: row.email,
            fullName: `${row.firstName} ${row.lastName}`,
            roleId: "role_client",
            portalStatus: "INVITATION_PENDING",
            createdById: user.id,
          },
        });

        const client = await tx.client.create({
          data: {
            leadId: lead.id,
            userId: portalUser.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || null,
            city: row.city || null,
            address: row.address || null,
            birthday: row.birthday ? new Date(row.birthday) : null,
            importedLastAppointmentAt: row.lastAppointment ? new Date(row.lastAppointment) : null,
            importedLastTreatment: row.lastTreatment || null,
            importedLifetimeValueCents: lifetimeValueCents,
            importSource: `CSV/Excel Import ${new Date().toLocaleDateString()}`,
            pausedAt: new Date(), // imported clients start Inactive, per direction
            createdById: user.id,
          },
        });

        await tx.rewardsAccount.create({ data: { clientId: client.id, pointsBalance: 0 } });

        if (row.notes) {
          await tx.clientNote.create({ data: { clientId: client.id, authorId: user.id, content: row.notes } });
        }
      });

      successCount += 1;
    } catch (e) {
      failures.push({ row: i + 1, email: row.email ?? "—", reason: e instanceof Error ? e.message : "Unknown error." });
    }
  }

  revalidatePath("/hub/clients");
  return { successCount, failures };
}
