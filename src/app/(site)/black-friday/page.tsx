import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import BlackFridayCheckout from "@/components/BlackFridayCheckout";
import { BLACK_FRIDAY_PACKS, blackFridayOpen, usd } from "@/lib/black-friday";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Black Friday EMS | Body Shaper System Miami",
  description: "Black Friday exclusive: 4 EMS sessions for $590, 6 for $830 or 12 for $1,500 — in-home body sculpting in Miami. Available through December 1st.",
  path: "/black-friday",
});

const PACKS = [
  { key: "4" as const, lead: "", note: "" },
  { key: "6" as const, lead: "", note: "" },
  { key: "12" as const, lead: "Or unlock", note: "Best value" },
];

function Waves() {
  return (
    <svg className="bf-waves" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M0 ${150 + i * 6} C 250 ${60 + i * 9}, 450 ${250 - i * 6}, 700 ${150 + i * 3} S 1050 ${70 + i * 8}, 1200 ${150 - i * 4}`} style={{ animationDelay: `${i * -0.7}s` }} />
      ))}
    </svg>
  );
}

export default function BlackFridayPage() {
  const open = blackFridayOpen();
  return (
    <main className="bf-page">
      <section className="bf-hero">
        <Waves />
        <div className="bf-hero-card">
          <img className="bf-logo" src="/images/black-friday/logo-brown.png" alt="Body Shaper System™" width={200} height={164} />
          <p className="bf-eyebrow">Black Friday — Body Shaper System™</p>
          <h1>Your body.<br /><em>Your power.</em></h1>
          <p className="bf-lede">This Black Friday, take your sculpting experience to the next level.</p>
          {open ? <a href="#packages" className="bf-scroll">See the packages</a> : <p className="bf-ended">This offer ended on December 1st.</p>}
        </div>
      </section>

      <section className="bf-ems">
        <div className="bf-ems-media">
          <video src="/videos/black-friday-ems.mp4" poster="/images/black-friday/ems-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="EMS session in progress" />
        </div>
        <div className="bf-ems-copy">
          <p className="bf-eyebrow">EMS technology</p>
          <h2>Discover EMS technology</h2>
          <p>Designed to stimulate muscle contractions and complement your body-toning routine.</p>
          <p className="bf-home">Your body sculpting experience, brought to your home.</p>
        </div>
      </section>

      <section id="packages" className="bf-packs" aria-label="Black Friday EMS packages">
        <p className="bf-eyebrow">Black Friday exclusive</p>
        <h2>Choose your package</h2>
        <div className="bf-grid">
          {PACKS.map(({ key, lead, note }) => {
            const p = BLACK_FRIDAY_PACKS[key];
            return (
              <article key={key} className={`bf-card${note ? " bf-card--best" : ""}`}>
                {note && <span className="bf-badge">{note}</span>}
                {lead && <p className="bf-card-lead">{lead}</p>}
                <p className="bf-sessions"><span>{p.sessions}</span> sessions</p>
                <p className="bf-price">{usd(p.amountCents)}</p>
                <p className="bf-per">EMS · in-home · paid in full</p>
                {open ? <BlackFridayCheckout pack={key} label={`Claim ${p.sessions} sessions · ${usd(p.amountCents)}`} /> : <p className="bf-ended-small">Offer ended</p>}
              </article>
            );
          })}
        </div>
        <p className="bf-fine">Black Friday exclusive. Available through December 1st. One-time payment through secure Stripe checkout — your card details are never stored by Body Shaper System™. After your purchase we&apos;ll contact you to schedule your sessions.</p>
      </section>

      <section className="bf-close">
        <img src="/images/black-friday/logo-brown.png" alt="" width={130} height={107} />
        <p>Body Shaper System™. <em>Sculpt beyond ordinary.</em></p>
        <Link href="/faq">Questions? Read our FAQ</Link>
      </section>
    </main>
  );
}
