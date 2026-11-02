import { redirect } from "next/navigation";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getInstagramFeed, igConfig } from "@/lib/instagram";

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = {
  config: "The Instagram app keys are not set yet (INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET).",
  denied: "Instagram did not grant access. Please try again and tap “Allow”.",
  state: "The connection expired. Please try again.",
  exchange: "Instagram didn't return a valid access. Please try again.",
  auth: "Please log in to the Hub as the owner.",
};

export default async function InstagramHubPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "settings.manage")) redirect("/hub/dashboard");
  const q = await searchParams;
  const conn = await prisma.instagramConnection.findUnique({ where: { id: "default" } });
  const cfg = igConfig();
  const feed = conn ? await getInstagramFeed(8) : [];
  const days = conn ? Math.round((conn.expiresAt.getTime() - Date.now()) / 86400000) : 0;
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">website</p>
        <h1>instagram feed.</h1>
        <p className="dash-subtitle">Your latest Instagram posts appear automatically on the website (home · “Follow the Journey”). Updated every hour.</p>
      </div>
      {q.connected ? <p className="dash-subtitle" style={{ color: "#3d6b3d" }}>✓ Instagram connected. Your feed is live on the website.</p> : null}
      {q.error ? <p className="dash-subtitle" style={{ color: "#a12b2b" }}>{ERR[q.error] ?? "Something went wrong."}</p> : null}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, margin: "16px 0", maxWidth: 720 }}>
        {conn ? (
          <>
            <p><b>Connected:</b> @{conn.username}</p>
            <p>Access renews automatically every week (current access valid for {days} more days).</p>
            {conn.lastError ? <p style={{ color: "#a12b2b" }}>Last issue: {conn.lastError}</p> : null}
          </>
        ) : (
          <p>Not connected yet. Until you connect, the website shows the 5 fixed images.</p>
        )}
        {cfg.ready ? (
          <a href="/api/instagram/connect" className="btn btn-primary" style={{ display: "inline-block", marginTop: 10 }}>
            {conn ? "Reconnect Instagram" : "Connect Instagram"}
          </a>
        ) : (
          <p style={{ color: "#a12b2b" }}>{ERR.config}</p>
        )}
      </div>
      {feed.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, maxWidth: 720 }}>
          {feed.map((p) => (
            <a key={p.id} href={p.permalink} target="_blank" rel="noopener noreferrer">
              <img src={p.image} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 10 }} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
