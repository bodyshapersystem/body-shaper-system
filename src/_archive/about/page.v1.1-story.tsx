import type { Metadata } from "next";
import { WHATSAPP_URL, JOTFORM_BLUEPRINT_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind Body Shaper System™ — how a private treatment suite in Coconut Grove became a personalized body optimization methodology, founded by Emmy Branger in Miami.",
};

export default function AboutPage() {
  return (
    <>
      {/* TOP — WORDMARK */}
      <section className="about-top">
        <div className="about-wordmark reveal in">
          <span>body</span>
          <span>shaper</span>
          <span>
            system.<sup>™</sup>
          </span>
        </div>
        <div className="about-kicker-rule" />
        <p className="about-subtitle">the story behind body shaper system™</p>
      </section>

      {/* INTRO */}
      <section className="about-intro reveal">
        <p>Every system has a story.</p>
        <p>
          What if body contouring wasn&rsquo;t about selling treatments&hellip;
          but about designing a personalized strategy for every body?
        </p>
        <p>That question became the foundation of everything we do today.</p>
        <p className="plain">
          Body Shaper System™ wasn&rsquo;t created overnight. It was built
          through years of listening, learning, refining, continuous
          education, and believing that no two bodies should ever receive the
          exact same treatment plan.
        </p>
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

      {/* WHERE IT ALL BEGAN */}
      <section className="about-story">
        <div className="about-story-text reveal">
          <span className="year">2017 — Coconut Grove, Miami</span>
          <h2>where it all began</h2>
          <p>
            In 2017, I opened The Beauty Box, a private treatment suite
            inside a salon in Coconut Grove, Miami. It was a small space with
            a simple purpose: helping women feel more confident through
            personalized body and skincare treatments.
          </p>
          <p>
            Very quickly, I realized that treatments alone weren&rsquo;t what
            clients valued most. They were looking for guidance. Someone who
            understood their goals. Someone who educated them. Someone who
            cared about long-term results rather than simply selling another
            treatment.
          </p>
          <p>
            That relationship became the foundation of everything that Body
            Shaper System™ represents today.
          </p>
        </div>
        <div className="about-story-photo reveal">
          <img src="/images/about-story-1.jpg" alt="Emmy Branger, founder of Body Shaper System" />
        </div>
      </section>

      {/* LUXURY IN-HOME EXPERIENCE */}
      <section className="about-story reverse">
        <div className="about-story-text reveal">
          <span className="year">2019</span>
          <h2>the beginning of our luxury in-home experience™</h2>
          <p>In 2019, something unexpected happened. Many of my clients started asking the same question: &ldquo;Can you come to my home?&rdquo;</p>
          <p>
            Some lived farther away. Some had demanding careers. Some had
            young children. Others simply preferred the comfort, privacy and
            convenience of receiving treatments in their own space.
          </p>
          <p>
            What started as occasional house calls quickly became one of the
            most requested parts of my business. Clients felt more relaxed.
            Appointments became more personal. Treatments adapted to their
            lifestyle instead of forcing their lifestyle to adapt to
            appointments.
          </p>
          <p>That philosophy eventually became our signature Luxury In-Home Experience™.</p>
        </div>
        <div className="about-story-photo reveal">
          <img src="/images/about-story-2.jpg" alt="Emmy Branger overlooking Miami" />
        </div>
      </section>

      {/* CREATING A DIFFERENT APPROACH */}
      <section className="about-belief reveal">
        <span className="eyebrow" style={{ display: "block" }}>
          Creating A Different Approach
        </span>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: "clamp(26px,3.2vw,38px)",
            margin: "18px 0 26px",
            color: "var(--charcoal)",
            lineHeight: 1.3,
          }}
        >
          the technology worked. but something still felt incomplete.
        </h2>
        <p className="close" style={{ marginBottom: 18 }}>
          Every client arrived with different goals, different body
          compositions, different lifestyles, different medical histories,
          different expectations — yet the industry often recommended similar
          treatments to everyone. That never felt right.
        </p>
        <p className="close">
          I didn&rsquo;t want to offer individual treatments. I wanted to
          create a methodology. A system. One that evaluated the entire
          person before recommending a solution — built around assessment,
          education, technology, personalization and long-term results.
        </p>
      </section>

      {/* BRAND MARK DIVIDER */}
      <div className="about-brandmark reveal">
        <img src="/images/about-case.jpg" alt="Body Shaper System™ signature case" />
        <p>&ldquo;We don&rsquo;t believe in selling treatments. We believe in building systems.&rdquo;</p>
      </div>

      {/* THE BIRTH OF BODY SHAPER SYSTEM */}
      <section className="about-intro" style={{ paddingTop: 120, paddingBottom: 40 }}>
        <span className="eyebrow reveal" style={{ display: "block", marginBottom: 18 }}>
          2022
        </span>
        <h2
          className="reveal"
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: "clamp(28px,3.6vw,42px)",
            marginBottom: 26,
            color: "var(--charcoal)",
          }}
        >
          the birth of body shaper system™
        </h2>
        <p className="plain reveal">
          In 2022, that vision became Body Shaper System™. What started as
          The Beauty Box evolved into a complete body optimization
          methodology.
        </p>
        <p className="plain reveal">
          Today every client begins with our signature Body Blueprint™ — a
          comprehensive consultation designed to understand your body before
          recommending your personalized system.
        </p>
        <p className="plain reveal" style={{ fontStyle: "italic", fontFamily: "var(--serif)", fontSize: 19, color: "var(--mocha)" }}>
          Because we don&rsquo;t believe in selling treatments. We believe in
          building systems.
        </p>
        <p className="plain reveal">
          Every recommendation. Every technology. Every protocol. Every
          visit. Everything begins by understanding your body first.
        </p>
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

      {/* MEET EMMY */}
      <section className="about-story">
        <div className="about-story-photo reveal">
          <img src="/images/about-meet-emmy.jpg" alt="Emmy Branger wearing the official ORVÉ uniform" />
        </div>
        <div className="about-story-text reveal">
          <span className="eyebrow">Meet Emmy</span>
          <h2>hi, i&rsquo;m emmy branger, founder of body shaper system™.</h2>
          <p>
            For over eleven years, Miami has been home, and helping women
            feel stronger, healthier and more confident has become my
            life&rsquo;s work.
          </p>
          <p>
            My professional background combines fashion design, medical
            assisting, massage therapy, skin care, and advanced education in
            non-invasive body contouring technologies. Each discipline has
            helped shape the philosophy behind Body Shaper System™, allowing
            me to combine aesthetics, anatomy, wellness and personalized
            strategy into every recommendation.
          </p>
          <p>
            I don&rsquo;t see body contouring as a cosmetic procedure. I see
            it as the intersection of science, wellness, movement, aesthetics
            and lifestyle. That perspective is what makes every Body
            Blueprint™ unique.
          </p>
        </div>
      </section>

      {/* MOTHERHOOD */}
      <section className="about-belief reveal" style={{ background: "var(--beige)", maxWidth: "none", padding: "130px 8vw" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <span className="eyebrow" style={{ display: "block" }}>
            Motherhood Changed Everything
          </span>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(26px,3.2vw,36px)",
              margin: "18px 0 26px",
              color: "var(--charcoal)",
              lineHeight: 1.35,
            }}
          >
            the biggest transformation in my life didn&rsquo;t happen inside a treatment room.
          </h2>
          <p className="close" style={{ marginBottom: 18 }}>
            It happened when I became a mother. My daughter, Emma, gave me a
            completely new understanding of the female body — pregnancy,
            postpartum recovery, hormonal changes, learning to reconnect with
            yourself.
          </p>
          <p className="close">
            Those experiences inspired the creation of Mom Reset™, a
            personalized recovery system designed specifically for mothers
            navigating pregnancy recovery and postpartum body restoration.
            Because every season of life deserves a different strategy.
          </p>
        </div>
      </section>

      {/* WHAT WE BELIEVE */}
      <section className="about-belief reveal">
        <span className="eyebrow" style={{ display: "block" }}>
          What We Believe
        </span>
        <ul>
          <li>We don&rsquo;t promise overnight transformations.</li>
          <li>We don&rsquo;t believe in one-size-fits-all treatments.</li>
          <li>We don&rsquo;t believe every body should follow the same protocol.</li>
        </ul>
        <p className="close">
          Instead, we combine <strong style={{ color: "var(--charcoal)", fontStyle: "normal" }}>advanced technology</strong>,{" "}
          <strong style={{ color: "var(--charcoal)", fontStyle: "normal" }}>personalized planning</strong>,{" "}
          <strong style={{ color: "var(--charcoal)", fontStyle: "normal" }}>continuous education</strong> and{" "}
          <strong style={{ color: "var(--charcoal)", fontStyle: "normal" }}>evidence-based strategy</strong> to create
          systems designed around the individual. Because lasting
          transformation doesn&rsquo;t begin with a machine. It begins with
          understanding.
        </p>
      </section>

      {/* OUR PROMISE */}
      <section className="about-promise reveal">
        <p>Every body has a story.</p>
        <p>Every client has different goals.</p>
        <p>Every recommendation should have a purpose.</p>
        <p style={{ marginTop: 18, fontStyle: "italic", fontFamily: "var(--serif)", fontSize: 18, color: "var(--mocha)" }}>
          That&rsquo;s why before we recommend a treatment, we build your Body
          Blueprint™. Then we build your Body Shaper System™.
        </p>
      </section>

      {/* FINAL CTA — reusing the site-wide pattern */}
      <section className="final-cta" id="build">
        <h2 className="reveal">Let&rsquo;s build your personalized strategy.</h2>
        <div className="actions reveal">
          <a href={JOTFORM_BLUEPRINT_URL} className="btn btn-primary">
            Build My Blueprint™
          </a>
          <a href={WHATSAPP_URL} className="btn btn-dark-outline">
            Reserve Your Appointment
          </a>
        </div>
      </section>
    </>
  );
}
