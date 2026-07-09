import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JOTFORM_BLUEPRINT_URL, WHATSAPP_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Personalized Body Systems, Delivered to You",
  description:
    "Since 2017, Body Shaper System™ has designed personalized body optimization systems in Miami — built on your unique Body Blueprint™, delivered through luxury in-home treatments.",
};

export default function HomePage() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-bg" />
        <div className="home-hero-monogram" aria-hidden="true">
          <span>B</span>
          <span>S</span>
          <span>S</span>
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
        <div className="blueprint-diagram reveal">
          <Image
            src="/images/body-blueprint-map.png"
            alt="Your Body Blueprint — personalized areas of focus diagram"
            width={420}
            height={420}
            style={{ width: "100%", maxWidth: 420, height: "auto", borderRadius: 2 }}
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

      <section className="transformations section" id="transformations">
        <div className="transformations-head reveal">
          <h2>Transformations</h2>
          <span className="eyebrow">Real Clients. Real Systems.</span>
        </div>
        <div className="gallery reveal">
          <div className="gallery-item">
            <div className="cap">Sculpt Signature™ — 8 Weeks</div>
          </div>
          <div className="gallery-item">
            <div className="cap">GLP-1 Reshape™ — 12 Weeks</div>
          </div>
          <div className="gallery-item">
            <div className="cap">Mom Reset™ — 10 Weeks</div>
          </div>
          <div className="gallery-item">
            <div className="cap">Total Body Optimization™</div>
          </div>
          <div className="gallery-item">
            <div className="cap">Sculpt Start™ — 6 Weeks</div>
          </div>
          <div className="gallery-item">
            <div className="cap">Sculpt Signature™ — 12 Weeks</div>
          </div>
        </div>
        <div className="gallery-cta reveal">
          <Link href="/transformations" className="btn btn-dark-outline">
            View All Transformations
          </Link>
        </div>
      </section>

      <section className="journey section" id="techtalks">
        <span className="eyebrow reveal">@bodyshapersystem</span>
        <h2 className="reveal">Follow the Journey</h2>
        <p className="reveal">
          Explore our latest transformations, educational content and
          behind-the-scenes moments.
        </p>
        <div className="ig-strip reveal">
          <div className="tile" />
          <div className="tile" />
          <div className="tile" />
          <div className="tile" />
          <div className="tile" />
        </div>
        <a
          href="https://instagram.com/bodyshapersystem"
          className="btn btn-dark-outline reveal"
        >
          Follow @bodyshapersystem
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
