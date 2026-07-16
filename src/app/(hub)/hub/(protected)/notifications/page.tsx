import { redirect } from "next/navigation";
import { getCurrentHubUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import NotificationFeed from "./NotificationFeed";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  const serialized = notifications.map((n) => ({
    id: n.id,
    clientId: n.clientId,
    clientName: n.client ? `${n.client.firstName} ${n.client.lastName}` : null,
    category: n.category,
    description: n.description,
    linkUrl: n.linkUrl,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="cat-body portal-page">
      <div className="module-hero">
        <p className="module-hero-eyebrow">activity feed</p>
        <h1 className="module-hero-title">notifications.</h1>
        <p className="module-hero-sub">Every important client action, in one place.</p>
      </div>

      <NotificationFeed initialNotifications={serialized} />
    </div>
  );
}
