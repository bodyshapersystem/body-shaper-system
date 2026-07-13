"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// "Owner" deliberately excluded from invite-able roles — there's only
// ever one Owner, and reassigning that role is handled separately
// (Transfer Ownership), not through the invite flow.
const STAFF_ROLES = ["role_manager", "role_specialist", "role_marketing"];
const ALL_STAFF_ROLES = ["role_owner", "role_admin", "role_manager", "role_specialist", "role_assistant", "role_marketing"];

export async function createTeamMember(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "hub.access") || user.role.id !== "role_owner") {
    return { error: "Only the Owner can add team members." };
  }

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const email = String(formData.get("email") || "").trim();
  const phone = (formData.get("phone") as string) || null;
  const roleId = String(formData.get("roleId") || "");

  if (!fullName || !email) return { error: "Name and email are required." };
  if (!STAFF_ROLES.includes(roleId)) return { error: "Invalid role selected." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with this email already exists." };

  const admin = createSupabaseAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email);

  if (authError || !authData?.user) {
    return { error: authError?.message ?? "Could not create the team member's login." };
  }

  await prisma.user.create({
    data: {
      authUserId: authData.user.id,
      email,
      fullName,
      phone,
      roleId,
      status: "INVITED",
      createdById: user.id,
    },
  });

  revalidatePath("/hub/team");
  return { success: true };
}

export async function updateTeamMemberRole(userId: string, roleId: string) {
  const currentUser = await getCurrentHubUser();
  if (!currentUser || currentUser.role.id !== "role_owner") {
    return { error: "Only the Owner can change roles." };
  }
  if (!ALL_STAFF_ROLES.includes(roleId)) return { error: "Invalid role." };

  await prisma.user.update({ where: { id: userId }, data: { roleId } });
  revalidatePath("/hub/team");
  return { success: true };
}

export async function updateTeamMemberStatus(userId: string, status: "ACTIVE" | "SUSPENDED") {
  const currentUser = await getCurrentHubUser();
  if (!currentUser || currentUser.role.id !== "role_owner") {
    return { error: "Only the Owner can change status." };
  }
  if (userId === currentUser.id) return { error: "You can't change your own status." };

  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/hub/team");
  return { success: true };
}

/**
 * Sends a real password-reset email via Supabase Auth — same
 * mechanism as the self-service Forgot Password flow, just triggered
 * by the Owner on someone else's behalf.
 */
export async function resetTeamMemberPassword(email: string) {
  const currentUser = await getCurrentHubUser();
  if (!currentUser || currentUser.role.id !== "role_owner") {
    return { error: "Only the Owner can reset a team member's password." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.resetPasswordForEmail(email);
  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Toggles a permission for an entire Role (not a single person) —
 * permissions in this system are role-based, not per-user overrides.
 * Editing a permission here changes it for every team member who
 * shares that role.
 */
export async function toggleRolePermission(roleId: string, permissionKey: string, enabled: boolean) {
  const currentUser = await getCurrentHubUser();
  if (!currentUser || currentUser.role.id !== "role_owner") {
    return { error: "Only the Owner can change permissions." };
  }
  if (roleId === "role_owner") return { error: "The Owner role always has full access." };

  const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
  if (!permission) return { error: "Unknown permission." };

  if (enabled) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId: permission.id } },
      create: { roleId, permissionId: permission.id },
      update: {},
    });
  } else {
    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId: permission.id } });
  }

  revalidatePath("/hub/team");
  return { success: true };
}
