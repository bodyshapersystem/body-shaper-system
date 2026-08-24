import { redirect } from "next/navigation";
import { getReminderCenterData } from "./actions";
import ReminderCenterView from "./ReminderCenterView";

export const dynamic = "force-dynamic";

export default async function ReminderCenterPage() {
  const data = await getReminderCenterData();
  if (!data) redirect("/portal/login");

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <ReminderCenterView
        initialPreferences={data.preferences}
        initialQuietHoursStart={data.quietHoursStart}
        initialQuietHoursEnd={data.quietHoursEnd}
      />
    </div>
  );
}
