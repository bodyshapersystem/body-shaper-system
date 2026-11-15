"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { listRenphoProfiles, renphoConfigured, renphoLogin, syncClientRenpho, RenphoError } from "@/lib/renpho";

async function guard() {
  const user = await getCurrentHubUser();
  return user && hasPermission(user, "blueprints.manage") ? user : null;
}
const msg = (e: unknown) => (e instanceof RenphoError ? e.message : "Couldn't reach RENPHO right now. Try again in a minute.");

/** RENPHO profiles in the studio account, with which client (if any) each one is already linked to. */
export async function getRenphoProfiles(): Promise<{ profiles?: { id: string; name: string; linkedTo?: string; linkedClientId?: string }[]; error?: string }> {
  if (!(await guard())) return { error: "You don't have permission to do this." };
  if (!renphoConfigured()) return { error: "RENPHO isn't connected yet — add RENPHO_EMAIL and RENPHO_PASSWORD in Vercel → Settings → Environment Variables." };
  try {
    const profiles = await listRenphoProfiles();
    const linked = await prisma.client.findMany({ where: { renphoUserId: { in: profiles.map((p) => p.id) } }, select: { id: true, firstName: true, lastName: true, renphoUserId: true } });
    const byId = new Map(linked.map((c) => [c.renphoUserId!, c]));
    return { profiles: profiles.map((p) => { const c = byId.get(p.id); return { ...p, linkedTo: c ? `${c.firstName} ${c.lastName}` : undefined, linkedClientId: c?.id }; }) };
  } catch (e) { return { error: msg(e) }; }
}

/** Links the client to a RENPHO profile and imports their full scan history right away. */
export async function linkRenphoProfile(clientId: string, profileId: string, profileName: string): Promise<{ added?: number; error?: string }> {
  if (!(await guard())) return { error: "You don't have permission to do this." };
  const taken = await prisma.client.findFirst({ where: { renphoUserId: profileId, NOT: { id: clientId } }, select: { firstName: true, lastName: true } });
  if (taken) return { error: `That RENPHO profile is already linked to ${taken.firstName} ${taken.lastName}.` };
  await prisma.client.update({ where: { id: clientId }, data: { renphoUserId: profileId, renphoName: profileName, renphoTable: null } });
  try {
    const { added } = await syncClientRenpho(clientId);
    revalidatePath(`/hub/clients/${clientId}`);
    return { added };
  } catch (e) { revalidatePath(`/hub/clients/${clientId}`); return { error: msg(e) }; }
}

export async function syncRenphoNow(clientId: string): Promise<{ added?: number; error?: string }> {
  if (!(await guard())) return { error: "You don't have permission to do this." };
  try {
    const { added } = await syncClientRenpho(clientId, await renphoLogin());
    revalidatePath(`/hub/clients/${clientId}`);
    return { added };
  } catch (e) { return { error: msg(e) }; }
}

/** Stops future syncing. Scans already imported stay in the client's history. */
export async function unlinkRenpho(clientId: string): Promise<{ ok?: boolean; error?: string }> {
  if (!(await guard())) return { error: "You don't have permission to do this." };
  await prisma.client.update({ where: { id: clientId }, data: { renphoUserId: null, renphoName: null, renphoTable: null } });
  revalidatePath(`/hub/clients/${clientId}`);
  return { ok: true };
}
