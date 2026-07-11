"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const STAFF_ROLES = ["role_owner", "role_admin", "role_manager", "role_specialist", "role_assistant", "role_marketing"];

export async function createTeamMember(formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "hub.access") || user.role.id !== "role_owner") {
    return { error: "Only the Owner can add team members." };
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
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
  if (!STAFF_ROLES.includes(roleId)) return { error: "Invalid role." };

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
