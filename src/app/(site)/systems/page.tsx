import type { Metadata } from "next";
import { JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Personalized Systems™",
  description:
    "Five curated Personalized Systems™ — Sculpt Start™, Sculpt Signature™, Mom Reset™, GLP-1 Reshape™ and Total Body Optimization™ — each built on your Body Blueprint™.",
};

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
<div className="sys-hero-wrap">
  <DecoArc className="sys-hero-arc" />
  <DecoRing className="sys-hero-ring" />
  <DecoDots className="sys-hero-dots" />
  <section className="page-hero">
    <div className="photo reveal"><img src="/images/systems-hero.jpg" alt="Emmy Branger, founder of Body Shaper System, reviewing treatment systems" /></div>
    <div className="reveal">
      <span className="eyebrow">Personalized Systems™</span>
      <h1>Five systems. <em>One built for you.</em></h1>
      <p>Five curated systems designed to support different goals, life stages and transformation journeys. Every recommendation begins with your Body Blueprint™.</p>
      <a href="/body-blueprint" className="btn btn-dark-outline">Learn About The Blueprint™</a>
    </div>
  </section>
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
    </div>

    <div className="system-card">
      <div className="num">03</div>
      <h3>Mom Reset™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Postpartum recovery</li>
        <li>Core strengthening</li>
        <li>Body confidence</li>
      </ul>
      <div className="sessions">6–16 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$2,090</div>
    </div>

    <div className="system-card">
      <div className="num">04</div>
      <h3>GLP-1 Reshape™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Body recomposition</li>
        <li>Muscle preservation</li>
        <li>Skin support</li>
      </ul>
      <div className="sessions">8–20 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$1,700</div>
    </div>

    <div className="system-card">
      <div className="num">05</div>
      <h3>Total Body Optimization™</h3>
      <div className="best-for-label">Best For</div>
      <ul>
        <li>Multiple body goals</li>
        <li>Full body transformation</li>
        <li>Long-term optimization</li>
      </ul>
      <div className="sessions">12–24 Sessions</div>
      <div className="price-label">Investment Starts At</div>
      <div className="price">$2,890</div>
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
