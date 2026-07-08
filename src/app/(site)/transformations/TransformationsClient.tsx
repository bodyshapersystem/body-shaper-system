"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/lib/nav";

const FILTERS = [
  "All", "Waist", "Abdomen", "Arms", "Legs", "Postpartum",
  "Skin Tightening", "Cellulite", "Lymphatic Recovery", "Full Body",
];

export default function TransformationsClient() {
  const [active, setActive] = useState(0);
  return (
    <>


{/* HERO */}
<section className="hero">
  <div className="hero-bg"></div>
  <span className="hero-tag">Since 2017</span>
  <div className="hero-content">
    <span className="eyebrow" style={{color: 'var(--rose)'}}>Transformations</span>
    <h1>Real Results.<br /><em>Designed Around You.</em></h1>
    <p>Every transformation begins with understanding your body. Every recommendation begins with a Body Blueprint™.</p>
  </div>
  <div className="scroll-cue"><div className="line"></div>Scroll</div>
</section>

{/* (Insert Transformation Video) hero video note lives inside hero-bg per brand system */}

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* FEATURED TRANSFORMATIONS */}
<section className="section transformations">
  <div className="transformations-head reveal">
    <div>
      <span className="eyebrow">Featured Transformations</span>
      <h2>Personalized strategies, not procedures.</h2>
    </div>
  </div>

  <div className="filter-bar reveal">
    {FILTERS.map((label, i) => (
      <button
        key={label}
        className={`filter-pill${active === i ? " active" : ""}`}
        onClick={() => setActive(i)}
      >
        {label}
      </button>
    ))}
  </div>

  <div className="case-grid reveal" style={{gridTemplateColumns: '1fr', maxWidth: '900px', margin: '0 auto'}}>

    <div className="case-card">
      <div className="before-after">
        <div className="ph-block"><span>(Insert Before Photo)</span></div>
        <div className="ph-block dark"><span>(Insert After Photo)</span></div>
      </div>
      <div className="case-body">
        <span className="tag">Sculpt Start™</span>
        <h3>A First Step, Designed Around Her Body.</h3>
        <div className="case-meta">
          <div>Technologies<strong>Exilis® + Endospheres®</strong></div>
          <div>Sessions<strong>4–8</strong></div>
          <div>Timeline<strong>4–6 Weeks</strong></div>
        </div>
        <p className="quote">"My blueprint made it feel personal from the very first appointment."</p>
        <a href="/body-blueprint">Learn More</a>
      </div>
    </div>

  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* TRANSFORMATION STORIES */}
<section className="section" style={{background: 'var(--beige)'}}>
  <span className="eyebrow reveal" style={{display: 'block', textAlign: 'center'}}>Beyond Before &amp; After</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', textAlign: 'center', margin: '16px 0 8px'}}>Transformation Stories</h2>
  <p className="reveal" style={{textAlign: 'center', maxWidth: '560px', margin: '0 auto', color: '#4a443d', fontSize: '15.5px'}}>Every story follows the same strategic arc: goal, blueprint, system, progress, result.</p>

  <div className="story-grid reveal">
    <div className="story-card">
      <div className="ph-block dark"><span>(Insert Video)</span></div>
      <div className="story-body">
        <span className="eyebrow">Sculpt Signature™</span>
        <h4>Rebuilding Confidence, One Session at a Time.</h4>
        <ul>
          <li>Client Goal: Waist definition</li>
          <li>Personalized System: Sculpt Signature™</li>
          <li>Progress: Tracked bi-weekly</li>
          <li>Final Result: (Insert Result Summary)</li>
        </ul>
      </div>
    </div>
    <div className="story-card">
      <div className="ph-block"><span>(Insert Photos)</span></div>
      <div className="story-body">
        <span className="eyebrow">Mom Reset™</span>
        <h4>Designed for Life After Baby.</h4>
        <ul>
          <li>Client Goal: Postpartum recovery</li>
          <li>Personalized System: Mom Reset™</li>
          <li>Progress: Tracked bi-weekly</li>
          <li>Final Result: (Insert Result Summary)</li>
        </ul>
      </div>
    </div>
    <div className="story-card">
      <div className="ph-block rose"><span>(Insert Photos)</span></div>
      <div className="story-body">
        <span className="eyebrow">Total Body Optimization™</span>
        <h4>A Long-Term Strategy, Fully Realized.</h4>
        <ul>
          <li>Client Goal: Full-body transformation</li>
          <li>Personalized System: Total Body Optimization™</li>
          <li>Progress: Tracked bi-weekly</li>
          <li>Final Result: (Insert Result Summary)</li>
        </ul>
      </div>
    </div>
  </div>
</section>

{/* EVERY BODY HAS ITS OWN TIMELINE */}
<section className="section" style={{textAlign: 'center', maxWidth: '760px', margin: '0 auto'}}>
  <span className="eyebrow">Every Body Has Its Own Timeline</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '20px 0 26px', lineHeight: '1.25'}}>Some clients notice changes after their first session.</h2>
  <p className="reveal" style={{fontSize: '16px', color: '#4a443d', maxWidth: '600px', margin: '0 auto 16px'}}>Others require longer protocols depending on their body, lifestyle and goals.</p>
  <p className="reveal" style={{fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '22px', color: 'var(--mocha)', marginTop: '20px'}}>Your Body Blueprint™ helps us determine the strategy that is right for you.</p>
  <p className="reveal" style={{marginTop: '44px', fontSize: '11.5px', letterSpacing: '0.08em', color: '#8a8073'}}>Results vary. Consistency matters.</p>
</section>

{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Ready to start your own transformation?</h2>
  <div className="actions reveal">
    <a href="/body-blueprint" className="btn btn-primary">Build My Blueprint™</a>
    <a href={WHATSAPP_URL} className="btn btn-dark-outline">Reserve Your Appointment</a>
  </div>
</section>

    </>
  );
}
