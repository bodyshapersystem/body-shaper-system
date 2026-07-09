import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "About",
  description:
    "More than treatments — a personalized method. The story, methodology and philosophy behind Body Shaper System™, founded by Emmy Branger in Miami in 2017.",
};

export default function AboutPage() {
  return (
    <>


{/* HERO */}
<section className="page-hero">
  <div className="photo reveal"><img src="/images/about-hero.jpg" alt="Emmy Branger performing a personalized treatment, Body Shaper System" /></div>
  <div className="reveal">
    <span className="eyebrow">About</span>
    <h1>More Than Treatments.<br /><em>A Personalized Method.</em></h1>
    <p>Since 2017, a personalized methodology built around one belief: no two bodies should ever receive the same treatment.</p>
    <a href="#build" className="btn btn-primary">Build My Blueprint™</a>
  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* OUR STORY */}
<section className="section what-is">
  <span className="eyebrow">Our Story</span>
  <h2>No two bodies should ever receive the same treatment.</h2>
  <p>Body Shaper System™ was created with one belief: no two bodies should ever receive the same treatment. Since 2017, we have specialized in designing personalized body optimization systems that combine advanced technology, strategic planning and continuous progress tracking.</p>
  <p className="thesis">Our mission has never been to perform treatments. Our mission is to build personalized transformation strategies.</p>

  <div className="brand-timeline">
    <div className="tpoint"><span className="yr">2017</span><p>Body Shaper System™ founded in Miami, built around personalized, mobile body contouring.</p></div>
    <div className="tpoint"><span className="yr">2022</span><p>Introduced EMS Sculpt into the technology offering.</p></div>
    <div className="tpoint"><span className="yr">2023</span><p>Added Endospheres® to expand personalized protocols.</p></div>
    <div className="tpoint"><span className="yr">2025</span><p>The Body Blueprint™ evaluation became the complete foundation of every client journey.</p></div>
    <div className="tpoint"><span className="yr">Today</span><p>A complete personalized system — Blueprint, technology, and long-term strategy.</p></div>
  </div>
</section>

{/* MEET EMMY */}
<section className="section" style={{display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '6vw', alignItems: 'center', background: 'var(--beige)'}}>
  <div className="photo reveal" style={{position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: '2px'}}>
    <img src="/images/about-meet.jpg" style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Emmy Branger, founder of Body Shaper System" />
  </div>
  <div className="reveal">
    <span className="eyebrow">Meet Emmy</span>
    <h2 style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '18px 0 22px', lineHeight: '1.2'}}>The specialist behind every strategy.</h2>
    <p style={{fontSize: '16px', color: '#4a443d', maxWidth: '460px', marginBottom: '16px'}}>Emmy has spent years refining a single question: what does this body actually need? That question — asked honestly, before any technology is chosen — is the foundation of every system she designs.</p>
    <p style={{fontSize: '16px', color: '#4a443d', maxWidth: '460px', marginBottom: '30px'}}>Her focus stays on experience, continued education, and an ongoing commitment to personalization over routine.</p>
    <div className="video-frame" style={{maxWidth: '100%', aspectRatio: '16/9', margin: '0'}}>
      <div className="play">
        <div className="play-ring"><svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1L17 10L1 19V1Z" fill="#F5EEE4"/></svg></div>
        <span className="video-caption">(Insert Video)</span>
      </div>
    </div>
  </div>
</section>

{/* WHAT MAKES US DIFFERENT */}
<section className="section">
  <span className="eyebrow reveal" style={{display: 'block', textAlign: 'center'}}>What Makes Us Different</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', textAlign: 'center', margin: '16px 0 0'}}>Not a Med Spa. A Methodology.</h2>

  <div className="diff-grid reveal">
    <div className="diff-card"><div className="n">01</div><h4>Body Blueprint™</h4><p>A personalized evaluation of how your body functions — not just how it looks.</p></div>
    <div className="diff-card"><div className="n">02</div><h4>Personalized Systems™</h4><p>Five curated systems, each designed around a different goal, body and timeline.</p></div>
    <div className="diff-card"><div className="n">03</div><h4>Luxury In-Home Experience™</h4><p>Professional-grade technology, delivered privately and comfortably to you.</p></div>
    <div className="diff-card"><div className="n">04</div><h4>Technology Selection</h4><p>Every technology is chosen deliberately — never applied as a default.</p></div>
    <div className="diff-card"><div className="n">05</div><h4>Progress Tracking</h4><p>Ongoing evaluation ensures the strategy evolves as your body does.</p></div>
    <div className="diff-card"><div className="n">06</div><h4>Long-Term Strategy</h4><p>We design for lasting results — not a single appointment.</p></div>
  </div>
</section>

{/* PHILOSOPHY QUOTE */}
<section className="section" style={{background: 'var(--charcoal)'}}>
  <div className="quote-block reveal">
    <p style={{color: 'var(--ivory)'}}>We don't treat bodies. <em style={{color: 'var(--rose)'}}>We design personalized transformation strategies.</em></p>
    <div className="attrib" style={{color: 'rgba(245,238,228,0.6)'}}>Body Shaper System™</div>
  </div>
</section>

{/* SINCE 2017 STATS */}
<section className="section" style={{textAlign: 'center'}}>
  <span className="eyebrow">Since 2017</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0 0'}}>Years of Personalized Care.</h2>
  <div className="stat-grid reveal">
    <div className="stat-item"><div className="num">7+</div><div className="lbl">Years of Experience</div></div>
    <div className="stat-item"><div className="num">1,500+</div><div className="lbl">Clients Served</div></div>
    <div className="stat-item"><div className="num">500+</div><div className="lbl">Personalized Systems Created</div></div>
    <div className="stat-item"><div className="num">3</div><div className="lbl">Technologies Delivered</div></div>
    <div className="stat-item"><div className="num">60%</div><div className="lbl">Repeat Clients</div></div>
  </div>
</section>

{/* FOLLOW OUR JOURNEY */}
<section className="section journey">
  <span className="eyebrow reveal">Follow Our Journey</span>
  <h2 className="reveal">Instagram</h2>
  <p className="reveal">Behind-the-scenes strategy, real transformations, and everyday education.</p>
  <div className="ig-strip reveal">
    <div className="tile"></div><div className="tile"></div><div className="tile"></div><div className="tile"></div><div className="tile"></div>
  </div>
  <a href="https://instagram.com/bodyshapersystem" className="btn btn-dark-outline reveal">Follow @bodyshapersystem</a>
</section>

{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Let's build your personalized strategy.</h2>
  <div className="actions reveal">
    <a href="/body-blueprint" className="btn btn-primary">Build My Blueprint™</a>
    <a href={WHATSAPP_URL} className="btn btn-dark-outline">Reserve Your Appointment</a>
  </div>
</section>

    </>
  );
}
