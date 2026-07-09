"use client";

import { useEffect, useState } from "react";

const TOTAL_STEPS = 5;

export default function ClientWelcomePage() {
  const [step, setStep] = useState(1);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (step === 5) {
      const t = setTimeout(() => setBarWidth((25 / 150) * 100), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  function goTo(n: number) {
    setStep(n);
    if (n === 5) {
      window.localStorage.setItem("bss_rewards_unlocked", "1");
    }
    window.scrollTo(0, 0);
  }

  return (
    <>
      <div className="onb-topbar">
        <span className="logo">body shaper system™</span>
      </div>
      <div className="onb-dots">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <span key={n} className={step === n ? "active" : ""} />
        ))}
      </div>

      {/* SCREEN 1: WELCOME */}
      <div className={`onb-screen${step === 1 ? " active" : ""}`} id="screen-1">
        <div className="ph-block dark welcome-photo">
          <span>(Insert Lifestyle Welcome Photo)</span>
        </div>
        <h1>Welcome.</h1>
        <p>
          You&rsquo;ve officially joined the Body Shaper System™ client experience.
          Everything from this point forward has been designed to support your
          transformation with clarity, personalization and care.
        </p>
        <div className="onb-actions">
          <button className="btn btn-primary" onClick={() => goTo(2)}>
            Continue
          </button>
        </div>
      </div>

      {/* SCREEN 2: YOUR JOURNEY */}
      <div className={`onb-screen${step === 2 ? " active" : ""}`} id="screen-2">
        <span className="eyebrow">Your Journey</span>
        <div className="journey-timeline">
          <div className="jstep complete">
            <div className="jnum">✓</div>
            <div className="jtext">
              <h4>Complete Your Body Blueprint™</h4>
              <span>Complete</span>
            </div>
          </div>
          <div className="jstep complete">
            <div className="jnum">✓</div>
            <div className="jtext">
              <h4>Personalized System™</h4>
              <span>Complete</span>
            </div>
          </div>
          <div className="jstep">
            <div className="jnum">03</div>
            <div className="jtext">
              <h4>Client Guide</h4>
              <span>Up Next</span>
            </div>
          </div>
          <div className="jstep">
            <div className="jnum">04</div>
            <div className="jtext">
              <h4>Prepare Your Experience</h4>
              <span>Upcoming</span>
            </div>
          </div>
          <div className="jstep">
            <div className="jnum">05</div>
            <div className="jtext">
              <h4>First Appointment</h4>
              <span>Upcoming</span>
            </div>
          </div>
          <div className="jstep">
            <div className="jnum">06</div>
            <div className="jtext">
              <h4>Transformation Journey</h4>
              <span>Upcoming</span>
            </div>
          </div>
        </div>
        <div className="onb-actions">
          <button className="btn btn-primary" onClick={() => goTo(3)}>
            Continue
          </button>
        </div>
      </div>

      {/* SCREEN 3: CLIENT GUIDE */}
      <div className={`onb-screen${step === 3 ? " active" : ""}`} id="screen-3">
        <div style={{ textAlign: "center" }}>
          <span className="eyebrow">Client Guide</span>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 400,
              fontSize: "clamp(28px,3.6vw,40px)",
              margin: "16px 0 0",
            }}
          >
            Everything You Need to Know.
          </h2>
        </div>
        <div className="guide-grid">
          <div className="guide-card">
            <div className="ph-block">
              <span>(Insert Home Visit Photo)</span>
            </div>
            <h4>What to Expect</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block dark">
              <span>(Insert Lifestyle Photo)</span>
            </div>
            <h4>Preparing Your Home</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block rose">
              <span>(Insert Lifestyle Photo)</span>
            </div>
            <h4>Hydration</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block">
              <span>(Insert Lifestyle Photo)</span>
            </div>
            <h4>Clothing</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block dark">
              <span>(Insert Treatment Photo)</span>
            </div>
            <h4>During Your Session</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block">
              <span>(Insert Treatment Photo)</span>
            </div>
            <h4>After Your Session</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block rose">
              <span>(Insert Lifestyle Photo)</span>
            </div>
            <h4>Scheduling</h4>
          </div>
          <div className="guide-card">
            <div className="ph-block">
              <span>(Insert Photo)</span>
            </div>
            <h4>Frequently Asked Questions</h4>
          </div>
        </div>
        <div className="onb-actions">
          <button className="btn btn-primary" onClick={() => goTo(4)}>
            Continue
          </button>
        </div>
      </div>

      {/* SCREEN 4: PREPARE YOUR EXPERIENCE */}
      <div className={`onb-screen${step === 4 ? " active" : ""}`} id="screen-4">
        <span className="eyebrow">Prepare Your Experience</span>
        <p style={{ marginTop: 20 }}>
          Before your first appointment, we&rsquo;d like to learn a little more
          about you to ensure the best possible experience.
        </p>
        <p>
          This short evaluation allows us to personalize your treatments and
          prepare everything before arriving at your home.
        </p>
        <div className="onb-actions">
          <button className="btn btn-primary" onClick={() => goTo(5)}>
            Complete Evaluation
          </button>
          <div className="future-note">(Future Form Integration)</div>
        </div>
      </div>

      {/* SCREEN 5: UNLOCK */}
      <div className={`onb-screen${step === 5 ? " active" : ""}`} id="screen-5">
        <div className="spark">✨</div>
        <h2>You&rsquo;ve Unlocked Client Access</h2>
        <div className="credit-reveal">+25</div>
        <div className="credit-label">Body Credits™ — Welcome Gift</div>
        <div className="credit-bar-wrap">
          <div className="credit-bar-track">
            <div className="credit-bar-fill" style={{ width: `${barWidth}%` }} />
          </div>
          <div className="credit-nums">
            <span>25</span>
            <span>150 Body Credits™</span>
          </div>
        </div>
        <p className="note">
          Your first Blueprint Privilege™ unlocks at 150 Body Credits™.
        </p>
        <div className="onb-actions">
          <a href="/client-dashboard" className="btn btn-light-outline">
            Continue to Dashboard
          </a>
        </div>
      </div>
    </>
  );
}
