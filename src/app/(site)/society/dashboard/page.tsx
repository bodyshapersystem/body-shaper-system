import { redirect } from "next/navigation";
import SocietyDashboard from "@/components/society/SocietyDashboard";
import { getSocietyDashboard } from "@/lib/society";
import { getCurrentSocietyParticipant, logoutSociety } from "../actions";

export const dynamic = "force-dynamic";

export default async function SocietyDashboardPage() {
  const participant = await getCurrentSocietyParticipant();
  if (!participant) redirect("/society/login");
  if (participant.type === "CLIENT") redirect("/portal/invite");
  if (participant.status !== "ACTIVE") redirect("/society/login");
  const data = await getSocietyDashboard(participant.id);
  if (!data) redirect("/society/login");
  const { participant: _p, ...props } = data;
  return (
    <main className="soc-page">
      <div className="soc-page-head">
        <div>
          <p className="soc-eyebrow">shaper society™</p>
          <h1 className="soc-title">hi, {participant.firstName}.</h1>
        </div>
        <form action={logoutSociety}>
          <button type="submit" className="soc-btn soc-btn-ghost">Sign out</button>
        </form>
      </div>
      <SocietyDashboard data={props} siteOrigin="https://www.bodyshapersystem.com" />
    </main>
  );
}
