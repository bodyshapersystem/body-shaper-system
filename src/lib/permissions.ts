import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Resolves the currently logged-in Supabase Auth session to this
 * app's own User row (which carries the role + permission set).
 * Returns null if there's no session, or if a session exists but has
 * no matching `users` row yet (shouldn't normally happen, but fail
 * closed rather than assume access).
 */
export async function getCurrentHubUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });

  return user;
}

export type HubUserWithPermissions = NonNullable<Awaited<ReturnType<typeof getCurrentHubUser>>>;

/**
 * Checks whether a resolved Hub user has a given permission key (e.g.
 * "leads.view"). Permissions are always looked up from the database
 * (via the role's assigned permissions) — never hardcoded per-role
 * logic in application code.
 */
export function hasPermission(user: HubUserWithPermissions, permissionKey: string): boolean {
  return user.role.rolePermissions.some((rp) => rp.permission.key === permissionKey);
}
