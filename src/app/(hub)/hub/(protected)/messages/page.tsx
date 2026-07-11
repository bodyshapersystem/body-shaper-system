import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubMessagesPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const threads = await prisma.messageThread.findMany({
    include: {
      client: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const withUnread = await Promise.all(
    threads.map(async (t) => ({
      ...t,
      unreadCount: await prisma.message.count({
        where: { threadId: t.id, senderType: "CLIENT", readAt: null },
      }),
    }))
  );

  withUnread.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt.getTime() ?? 0;
    const bTime = b.messages[0]?.createdAt.getTime() ?? 0;
    return bTime - aTime;
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Operations</p>
        <h1>messages.</h1>
      </div>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>
        One thread per client — reply from within their record. WhatsApp integration is planned for later.
      </p>

      {withUnread.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No conversations yet.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", paddingLeft: 0 }}>
          {withUnread.map((t) => (
            <li key={t.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 10, fontSize: 13.5 }}>
              <Link href={`/hub/clients/${t.clientId}?tab=messages`} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>
                    {t.client.firstName} {t.client.lastName}
                  </strong>{" "}
                  {t.messages[0] && <span style={{ opacity: 0.65 }}>— {t.messages[0].body.slice(0, 60)}</span>}
                </span>
                {t.unreadCount > 0 && (
                  <span style={{ background: "#5C1A1F", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11.5 }}>
                    {t.unreadCount} new
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
