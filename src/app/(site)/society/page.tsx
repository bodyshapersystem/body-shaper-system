import Link from "next/link";
import type { Metadata } from "next";
import { getLevels } from "@/lib/society";
import { ApplyForm } from "./SocietyForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shaper Society™ — Body Shaper System™",
  description: "Share Body Shaper System™ with your community and earn a commission on every transformation.",
};

export default async function SocietyLandingPage() {
  const levels = await getLevels();
  return (
    <main className="soc-page">
      <section className="soc-hero apd-panel-marble">
        <p className="soc-eyebrow soc-on-dark">shaper society™</p>
        <h1 className="soc-hero-title">share the system.<br />earn with every transformation.</h1>
        <p className="soc-hero-sub">For collaborators, creators and ambassadors who love what Body Shaper System™ does — and want to share it.</p>
      </section>

      <section className="soc-section">
        <h2 className="soc-title">how it works</h2>
        <ol className="soc-steps">
          <li><strong>Apply.</strong> We review every application personally.</li>
          <li><strong>Share your link.</strong> Your personal link tracks every visit for 30 days.</li>
          <li><strong>Earn.</strong> When someone you referred completes payment for their system, you earn a percentage of it.</li>
        </ol>
        <div className="soc-levels soc-levels-lg">
          {levels.map((l, i) => {
            const nextMin = levels[i + 1]?.minSales;
            return (
              <div key={l.name} className="soc-level-card">
                <strong>{l.percent}%</strong>
                <span>{nextMin ? `${l.minSales}–${nextMin - 1}` : `${l.minSales}+`} paid referrals</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="soc-section soc-card">
        <h2 className="soc-title">apply</h2>
        <ApplyForm />
        <p className="soc-note">
          Already a member? <Link href="/society/login">Sign in</Link>. Body Shaper System™ clients: join from <Link href="/portal/invite">Invite &amp; Earn</Link> in your Client Portal.
        </p>
      </section>
    </main>
  );
}
