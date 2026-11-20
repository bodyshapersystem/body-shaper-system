import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Thank you | Black Friday EMS", robots: { index: false, follow: false } };

export default function BlackFridaySuccess() {
  return (
    <main className="bf-page bf-success"><div className="bf-hero-card">
      <img src="/images/black-friday/logo-brown.png" alt="Body Shaper System™" width={160} height={131} />
      <p className="bf-eyebrow">Black Friday EMS</p>
      <h1>Thank you. <em>Your power starts now.</em></h1>
      <p>Your payment was submitted. You&apos;ll receive a confirmation by email once it&apos;s verified, and we&apos;ll contact you to schedule your in-home EMS sessions.</p>
      <Link href="/" className="bf-btn bf-btn--ghost">Return to Body Shaper System™</Link>
    </div></main>
  );
}
