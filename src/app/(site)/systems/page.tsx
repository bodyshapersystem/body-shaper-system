import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";
import SystemDepositButton from "./SystemDepositButton";

export const metadata: Metadata = buildMetadata({
  title: "Fat Reduction, Skin Tightening & Toning Systems | Miami",
  description:
    "Five personalized treatment systems for fat reduction, skin tightening, cellulite reduction and muscle toning — including GLP-1 skin firming and postpartum body contouring in Miami.",
  path: "/systems",
});

/* ---------- Subtle decorative primitives (pure SVG, no content) ---------- */

function DecoArc({ className }: { className: string }) {
  return (
    <div className={`sys-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
        <circle cx="100" cy="100" r="98" stroke="#6B5240" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="80" stroke="#6B5240" strokeWidth="0.6" strokeDasharray="1 7" />
      </svg>
    </div>
  );
}

function DecoRing({ className }: { className: string }) {
  return (
    <div className={`sys-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
        <circle cx="50" cy="50" r="48" stroke="#9C8A76" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="30" stroke="#9C8A76" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="2.4" fill="#6B5240" />
      </svg>
    </div>
  );
}

function DecoDots({ className }: { className: string }) {
  const pts = [];
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 6; y++) {
      pts.push(<circle key={`${x}-${y}`} cx={8 + x * 18} cy={8 + y * 18} r="1.4" fill="#9C8A76" />);
    }
  }
  return (
    <div className={`sys-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {pts}
      </svg>
    </div>
  );
}

function DecoCrosshair({ className }: { className: string }) {
  return (
    <div className={`sys-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 150 150" width="100%" height="100%" fill="none">
        <line x1="0" y1="75" x2="150" y2="75" stroke="#6B5240" strokeWidth="0.5" />
        <line x1="75" y1="0" x2="75" y2="150" stroke="#6B5240" strokeWidth="0.5" />
        <circle cx="75" cy="75" r="36" stroke="#9C8A76" strokeWidth="0.6" />
        <circle cx="75" cy="75" r="3" fill="#6B5240" />
      </svg>
    </div>
  );
}

