import { verifyNudgeAction } from "@/lib/nudge-action-token";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const COPY: Record<string, { headline: string; body: string }> = {
  HYDRATION: { headline: "Logged — you're on track. ✓", body: "Today's hydration goal is marked complete." },
  PROTEIN: { headline: "Logged — you're on track. ✓", body: "Today's protein check-in is marked complete." },
  COMPRESSION: { headline: "Logged — you've worn it. ✓", body: "Today's compression goal is marked complete." },
};

function todayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function applyAction(clientId: string, category: string, date: Date) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return false;

  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);

  if (category === "HYDRATION") {
    await prisma.dailyTracker.upsert({
      where: { clientId_date: { clientId, date: day } },
      create: { clientId, date: day, waterGlasses: client.hydrationGoalGlasses },
      update: { waterGlasses: client.hydrationGoalGlasses },
    });
  } else if (category === "PROTEIN") {
    await prisma.dailyTracker.upsert({
      where: { clientId_date: { clientId, date: day } },
      create: { clientId, date: day, proteinGrams: client.proteinGoalGrams ?? 1 },
      update: { proteinGrams: client.proteinGoalGrams ?? 1 },
    });
  } else if (category === "COMPRESSION") {
    await prisma.dailyTracker.upsert({
      where: { clientId_date: { clientId, date: day } },
      create: { clientId, date: day, compressionWorn: true, compressionHours: client.compressionHoursRequired ?? 1 },
      update: { compressionWorn: true, compressionHours: client.compressionHoursRequired ?? 1 },
    });
  } else {
    return false;
  }
  return true;
}

export default async function NudgeConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const verified = token ? verifyNudgeAction(token) : null;

  let success = false;
  let copy = { headline: "This link has expired.", body: "Open the app to log today's progress instead." };

  if (verified) {
    success = await applyAction(verified.clientId, verified.category, verified.date);
    if (success) copy = COPY[verified.category] ?? copy;
  }

  return (
    <div className="dtj-shell" style={{ minHeight: "100vh" }}>
      <header className="dtj-header">
        <span style={{ width: 20 }} />
        <span className="dtj-header-wordmark">body shaper system.</span>
        <span style={{ width: 20 }} />
      </header>
      <div className="dtj-content" style={{ textAlign: "center", paddingTop: 60 }}>
        <p className="dtj-score-sparkle" style={{ fontSize: 26, display: "block", marginBottom: 16 }}>✦</p>
        <h1 className="dtj-page-title" style={{ fontSize: 24, marginBottom: 10 }}>{copy.headline}</h1>
        <p className="pay-history-meta" style={{ fontSize: 13, marginBottom: 30 }}>{copy.body}</p>
        <a href="https://www.bodyshapersystem.com/portal/daily-trackers" className="dtj-log-btn" style={{ display: "inline-block", textDecoration: "none", maxWidth: 260, margin: "0 auto" }}>
          OPEN MY DASHBOARD →
        </a>
        <p className="dtj-footer-tag" style={{ marginTop: 50 }}>small steps. one system.<br />bodyshapersystem.com</p>
      </div>
    </div>
  );
}
