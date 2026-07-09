import type { Metadata } from "next";
import { JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "The Body Blueprint™",
  description:
    "Every transformation begins with a blueprint. The Body Blueprint™ is a personalized evaluation of how your body functions, used to design your Personalized System™.",
};

export default function BodyBlueprintPage() {
  return (
    <>


{/* HERO */}
<section className="page-hero">
  <div className="photo reveal"><img src="/images/blueprint-hero.jpg" alt="Emmy Branger, founder of Body Shaper System, reviewing a client blueprint" /></div>
  <div className="reveal">
    <span className="eyebrow">The Body Blueprint™</span>
    <h1>Every transformation begins with <em>a blueprint.</em></h1>
    <p>Before recommending any technology, we first understand your body.</p>
    <a href="#build" className="btn btn-primary">Build My Blueprint™</a>
  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* WHAT IS */}
<section className="section what-is">
  <span className="eyebrow reveal">What Is It</span>
  <h2 className="reveal">A personalized evaluation of how your body functions — not just how it looks.</h2>
  <p className="reveal">Instead of recommending the same treatments to everyone, we evaluate your goals, body composition, skin quality, lifestyle and priorities to design a strategy created specifically for you.</p>
  <p className="thesis reveal">Every recommendation is unique. Because every body is unique.</p>

  <div className="video-frame reveal">
    <div className="play">
      <div className="play-ring">
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M1 1L15 9L1 17V1Z" fill="#F5EEE4"/></svg>
      </div>
      <span className="video-caption">The Body Blueprint™, Explained — Emmy Branger</span>
    </div>
    <div className="subtitle-demo">"Instead of one plan for everyone, we design one plan for you."</div>
  </div>
</section>

{/* WHAT WE EVALUATE */}
<section className="section" style={{background: 'var(--beige)'}}>
  <div style={{textAlign: 'center', maxWidth: '640px', margin: '0 auto 10px'}}>
    <span className="eyebrow reveal">The Evaluation</span>
    <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0'}}>What We Evaluate</h2>
  </div>
  <div className="evaluate-grid reveal">
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>
    </div><span>Goals</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
    </div><span>Body Composition</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 3v18M6 8h12M6 16h12"/></svg>
    </div><span>Localized Fat</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 12c4-8 12-8 16 0-4 8-12 8-16 0Z"/></svg>
    </div><span>Skin Tightness</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 20V10M12 20V4M18 20v-7"/></svg>
    </div><span>Muscle Tone</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11Z"/></svg>
    </div><span>Cellulite</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 14c3 4 13 4 16 0M4 10c3-4 13-4 16 0"/></svg>
    </div><span>Fluid Retention</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="8" r="3.2"/><path d="M5 21c1.5-4 5-6 7-6s5.5 2 7 6"/></svg>
    </div><span>Lifestyle</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 4v16h16M8 15l4-5 3 3 4-6"/></svg>
    </div><span>Previous Treatments</span></div>
    <div className="evaluate-item"><div className="ring">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    </div><span>Timeline</span></div>
  </div>
</section>

{/* BLUEPRINT JOURNEY */}
<section className="section" style={{textAlign: 'center'}}>
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

{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Ready to build yours?</h2>
  <div className="actions reveal">
    <a href={JOTFORM_BLUEPRINT_URL} className="btn btn-primary">Build My Blueprint™</a>
    <a href={WHATSAPP_URL} className="btn btn-dark-outline">Chat with a Specialist</a>
  </div>
</section>

    </>
  );
}
