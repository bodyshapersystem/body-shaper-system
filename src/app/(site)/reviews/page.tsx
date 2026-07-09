import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reviews",
  description:
    "Trusted since 2017. Hear from Caro and other clients who have trusted Body Shaper System™ to guide their personalized transformation journey.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return (
    <>


{/* HERO */}
<section className="hero reviews-hero" style={{minHeight: '64vh'}}>
  <div className="hero-bg"></div>
  <div className="hero-content">
    <span className="eyebrow" style={{color: 'var(--rose)'}}>Reviews</span>
    <h1>Trusted <em>Since 2017.</em></h1>
    <p>Hundreds of clients have trusted Body Shaper System™ to guide their transformation journey.</p>
  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* FEATURED VIDEO TESTIMONIAL — CARO */}
<section className="section" style={{background: 'var(--charcoal)', textAlign: 'center'}}>
  <span className="eyebrow reveal" style={{display: 'block', color: 'var(--rose)'}}>Featured Story</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', color: 'var(--ivory)', margin: '16px 0 50px'}}>Hear From Caro.</h2>
  <div className="video-frame reveal" style={{marginBottom: '0'}}>
    <div className="play">
      <div className="play-ring"><svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1L17 10L1 19V1Z" fill="#F5EEE4"/></svg></div>
      <span className="video-caption">Caro's Transformation Story</span>
    </div>
  </div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* WRITTEN TESTIMONIALS */}
<section className="section">
  <span className="eyebrow reveal" style={{display: 'block', textAlign: 'center'}}>In Their Own Words</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', textAlign: 'center', margin: '16px 0 0'}}>More Stories, Coming Soon.</h2>

  <div className="testimonial-grid reveal">
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"From the very first Body Blueprint™ appointment, everything felt considered. This was never a generic treatment plan."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Isabella</div>
          <div className="meta">Sculpt Signature™</div>
        </div>
      </div>
    </div>
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"The in-home experience alone made this worth it. Professional, private, and completely tailored to my schedule."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Daniela</div>
          <div className="meta">Mom Reset™</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Join hundreds of women who have trusted Body Shaper System™ since 2017.</h2>
  <div className="actions reveal">
    <a href="/body-blueprint" className="btn btn-primary">Build My Blueprint™</a>
  </div>
</section>

    </>
  );
}
