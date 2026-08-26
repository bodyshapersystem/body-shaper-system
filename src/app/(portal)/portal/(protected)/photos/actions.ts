"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentPortalClient, getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Portal-safe equivalent of the Hub's getPhotoSignedUrl (which gates
 * on getCurrentHubUser and always returns null for a Portal client -
 * discovered this was silently breaking the Dashboard's
 * Transformation Preview, since it imported the Hub version
 * directly). Checks the current PORTAL client instead, and confirms
 * the requested photo actually belongs to them and is CLIENT_VISIBLE
 * before generating a signed URL, so one client can't fetch another
 * client's storage path just by guessing/passing an id.
 */
export async function getClientPhotoSignedUrl(photoId: string): Promise<string | null> {
  const client = await getCurrentPortalClient();
  if (!client) return null;

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, clientId: client.id, visibility: "CLIENT_VISIBLE" },
  });
  if (!photo) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(photo.storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Hub-admin variant — same signed-URL lookup, but verified against
 * Hub permissions (not a portal client session), for previewing a
 * specific client's real Progress Photos from the Hub side.
 */
export async function getClientPhotoSignedUrlForAdmin(photoId: string, clientId: string): Promise<string | null> {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) return null;

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, clientId, visibility: "CLIENT_VISIBLE" },
  });
  if (!photo) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("client-documents").createSignedUrl(photo.storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
