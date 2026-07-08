"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };
type FaqCategory = { title: string; items: FaqItem[] };

const FAQ_DATA: FaqCategory[] = [
  {
    title: "Getting Started",
    items: [
      { q: "What is the Body Blueprint™?", a: "It's the personalized evaluation process we use to understand your goals, body composition, lifestyle and priorities before recommending a Personalized System™ — never before." },
      { q: "Why don't you recommend the same treatment for everyone?", a: "Because no two bodies are identical. Two clients with the same goal can require completely different strategies — that's the entire philosophy behind Body Shaper System™." },
      { q: "How do I know which system is right for me?", a: "Every recommendation begins with your Body Blueprint™. It's how we determine the system, technologies and timeline that make sense for your body." },
    ],
  },
  {
    title: "Technologies",
    items: [
      { q: "Does Exilis® hurt?", a: "No. Most clients describe it as a warm, relaxing sensation, similar to a hot stone massage." },
      { q: "Does EMS® replace exercise?", a: "No. EMS® complements movement and an active lifestyle — it doesn't replace regular physical activity." },
      { q: "Does Endospheres® hurt?", a: "No. It feels similar to a deep, rhythmic massage, with pressure adjusted to your comfort." },
      { q: "Can I combine multiple technologies?", a: "Yes — most clients receive a Personalized System™ that combines two or more technologies based on their Body Blueprint™." },
      { q: "Are treatments safe?", a: "Yes. Every client is professionally evaluated, and every protocol is individualized to that evaluation before any technology is used." },
    ],
  },
  {
    title: "Results",
    items: [
      { q: "When will I notice changes?", a: "Progress is gradual. Some clients notice early changes after their first few sessions, while collagen remodeling and other results continue progressively with consistency." },
      { q: "How long do results last?", a: "This depends on maintenance — lifestyle, hydration and activity all play a role. We'll guide you on this as part of your strategy." },
      { q: "Can results be guaranteed?", a: "No. Every body responds differently, which is exactly why we build a Personalized System™ instead of promising a fixed outcome." },
    ],
  },
  {
    title: "The In-Home Experience™",
    items: [
      { q: "How does the in-home experience work?", a: "Professional-grade equipment is brought directly to your home. The experience is designed to be comfortable, private and convenient." },
      { q: "How much space do I need?", a: "Approximately the space of a yoga mat is all that's required." },
      { q: "Do you bring everything?", a: "Yes — equipment, supplies and professional setup are all included." },
      { q: "Is my treatment private?", a: "Absolutely. Every appointment is performed in the comfort and privacy of your own home." },
    ],
  },
  {
    title: "Scheduling",
    items: [
      { q: "How often should I schedule treatments?", a: "Every Personalized System™ includes its own recommended schedule, determined by your Body Blueprint™." },
      { q: "Can I travel during treatment?", a: "Yes. We'll help you adjust your schedule around travel whenever possible." },
      { q: "What happens if I miss an appointment?", a: "We simply reschedule. We ask for at least 24 hours' notice so we can offer the time to another client." },
    ],
  },
  {
    title: "Payments",
    items: [
      { q: "Is my deposit applied?", a: "Yes — your reservation deposit is applied directly toward your first session." },
      { q: "Do you offer payment plans?", a: "Yes, available on select systems. Ask your specialist for current options." },
      { q: "Which payment methods do you accept?", a: "We accept all major credit and debit cards, along with select digital payment methods. Your specialist can confirm what works best for you." },
    ],
  },
];

export default function FaqClient() {
  const [query, setQuery] = useState("");

  const filtered = FAQ_DATA.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.q.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ minHeight: "50vh" }}>
        <div className="hero-bg"></div>
        <div className="hero-content">
          <span className="eyebrow" style={{ color: "var(--rose)" }}>FAQ</span>
          <h1>Questions, <em>Answered.</em></h1>
          <p>Everything you need to know before beginning your Body Blueprint™.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "70px" }}>
        <div className="faq-search reveal">
          <input
            type="text"
            placeholder="Search a question…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {filtered.length === 0 && (
          <p className="faq-empty" style={{ display: "block" }}>No questions match your search.</p>
        )}

        {filtered.map((cat) => (
          <div className="faq-cat reveal" data-cat key={cat.title}>
            <h3>{cat.title}</h3>
            <div className="kicker-line left"></div>
            {cat.items.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>
                  {item.q}
                  <span className="ic">+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" id="build" style={{ paddingTop: "0" }}>
        <h2 className="reveal">Ready to begin?</h2>
        <p
          className="reveal"
          style={{
            fontFamily: "var(--sans)",
            fontSize: "16px",
            color: "#4a443d",
            maxWidth: "480px",
            margin: "-20px auto 36px",
          }}
        >
          Your body deserves more than a one-size-fits-all solution. Let&rsquo;s build a Personalized System™ designed around you.
        </p>
        <div className="actions reveal">
          <a href="/body-blueprint" className="btn btn-primary">
            Build My Body Blueprint™
          </a>
        </div>
      </section>
    </>
  );
}
