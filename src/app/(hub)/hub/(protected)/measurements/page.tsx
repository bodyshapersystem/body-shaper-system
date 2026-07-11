import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubMeasurementsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const scans = await prisma.measurement.findMany({
    include: { client: true },
    orderBy: { scanDate: "desc" },
    take: 100,
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Operations</p>
        <h1>measurements.</h1>
      </div>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>
        Record measurements from within each client's Blueprint Assessment™. This is the scan log across all clients.
      </p>

      {scans.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No scans recorded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Client</th>
              <th style={{ padding: "10px 8px" }}>Date</th>
              <th style={{ padding: "10px 8px" }}>Weight</th>
              <th style={{ padding: "10px 8px" }}>Body Fat %</th>
              <th style={{ padding: "10px 8px" }}>Muscle Mass</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${m.clientId}?tab=blueprint`}>
                    {m.client.firstName} {m.client.lastName}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{m.scanDate.toLocaleDateString()}</td>
                <td style={{ padding: "10px 8px" }}>{m.weightKg ?? "—"} kg</td>
                <td style={{ padding: "10px 8px" }}>{m.bodyFatPercent ?? "—"}%</td>
                <td style={{ padding: "10px 8px" }}>{m.muscleMassKg ?? "—"} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
