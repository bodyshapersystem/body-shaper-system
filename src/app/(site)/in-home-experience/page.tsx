import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";
import ServiceAreaMap from "@/components/ServiceAreaMap";

export const metadata: Metadata = buildMetadata({
  title: "Mobile Body Contouring — In-Home Treatments in Miami",
  description:
    "Professional body contouring, skin tightening and cellulite reduction delivered to your home in Miami — Exilis®, Endospheres® and EMS® technology, no clinic visit required.",
  path: "/in-home-experience",
});

export default function InHomeExperiencePage() {
  return (
    <>


{/* HERO */}
<section className="sys-hero-photo" id="top">
  <h1 className="sr-only">
    The In-Home Experience™ — Mobile, At-Home Body Contouring in Miami.
    Expert care, where you are. Premium technology, personalized treatment,
    total convenience.
  </h1>
  <div className="sys-hero-photo-inner">
    <img
      src="/images/inhome-hero-banner.webp"
      alt="Body Shaper System — The In-Home Experience™: expert care, where you are. Premium technology, personalized treatment, total convenience. How it works: we come to you, personalized care, advanced technology, visible results, real confidence."
      fetchPriority="high"
      loading="eager"
      decoding="sync"
    />
  </div>
</section>

<div className="sys-hero-cta-wrap reveal">
  <a href="#build" className="btn btn-primary">Build My Blueprint™</a>
  <a href={WHATSAPP_URL} className="btn btn-dark-outline">Reserve Your Appointment</a>
</div>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* WHAT'S INCLUDED */}
<section className="section" style={{textAlign: 'center'}}>
  <span className="eyebrow reveal">What's Included</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0 50px'}}>Every visit, fully considered.</h2>
  <div className="benefits-grid reveal" style={{textAlign: 'left'}}>
    <div className="benefit-item">Body Blueprint™ Review</div>
    <div className="benefit-item">Professional Equipment Setup</div>
    <div className="benefit-item">Personalized Treatment System</div>
    <div className="benefit-item">Progress Tracking</div>
  </div>
  <div style={{maxWidth: '280px', margin: '1px auto 0'}}>
    <div className="benefit-item" style={{border: '1px solid var(--line)', borderTop: 'none'}}>Luxury Client Experience</div>
  </div>
</section>

{/* SEE THE EXPERIENCE */}
<section className="section" style={{background: 'var(--charcoal)', textAlign: 'center'}}>
  <span className="eyebrow reveal" style={{display: 'block', color: 'var(--rose)'}}>Are You Ready?</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', color: 'var(--ivory)', margin: '16px 0 50px'}}>See The Experience Arrive.</h2>
  <div className="video-frame portrait reveal" style={{margin: '0 auto'}}>
    <video
      controls
      preload="metadata"
      poster="/images/poster-inhome.jpg"
      aria-label="The Body Shaper System In-Home Experience arriving at your door"
    >
      <source src="/videos/inhome-ready.mp4" type="video/mp4" />
    </video>
  </div>
</section>

{/* TECHNOLOGIES */}
<section className="section" style={{background: 'var(--beige)'}}>
  <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
    <span className="eyebrow reveal">Our Technologies</span>
    <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0'}}>Technologies We Bring</h2>
    <p className="reveal" style={{color: '#6a635a', fontSize: '14.5px', lineHeight: 1.7, margin: '0 0 8px'}}>
      Exilis®, Endospheres® and EMS body sculpting — the same non-invasive
      body contouring technology you'd find in a Miami studio, brought
      directly to your home.
    </p>
  </div>
  <div className="tech-grid reveal">
    <div className="tech-card">
      <div className="tech-media" style={{backgroundImage: 'url(\'/images/tech-exilis.webp\')', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="tech-body">
        <h4>Exilis®</h4>
        <p>Radiofrequency technology for skin tightening and contouring.</p>
        <a href="/tech-talks">Learn More</a>
      </div>
    </div>
    <div className="tech-card">
      <div className="tech-media" style={{backgroundImage: 'url(\'/images/tech-endospheres-roller.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="tech-body">
        <h4>Endospheres®</h4>
        <p>Compression microvibration therapy for circulation and tissue quality.</p>
        <a href="/tech-talks">Learn More</a>
      </div>
    </div>
    <div className="tech-card">
      <div className="tech-media" style={{backgroundImage: 'url(\'/images/tech-device-1.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="tech-body">
        <h4>EMS</h4>
        <p>Electrical muscle stimulation for muscle toning, definition and preservation.</p>
        <a href="/tech-talks">Learn More</a>
      </div>
    </div>
    <div className="tech-card">
      <div className="tech-media" style={{backgroundImage: 'url(\'/images/tech-session.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="tech-body">
        <h4>Lymphatic Protocols™</h4>
        <p>Supporting circulation, recovery and fluid balance.</p>
        <a href="/tech-talks">Learn More</a>
      </div>
    </div>
  </div>
</section>

{/* WHY CLIENTS LOVE */}
<section className="section" style={{textAlign: 'center'}}>
  <span className="eyebrow reveal">The Difference</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0 50px'}}>Why Clients Love The In-Home Experience™</h2>
  <div className="benefits-grid reveal">
    <div className="benefit-item">No travel</div>
    <div className="benefit-item">No waiting rooms</div>
    <div className="benefit-item">Private environment</div>
    <div className="benefit-item">Flexible scheduling</div>
    <div className="benefit-item">Professional equipment</div>
    <div className="benefit-item">Personalized attention</div>
    <div className="benefit-item">Luxury experience</div>
  </div>
</section>

{/* SERVICE AREA */}
<section className="section" style={{background: 'var(--beige)', textAlign: 'center'}}>
  <span className="eyebrow reveal">Where We Go</span>
  <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', margin: '16px 0'}}>Service Area</h2>
  <p className="reveal" style={{maxWidth: '480px', margin: '0 auto', color: '#4a443d', fontSize: '15.5px'}}>Serving Greater Miami. Extended areas available. Travel fees may apply depending on location.</p>
  <ServiceAreaMap />
</section>

{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Your transformation begins with understanding your body.</h2>
  <div className="actions reveal">
    <a href={JOTFORM_BLUEPRINT_URL} className="btn btn-primary">Build My Blueprint™</a>
    <a href={WHATSAPP_URL} id="reserve" className="btn btn-dark-outline">Reserve Your Appointment</a>
  </div>
</section>

    </>
  );
}
