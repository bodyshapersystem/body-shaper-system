import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyListMissionsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const missions = await prisma.mission.findMany({ orderBy: { creditReward: "asc" } });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {missions.length} mission(s) in the database:
      {"\n\n"}
      {missions.map(
        (m) =>
          `- "${m.name}" | ${m.creditReward} pts | type: ${m.type} | active: ${m.active} | id: ${m.id}\n`
      )}
    </div>
  );
}
