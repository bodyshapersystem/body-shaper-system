import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getOnboardingStatus } from "@/lib/onboarding";
import "@/app/(site)/body-blueprint/interactive-blueprint.css";
import "@/components/forms/onboarding-forms.css";

export const dynamic = "force-dynamic";

const INSIDE: [string, string][] = [
  ["appointments", "your upcoming sessions, always at hand."],
  ["my body blueprint™", "your personalized strategy and goals."],
  ["daily trackers", "water, nutrition and habits between sessions."],
  ["progress photos", "your private before & after, session by session."],
  ["documents", "your signed evaluation and agreement."],
  ["messages", "talk directly with your specialist."],
];

/** First screen after onboarding (Prepare Your Experience™ + Almost Ready™): welcome into the Client Portal. */
export default async function PortalWelcomePage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");
  const status = await getOnboardingStatus(client.id);
  if (!status.isComplete) redirect("/portal/onboarding");
  return (
    <div className="of-page">
      <div className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in bp2-done">
          <p className="bp2-logo">body shaper system™</p>
          <span className="bp2-bigcheck" aria-hidden="true" />
          <p className="bp2-eyebrow" style={{ marginTop: 6 }}>your onboarding is complete</p>
          <h3>
            welcome to your portal, <em>{client.firstName.toLowerCase()}</em>
          </h3>
          <p className="bp2-lead">this is your private space for your body shaper system™ experience. here is what you&apos;ll find inside:</p>
          <ul className="of-inside">
            {INSIDE.map(([t, d]) => (
              <li key={t}>
                <b>{t}</b>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <div className="of-done-actions">
            <a className="bp2-btn champagne" href="/portal/dashboard">
              enter my portal <span className="bp2-arrow" aria-hidden="true" />
            </a>
          </div>
          <p className="bp2-foot">with care · the body shaper concierge</p>
        </div>
      </div>
    </div>
  );
}
