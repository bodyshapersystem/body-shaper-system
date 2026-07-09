import type { Metadata } from "next";
import Link from "next/link";
import { INSTAGRAM_URL, JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Personalized Body Systems, Delivered to You",
  description:
    "Since 2017, Body Shaper System™ has designed personalized body optimization systems in Miami — built on your unique Body Blueprint™, delivered through luxury in-home treatments.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-bg" />
        <div className="home-hero-monogram" aria-hidden="true">
          <img src="/images/bss-wordmark.png" alt="" />
        </div>
        <div className="home-hero-deco home-hero-deco-ring" aria-hidden="true">
          <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
            <circle cx="50" cy="50" r="48" stroke="#C79E93" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="32" stroke="#C79E93" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="home-hero-deco home-hero-deco-arc" aria-hidden="true">
          <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
            <circle cx="100" cy="100" r="98" stroke="#C79E93" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="80" stroke="#C79E93" strokeWidth="0.6" strokeDasharray="1 7" />
          </svg>
        </div>
        <div className="hero-tag">Since 2017 — Miami, Florida</div>
        <div className="hero-content reveal">
          <h1>
            Personalized Body Systems.
            <br />
            <em>Delivered to You.</em>
          </h1>
          <p>
            Advanced body contouring, personalized strategy, and luxury in-home
            treatments designed around your unique Body Blueprint™. Every
            transformation begins with understanding your body.
          </p>
          <div className="hero-actions">
            <a href="#build" className="btn btn-primary">
              Build My Blueprint™
            </a>
            <a href={WHATSAPP_URL} className="btn btn-outline">
              Chat with a Specialist
            </a>
          </div>
        </div>
        <div className="scroll-cue">
          <span className="line" /> Scroll
        </div>
      </section>

      <div className="home-whatis-wrap">
        <div className="home-deco" style={{top: '20px', right: '6vw', width: '130px', height: '50px'}} aria-hidden="true">
          <svg viewBox="0 0 140 60" width="100%" height="100%" fill="none"><path d="M0 30C20 10 40 10 60 30C80 50 100 50 120 30C130 20 135 15 140 10" stroke="#6B5240" strokeWidth="0.6"/></svg>
        </div>
        <div className="home-deco" style={{top: '60px', left: '4vw'}} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="home-star"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="currentColor"/></svg>
        </div>
      <section className="section what-is">
        <span className="eyebrow reveal">What is Body Shaper System™</span>
        <h2 className="reveal">
          A personalized approach to non-invasive body contouring.
        </h2>
        <p className="reveal">
          Instead of recommending the same treatment to everyone, we begin with
          a comprehensive Body Blueprint™ designed to understand your body,
          your goals and your lifestyle.
        </p>
        <p className="reveal">
          From there, we create a personalized system built specifically for
          you.
        </p>
        <p className="thesis reveal">
          Since 2017, our mission has remained the same — every body deserves
          its own strategy.
        </p>

        <div className="video-frame reveal">
          <div className="play">
            <div className="play-ring">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M1 1L15 9L1 17V1Z" fill="#F5EEE4" />
              </svg>
            </div>
            <span className="video-caption">
              What is Body Shaper System™? — Emmy Branger, Founder
            </span>
          </div>
          <div className="subtitle-demo">
            &ldquo;Every body deserves its own strategy.&rdquo;
          </div>
        </div>
      </section>
      </div>

      <div className="wave-divider">
        <svg viewBox="0 0 180 40" fill="none">
          <path
            d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20"
            stroke="#6B5240"
            strokeWidth="1"
          />
        </svg>
      </div>

      <section className="blueprint section" id="blueprint">
        <div className="blueprint-diagram reveal" style={{overflow: "hidden", borderRadius: 2}}>
          <img
            src="/images/tech-exilis.webp"
            alt="Exilis® treatment session — part of a Personalized System™"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="blueprint-copy reveal">
          <span className="eyebrow">The Body Blueprint™</span>
          <h2>Every system begins with a blueprint, not a guess.</h2>
          <p>
            Before any treatment, we map your goals, your body&apos;s history
            and your lifestyle into a single personalized strategy — the
            foundation for every session that follows.
          </p>
          <div className="blueprint-steps">
            <div className="blueprint-step">
              <span className="n">I</span>
              <span className="t">
                Discovery
                <small>A short conversation about your goals and timeline</small>
              </span>
            </div>
            <div className="blueprint-step">
              <span className="n">II</span>
              <span className="t">
                Evaluation
                <small>A full understanding of your body and lifestyle</small>
              </span>
            </div>
            <div className="blueprint-step">
              <span className="n">III</span>
              <span className="t">
                Your System
                <small>A personalized protocol, built to evolve with you</small>
              </span>
            </div>
          </div>
          <Link href="/body-blueprint" className="btn btn-dark-outline">
            Learn More
          </Link>
        </div>
      </section>

      <div className="home-inhome-wrap">
        <div className="home-deco" style={{bottom: '30px', right: '5vw'}} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="home-star"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="currentColor"/></svg>
        </div>
      <section className="inhome" id="inhome">
        <div className="inhome-media reveal">
          <div className="frame-inner" />
          <div className="play-ring">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M1 1L15 9L1 17V1Z" fill="#F5EEE4" />
            </svg>
          </div>
        </div>
        <div className="inhome-copy reveal">
          <span className="eyebrow" style={{ color: "#C79E93" }}>
            The In-Home Experience™
          </span>
          <h2>Luxury body contouring, delivered directly to your home.</h2>
          <p>
            Professional equipment. Personalized care. Advanced technology. An
            elevated experience designed entirely around your schedule.
          </p>
          <div className="feature-row">
            <span className="f">Professional Equipment</span>
            <span className="f">Personalized Care</span>
            <span className="f">Advanced Technology</span>
          </div>
          <Link href="/in-home-experience" className="btn btn-outline">
            Explore The Experience
          </Link>
        </div>
      </section>
      </div>

      <section className="transformations section" id="transformations">
        <div className="transformations-head reveal">
          <h2>Transformations</h2>
          <span className="eyebrow">Real Clients. Real Systems.</span>
        </div>
        <div className="gallery gallery-real reveal">
          <div className="gallery-real-item">
            <div className="gallery-real-photos">
              <img src="/images/transformations/case3-before.jpg" alt="Before" />
              <img src="/images/transformations/case3-after.jpg" alt="After" />
            </div>
            <div className="cap">Total Body Optimization™ — 6 Weeks</div>
          </div>
          <div className="gallery-real-item">
            <div className="gallery-real-photos">
              <img src="/images/transformations/case1-before.jpg" alt="Before" />
              <img src="/images/transformations/case1-after.jpg" alt="After" />
            </div>
            <div className="cap">Sculpt Start™ — 4 Weeks</div>
          </div>
        </div>
        <div className="gallery-cta reveal">
          <Link href="/transformations" className="btn btn-dark-outline">
            View All Transformations
          </Link>
        </div>
      </section>

      <section className="journey section" id="techtalks">
        <span className="eyebrow reveal">@bodyshapersystem_mia</span>
        <h2 className="reveal">Follow the Journey</h2>
        <p className="reveal">
          Follow our transformations, Body Talks™, technology education,
          client results and behind-the-scenes moments from Body Shaper
          System™.
        </p>
        <div className="ig-strip reveal">
          <a href={INSTAGRAM_URL} className="tile">
            <img src="/images/ig1-bodytalks.jpg" alt="Body Talks™ — why one treatment isn't enough" />
          </a>
          <a href={INSTAGRAM_URL} className="tile">
            <img src="/images/ig2-plant-emmy.jpg" alt="Emmy Branger with the Endospheres® device" />
          </a>
          <a href={INSTAGRAM_URL} className="tile">
            <img src="/images/ig3-notmassage.jpg" alt="This isn't a massage. It's technology." />
          </a>
          <a href={INSTAGRAM_URL} className="tile">
            <img src="/images/ig4-hormonas.jpg" alt="Hormonas de la Felicidad — Body Shaper System" />
          </a>
          <a href={INSTAGRAM_URL} className="tile">
            <img src="/images/ig5-exilis-hand.jpg" alt="Exilis® session in progress" />
          </a>
        </div>
        <a
          href={INSTAGRAM_URL}
          className="btn btn-dark-outline reveal"
        >
          Follow @bodyshapersystem_mia
        </a>
      </section>

      <section className="final-cta" id="build">
        <h2 className="reveal">
          Ready to discover what your body truly needs?
        </h2>
        <div className="actions reveal">
          <a href={JOTFORM_BLUEPRINT_URL} className="btn btn-primary">
            Build My Blueprint™
          </a>
          <a href={WHATSAPP_URL} className="btn btn-dark-outline">
            Chat with a Specialist
          </a>
        </div>
      </section>
    </>
  );
}
