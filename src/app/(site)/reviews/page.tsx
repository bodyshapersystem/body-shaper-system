import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Trusted since 2017. Hundreds of clients have trusted Body Shaper System™ to guide their personalized transformation journey.",
};

export default function ReviewsPage() {
  return (
    <>


{/* HERO */}
<section className="hero" style={{minHeight: '64vh'}}>
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

{/* FEATURED TESTIMONIALS */}
<section className="section">
  <span className="eyebrow reveal" style={{display: 'block', textAlign: 'center'}}>Featured Testimonials</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', textAlign: 'center', margin: '16px 0 0'}}>In Their Own Words.</h2>

  <div className="testimonial-grid reveal">
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"(Insert Review) — From the first consultation, everything felt considered. This was never a generic treatment plan."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Client Name</div>
          <div className="meta">Sculpt Signature™ — Miami, FL</div>
        </div>
      </div>
    </div>
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"(Insert Review) — The in-home experience alone made this worth it. Professional, private, and completely tailored."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Client Name</div>
          <div className="meta">Mom Reset™ — Coral Gables, FL</div>
        </div>
      </div>
    </div>
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"(Insert Review) — My Body Blueprint™ explained things about my body no one else had taken the time to evaluate."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Client Name</div>
          <div className="meta">Total Body Optimization™ — Brickell, FL</div>
        </div>
      </div>
    </div>
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="quote">"(Insert Review) — Years of trying different things, and this is the first system that actually felt built for me."</p>
      <div className="who">
        <div className="avatar"></div>
        <div>
          <div className="name">Client Name</div>
          <div className="meta">GLP-1 Balance™ — Kendall, FL</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* VIDEO TESTIMONIALS */}
<section className="section" style={{background: 'var(--charcoal)', textAlign: 'center'}}>
  <span className="eyebrow reveal" style={{display: 'block', color: 'var(--rose)'}}>Video Testimonials</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', color: 'var(--ivory)', margin: '16px 0 50px'}}>Hear It From Our Clients.</h2>
  <div className="video-frame reveal" style={{marginBottom: '0'}}>
    <div className="play">
      <div className="play-ring"><svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1L17 10L1 19V1Z" fill="#F5EEE4"/></svg></div>
      <span className="video-caption">(Insert Video)</span>
    </div>
  </div>
</section>

{/* GOOGLE REVIEWS */}
<section className="section" style={{textAlign: 'center'}}>
  <span className="eyebrow reveal">Google Reviews</span>
  <div className="google-head reveal">
    <span className="google-rating">4.9</span>
    <div>
      <div className="google-stars">★★★★★</div>
      <div style={{fontSize: '12px', color: '#8a8073'}}>Based on Google Reviews</div>
    </div>
  </div>

  <div className="google-strip reveal">
    <div className="google-card">
      <div className="stars">★★★★★</div>
      <p>(Insert Review) A truly personalized process from start to finish. Highly recommend Body Shaper System™.</p>
      <div className="name">— Google Review</div>
    </div>
    <div className="google-card">
      <div className="stars">★★★★★</div>
      <p>(Insert Review) The at-home experience is unmatched. Professional equipment, calm environment, real results.</p>
      <div className="name">— Google Review</div>
    </div>
    <div className="google-card">
      <div className="stars">★★★★★</div>
      <p>(Insert Review) My Blueprint appointment felt more like a consultation with a specialist than a sales pitch.</p>
      <div className="name">— Google Review</div>
    </div>
    <div className="google-card">
      <div className="stars">★★★★★</div>
      <p>(Insert Review) Consistent, communicative, and genuinely invested in my progress. Worth every session.</p>
      <div className="name">— Google Review</div>
    </div>
  </div>

  <div className="reveal"><a href="https://www.google.com/search?q=Body+Shaper+System+Miami+reviews" className="btn btn-dark-outline">Read More Reviews</a></div>
</section>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* LEAVE A REVIEW */}
<section className="section" style={{paddingTop: '0'}}>
  <div className="review-cta-box reveal">
    <h3>Loved your experience?</h3>
    <p>Help future clients by sharing your transformation journey.</p>
    <a href="https://www.google.com/search?q=Body+Shaper+System+Miami+reviews" className="btn btn-primary">Leave a Google Review</a>
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