export default function SystemsPage() {
  return (
    <>


{/* HERO */}
<section className="sys-hero-photo" id="top">
  <h1 className="sr-only">
    Personalized Systems™ — One Blueprint. Five Systems. Built entirely for you.
  </h1>
  <div className="sys-hero-photo-inner">
    <img
      src="/images/systems-hero-banner.webp"
      alt="Body Shaper System — Personalized Systems™: one blueprint, five systems built entirely for you — Sculpt Start, Sculpt Signature, Mom Reset, GLP-1 Reshape, Total Body Optimization"
      fetchPriority="high"
      loading="eager"
      decoding="sync"
    />
  </div>
</section>

<div className="sys-hero-cta-wrap reveal">
  <a href="/body-blueprint" className="btn btn-dark-outline">Learn About The Blueprint™</a>
</div>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* SYSTEMS GRID */}
<section className="section" style={{paddingTop: '60px'}}>
  <div className="sys-grid-header">
    <DecoCrosshair className="sys-deco-crosshair" />
    <DecoDots className="sys-deco-grid" />
    <div className="section-labels reveal">
      <span>Core Systems</span>
      <span>Specialty Systems</span>
      <span>Premium Experience</span>
    </div>
  </div>

  <p className="sys-intro reveal">
    Every system below is a starting point, not a fixed package — your Body
    Blueprint™ determines the real mix of fat reduction, skin tightening and
    muscle toning your body needs. Whether you're looking for postpartum
    body contouring, support after significant weight loss, or a
    personalized body contouring plan built around your goals, each system
    is delivered as a mobile, in-home experience across Miami.
  </p>

  <div className="systems-grid reveal">
    <div className="system-card">
      <div className="num">01</div>
      <h3>Sculpt Start™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>First-time clients</li>
        <li>Mild body contouring</li>
        <li>Localized fat reduction</li>
      </ul>
      <div className="sessions">4–8 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$700</div>
      <SystemDepositButton systemName="Sculpt Start™" priceCents={70000} priceLabel="$700" />
    </div>

    <div className="system-card">
      <div className="num">02</div>
      <h3>Sculpt Signature™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Body contouring</li>
        <li>Skin tightening</li>
        <li>Cellulite improvement</li>
      </ul>
      <div className="sessions">8–16 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$1,680</div>
      <SystemDepositButton systemName="Sculpt Signature™" priceCents={168000} priceLabel="$1,680" />
    </div>

    <div className="system-card">
      <div className="num">03</div>
      <h3>Mom Reset™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Postpartum body contouring</li>
        <li>Core strengthening</li>
        <li>Body confidence</li>
      </ul>
      <div className="sessions">6–16 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$2,090</div>
      <SystemDepositButton systemName="Mom Reset™" priceCents={209000} priceLabel="$2,090" />
    </div>

    <div className="system-card">
      <div className="num">04</div>
      <h3>GLP-1 Reshape™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Post-GLP-1 body contouring</li>
        <li>Muscle preservation</li>
        <li>Skin tightening after weight loss</li>
      </ul>
      <div className="sessions">8–20 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$1,700</div>
      <SystemDepositButton systemName="GLP-1 Reshape™" priceCents={170000} priceLabel="$1,700" />
    </div>

    <div className="system-card">
      <div className="num">05</div>
      <h3>Total Body Optimization™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Multiple body goals</li>
        <li>Muscle toning &amp; definition</li>
        <li>Long-term optimization</li>
      </ul>
      <div className="sessions">12–24 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$2,890</div>
      <SystemDepositButton systemName="Total Body Optimization™" priceCents={289000} priceLabel="$2,890" />
    </div>
  </div>
</section>

{/* BLUEPRINT JOURNEY TIMELINE */}
<div className="sys-timeline-wrap">
  <DecoArc className="sys-deco-arc-2" />
  <DecoDots className="sys-deco-dots-2" />
  <section className="section" style={{background: 'var(--beige)', textAlign: 'center'}}>
    <span className="eyebrow reveal">The Process</span>
    <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,44px)', margin: '16px 0 60px'}}>Your Blueprint Journey™</h2>
    <div className="timeline reveal">
      <div className="timeline-step">
        <div className="timeline-num">01</div>
        <h4>Discovery</h4>
        <p>We begin by understanding your goals, lifestyle and body concerns.</p>
      </div>
      <div className="timeline-step">
        <div className="timeline-num">02</div>
        <h4>Body Blueprint™</h4>
        <p>A personalized evaluation designed to identify the best strategy for your body.</p>
      </div>
      <div className="timeline-step">
        <div className="timeline-num">03</div>
        <h4>Personalized System</h4>
        <p>Based on your Blueprint™, we recommend the technologies that best support your goals.</p>
      </div>
      <div className="timeline-step">
        <div className="timeline-num">04</div>
        <h4>Progress Tracking</h4>
        <p>We monitor your progress and adjust your strategy as your body evolves.</p>
      </div>
      <div className="timeline-step">
        <div className="timeline-num">05</div>
        <h4>Your Best Results</h4>
        <p>A personalized transformation designed around your body — not someone else's.</p>
      </div>
    </div>
  </section>
</div>

{/* BOTTOM CTA */}
<div className="sys-cta-wrap">
  <DecoRing className="sys-deco-ring-2" />
  <DecoArc className="sys-deco-arc-3" />
  <section className="final-cta" id="build" style={{paddingBottom: '0'}}>
    <h2 className="reveal">Not sure which system is right for you?</h2>
    <p className="reveal" style={{maxWidth: '480px', margin: '-20px auto 40px', color: '#4a443d', fontSize: '15.5px'}}>Every recommendation begins with your Body Blueprint™ evaluation.</p>
    <div className="actions reveal">
      <a href={JOTFORM_BLUEPRINT_URL} className="btn btn-primary">Build My Blueprint™</a>
    </div>

    <div className="deposit-box reveal">
      <span className="eyebrow">Already Ready To Begin?</span>
      <h3>Secure your appointment.</h3>
      <p>Reserve your appointment with your $350 reservation deposit. This amount will be applied toward your personalized treatment plan.</p>
      <a href={WHATSAPP_URL} className="btn btn-dark-outline">Reserve Your Appointment</a>
      <small>$350 reservation deposit. Applied toward your personalized treatment plan. Non-refundable.</small>
    </div>
  </section>
</div>

    </>
  );
}
