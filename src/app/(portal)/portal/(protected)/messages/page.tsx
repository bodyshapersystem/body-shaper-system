import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { replyAsClient } from "./actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const thread = await prisma.messageThread.findUnique({
    where: { clientId: client.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Secure Communication</p>
        <h1>messages.</h1>
        <p className="portal-page-sub">Connect with your care team.</p>
      </div>

      <div className="simple-card msg-thread">
        {(!thread || thread.messages.length === 0) && (
          <p style={{ opacity: 0.6 }}>No messages yet — send one below to get started.</p>
        )}
        {thread?.messages.map((m) => (
          <div key={m.id} className={m.senderType === "CLIENT" ? "msg-bubble me" : "msg-bubble"}>
            {m.body}
          </div>
        ))}
        <form
          action={async (formData: FormData) => {
            "use server";
            await replyAsClient(formData);
          }}
        >
          <textarea name="body" className="msg-input" placeholder="Write a message…" rows={2} required />
          <button type="submit" className="pd-link" style={{ marginTop: 8 }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

