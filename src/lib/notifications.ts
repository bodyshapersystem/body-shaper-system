import { prisma } from "@/lib/prisma";
import type { NotificationCategory } from "@prisma/client";

export const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  PORTAL: "🟢",
  FORMS: "📝",
  APPOINTMENTS: "📅",
  PAYMENTS: "💳",
  DOCUMENTS: "📋",
  REWARDS: "⭐",
  GENERAL: "🔔",
};

/**
 * Central place every real trigger event goes through — one real
 * table, powers the Notification Center, the Dashboard widget, and
 * each client's own Activity Log (same records, just filtered by
 * clientId). Never blocks the calling action if it fails.
 */
export async function createNotification(params: {
  clientId?: string;
  category: NotificationCategory;
  description: string;
  linkUrl?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        clientId: params.clientId,
        category: params.category,
        description: params.description,
        linkUrl: params.linkUrl,
      },
    });
  } catch {
    // Never let a notification failure break the real action that triggered it.
  }
}
