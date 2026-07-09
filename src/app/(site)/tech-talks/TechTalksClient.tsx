"use client";

import { useState } from "react";

function TTDecoArc({ className }: { className: string }) {
  return (
    <div className={`tt-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
        <circle cx="100" cy="100" r="98" stroke="#F5EEE4" strokeWidth="0.7" />
        <circle cx="100" cy="100" r="80" stroke="#F5EEE4" strokeWidth="0.7" strokeDasharray="1 7" />
      </svg>
    </div>
  );
}

function TTDecoRing({ className }: { className: string }) {
  return (
    <div className={`tt-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
        <circle cx="50" cy="50" r="48" stroke="#C79E93" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="30" stroke="#C79E93" strokeWidth="0.7" />
      </svg>
    </div>
  );
}

function TTDecoContour({ className }: { className: string }) {
  return (
    <div className={`tt-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 140 60" width="100%" height="100%" fill="none">
        <path d="M0 30C20 10 40 10 60 30C80 50 100 50 120 30C130 20 135 15 140 10" stroke="#6B5240" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

type EduCategory =
  | "all" | "skin" | "body" | "fluid" | "recovery" | "nutrition" | "frequency" | "myths";

const EDU_CATEGORIES: { value: EduCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "skin", label: "Skin & Firmness" },
  { value: "body", label: "Body & Muscle" },
  { value: "fluid", label: "Fluid & Lymphatic" },
  { value: "recovery", label: "Recovery" },
  { value: "nutrition", label: "Nutrition & Hydration" },
  { value: "frequency", label: "Frequency" },
  { value: "myths", label: "Myths vs Facts" },
];

const EDU_ARTICLES: { cat: EduCategory; tag: string; title: string; desc: string; href: string }[] = [
  { cat: "skin", tag: "Endospheres®", title: "Understanding Cellulite", desc: "What it is, why it develops, and why it's completely normal.", href: "#article-cellulite" },
  { cat: "skin", tag: "Exilis®", title: "Skin Tightening", desc: "How collagen works, why it declines, and how radiofrequency supports it.", href: "#article-skin-tightening" },
  { cat: "body", tag: "Exilis® + EMS®", title: "Body Contouring", desc: "Weight loss, fat reduction and muscle definition are not the same thing.", href: "#article-body-contouring" },
  { cat: "body", tag: "EMS®", title: "Muscle Tone", desc: "Muscle size vs. muscle tone, and how EMS® supports activation.", href: "#article-muscle-tone" },
  { cat: "fluid", tag: "Lymphatic Protocols™", title: "Fluid Retention", desc: "Common causes — from hormones to travel — and how lymphatic support helps.", href: "#article-fluid-retention" },
  { cat: "fluid", tag: "Lymphatic Protocols™", title: "Lymphatic Drainage", desc: "A simple overview of your lymphatic system, and who may benefit.", href: "#article-lymphatic-drainage" },
  { cat: "recovery", tag: "Mom Reset™", title: "Postpartum Recovery", desc: "How your body changes after pregnancy, and why care should be personalized.", href: "#article-postpartum" },
  { cat: "recovery", tag: "Aftercare", title: "Compression Garments", desc: "When they help, how they support recovery, and how to choose one.", href: "#article-compression" },
  { cat: "nutrition", tag: "Aftercare", title: "Hydration", desc: "Why water intake affects recovery, skin, muscle function and results.", href: "#article-hydration" },
  { cat: "recovery", tag: "Aftercare", title: "Recovery", desc: "Sleep, movement and consistency are part of body optimization too.", href: "#article-recovery" },
  { cat: "nutrition", tag: "Lifestyle", title: "Nutrition Basics", desc: "Protein, fiber and hydration — without restrictive language.", href: "#article-nutrition" },
  { cat: "body", tag: "Education", title: "Body Composition", desc: "Weight, fat, muscle and water — why the scale isn't the whole story.", href: "#article-body-composition" },
  { cat: "frequency", tag: "Education", title: "Treatment Frequency", desc: "Why consistency — and the right combination — matters more than volume.", href: "#article-frequency" },
  { cat: "myths", tag: "Education", title: "Myths vs Facts", desc: "Separating what's true about body contouring from what's marketing.", href: "#article-myths" },
];

export default function TechTalksClient() {
  const [mainTab, setMainTab] = useState<"technologies" | "education">("technologies");
  const [subTab, setSubTab] = useState<"exilis" | "endospheres" | "ems" | "lymphatic">("exilis");
  const [eduQuery, setEduQuery] = useState("");
  const [eduCategory, setEduCategory] = useState<EduCategory>("all");

  const filteredEduArticles = EDU_ARTICLES.filter((a) => {
    const catMatch = eduCategory === "all" || a.cat === eduCategory;
    const textMatch = (a.tag + " " + a.title + " " + a.desc)
      .toLowerCase()
      .includes(eduQuery.toLowerCase());
    return catMatch && textMatch;
  });

  return (
    <>


{/* HERO */}
<div className="tt-hero-wrap">
  <TTDecoArc className="tt-hero-arc" />
  <TTDecoRing className="tt-hero-ring" />
  <section className="hero" style={{minHeight: '60vh'}}>
    <div className="hero-bg"></div>
    <div className="hero-content">
      <span className="eyebrow" style={{color: 'var(--rose)'}}>Tech Talks™</span>
      <h1>Understand the Technology.<br /><em>Trust the Strategy.</em></h1>
      <p>Learn the science behind every transformation. Every treatment begins with understanding how your body works. At Body Shaper System™, we don't sell individual sessions — we create Personalized Systems™ based on your unique Body Blueprint™.</p>
    </div>
  </section>
</div>

<div className="wave-divider">
  <svg viewBox="0 0 180 40" fill="none"><path d="M0 20C20 5 40 5 60 20C80 35 100 35 120 20C140 5 160 5 180 20" stroke="#6B5240" strokeWidth="1"/></svg>
</div>

{/* TABS */}
<div className="tt-tabs reveal">
  <button className={`tt-tab${mainTab === "technologies" ? " active" : ""}`} onClick={() => setMainTab("technologies")}>Technologies</button>
  <button className={`tt-tab${mainTab === "education" ? " active" : ""}`} onClick={() => setMainTab("education")}>Body Education</button>
</div>

{/* PANEL: TECHNOLOGIES */}
<div id="panel-technologies" className={`tt-panel${mainTab === "technologies" ? " active" : ""}`}>

  <div className="tech-subtabs reveal tt-subtabs-wrap">
    <TTDecoContour className="tt-deco-line" />
    <button className={`tech-subtab${subTab === "exilis" ? " active" : ""}`} onClick={() => setSubTab("exilis")}>Exilis®</button>
    <button className={`tech-subtab${subTab === "endospheres" ? " active" : ""}`} onClick={() => setSubTab("endospheres")}>Endospheres®</button>
    <button className={`tech-subtab${subTab === "ems" ? " active" : ""}`} onClick={() => setSubTab("ems")}>EMS®</button>
    <button className={`tech-subtab${subTab === "lymphatic" ? " active" : ""}`} onClick={() => setSubTab("lymphatic")}>Lymphatic Protocols™</button>
  </div>

  <div id="sub-exilis" className={`tech-subpanel${subTab === "exilis" ? " active" : ""}`}>
  <div className="tech-deep reveal" style={{background: 'var(--ivory)'}}>
    <div className="tech-deep-head">
      <span className="eyebrow">Technology</span>
      <h2>Exilis®</h2>
    </div>

    <div className="tech-hero-media single">
      <div className="ph-block" style={{backgroundImage: 'url(\'/images/tech-exilis.webp\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    </div>

    <div className="tech-copy">
      <h4>What Is Exilis®?</h4>
      <p>Exilis® is an FDA-cleared technology that uses controlled monopolar radiofrequency to safely heat the deeper layers of the skin while protecting the surface.</p>
      <p>The controlled thermal energy stimulates fibroblasts, encouraging the natural production of collagen and elastin. As collagen remodels over time, skin gradually becomes firmer, smoother and tighter.</p>
      <p>In selected areas, the same thermal energy may also support body contouring by complementing the body's natural metabolic processes.</p>
      <p>Exilis® is never treated as a standalone solution. It becomes significantly more effective when incorporated into a Personalized System™ designed through your Body Blueprint™.</p>
    </div>

    <div className="step-flow">
      <div className="step"><div className="num">01</div><div className="step-text"><p>Controlled radiofrequency safely heats the deeper tissue.</p></div></div>
      <div className="step"><div className="num">02</div><div className="step-text"><p>The body responds by stimulating collagen and elastin production.</p></div></div>
      <div className="step"><div className="num">03</div><div className="step-text"><p>Skin gradually remodels naturally.</p></div></div>
      <div className="step"><div className="num">04</div><div className="step-text"><p>Improved firmness, smoother texture and more refined body contours.</p></div></div>
    </div>

    <div style={{textAlign: 'center', marginTop: '60px'}}>
      <span className="eyebrow" style={{display: 'block'}}>Best For</span>
    </div>
    <div className="best-for-grid">
      <div className="best-for-item"><div className="ring">✦</div><span>Skin Tightening</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Postpartum Skin Support</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Mild Skin Laxity</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Abdomen</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Flanks</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Inner Thighs</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Arms</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Jawline</span></div>
    </div>

    <div className="tech-info-split">
      <div>
        <h4>What It Feels Like</h4>
        <p>Most clients describe Exilis® as a warm, relaxing experience similar to a hot stone massage. The level of heat is continuously adjusted to maintain comfort throughout the treatment.</p>
      </div>
      <div>
        <h4>Downtime</h4>
        <p>None. Clients typically return immediately to their normal daily activities. Hydration is recommended after treatment.</p>
      </div>
    </div>

    <div className="tech-faq-wrap">
      <h4>Frequently Asked Questions</h4>
      <div className="tb-faq" style={{marginTop: '0'}}>
        <details><summary>Does Exilis® hurt?</summary><p>Most clients find it comfortable and relaxing. Heat intensity is adjusted throughout the treatment according to individual comfort.</p></details>
        <details><summary>How many sessions do I need?</summary><p>Every recommendation is personalized after completing the Body Blueprint™. Treatment frequency depends on your goals, body composition and Personalized System™.</p></details>
        <details><summary>When will I notice results?</summary><p>Some clients notice early skin firmness, while collagen remodeling continues progressively over the following weeks. Results improve with consistency.</p></details>
        <details><summary>Can I exercise afterwards?</summary><p>Yes. There is no downtime. Hydration is encouraged.</p></details>
        <details><summary>Is Exilis® safe?</summary><p>Yes. Exilis® is FDA-cleared and performed following professional protocols customized to each client.</p></details>
      </div>
    </div>

    <div className="tech-final-cta">
      <h3>Not sure if Exilis® is right for you?</h3>
      <p>Every body responds differently. Start with your personalized Body Blueprint™ and we'll recommend the most effective Personalized System™ for your goals.</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
    </div>
  </div>
  </div>

  <div id="sub-endospheres" className={`tech-subpanel${subTab === "endospheres" ? " active" : ""}`}>
  <div className="tech-deep reveal" style={{background: 'var(--beige)'}}>
    <div className="tech-deep-head">
      <span className="eyebrow">Technology</span>
      <h2>Endospheres®</h2>
    </div>

    <div className="tech-hero-media single">
      <div className="ph-block" style={{backgroundImage: 'url(\'/images/tech-endospheres-roller.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    </div>

    <div className="tech-copy">
      <h4>What Is Endospheres®?</h4>
      <p>Endospheres® uses a patented compressive micro-vibration technology designed to stimulate circulation, support lymphatic movement and improve skin texture.</p>
      <p>The rotating silicone spheres create rhythmic mechanical stimulation that may help reduce the appearance of cellulite while promoting a lighter, smoother feeling in the treated area.</p>
      <p>At Body Shaper System™, Endospheres® is integrated into Personalized Systems™ and frequently combined with complementary technologies to maximize results.</p>
    </div>

    <div className="step-flow">
      <div className="step"><div className="num">01</div><div className="step-text"><p>Mechanical micro-vibration.</p></div></div>
      <div className="step"><div className="num">02</div><div className="step-text"><p>Circulation stimulation.</p></div></div>
      <div className="step"><div className="num">03</div><div className="step-text"><p>Lymphatic support.</p></div></div>
      <div className="step"><div className="num">04</div><div className="step-text"><p>Smoother appearance and improved skin texture.</p></div></div>
    </div>

    <div style={{textAlign: 'center', marginTop: '60px'}}>
      <span className="eyebrow" style={{display: 'block'}}>Best For</span>
    </div>
    <div className="best-for-grid">
      <div className="best-for-item"><div className="ring">✦</div><span>Cellulite Appearance</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Heavy Legs</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Fluid Retention</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Skin Texture</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Recovery</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Lymphatic Support</span></div>
    </div>

    <div className="tech-info-split">
      <div>
        <h4>What It Feels Like</h4>
        <p>Most clients describe Endospheres® as a rhythmic deep massage. Pressure is adjusted based on comfort and treatment goals.</p>
      </div>
      <div>
        <h4>Downtime</h4>
        <p>None. Clients return immediately to normal activities.</p>
      </div>
    </div>

    <div className="tech-faq-wrap">
      <h4>Frequently Asked Questions</h4>
      <div className="tb-faq" style={{marginTop: '0'}}>
        <details><summary>Does Endospheres® hurt?</summary><p>No. It's a firm, rhythmic compression rather than a pinching or painful sensation, and pressure is adjusted to your comfort.</p></details>
        <details><summary>Can it improve the appearance of cellulite?</summary><p>Yes — the micro-vibration stimulates circulation and lymphatic movement, which may reduce the appearance of cellulite over a course of sessions.</p></details>
        <details><summary>Can I combine it with Exilis®?</summary><p>Yes. Endospheres® is frequently paired with Exilis® within a Personalized System™ to address both skin texture and firmness.</p></details>
        <details><summary>How often should I receive treatments?</summary><p>Weekly sessions are typical, though frequency is ultimately determined by your Body Blueprint™ and goals.</p></details>
        <details><summary>When will I notice changes?</summary><p>Some clients notice a lighter, smoother feeling after the first few sessions, with continued improvement over the course of the protocol.</p></details>
      </div>
    </div>

    <div className="tech-final-cta">
      <h3>Not sure which technology is right for you?</h3>
      <p>Every transformation begins with understanding your body. Build your personalized Body Blueprint™ and we'll recommend the right Personalized System™ for your goals.</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
    </div>
  </div>
  </div>

  <div id="sub-ems" className={`tech-subpanel${subTab === "ems" ? " active" : ""}`}>
  <div className="tech-deep reveal" style={{background: 'var(--ivory)'}}>
    <div className="tech-deep-head">
      <span className="eyebrow">Technology</span>
      <h2>EMS®</h2>
    </div>

    <div className="tech-hero-media single">
      <div className="ph-block dark"><span>(Insert Educational Video)</span></div>
    </div>

    <div className="tech-copy">
      <h4>What Is EMS®?</h4>
      <p>EMS — Electrical Muscle Stimulation — uses controlled electrical impulses to activate muscle contractions that closely mimic natural, voluntary contractions.</p>
      <p>These contractions help stimulate muscle fibers that may be difficult to engage through everyday movement alone, supporting muscle tone, strength and body sculpting when incorporated into a personalized treatment strategy.</p>
      <p>EMS® is not a replacement for exercise or a healthy lifestyle — it complements an overall body optimization plan. At Body Shaper System™, EMS® is frequently combined with Exilis®, Endospheres® and Lymphatic Protocols™ for enhanced results.</p>
    </div>

    <div className="step-flow">
      <div className="step"><div className="num">01</div><div className="step-text"><p>Electrical impulses activate targeted muscles.</p></div></div>
      <div className="step"><div className="num">02</div><div className="step-text"><p>Deep muscle contractions occur.</p></div></div>
      <div className="step"><div className="num">03</div><div className="step-text"><p>Muscle stimulation supports tone and strength.</p></div></div>
      <div className="step"><div className="num">04</div><div className="step-text"><p>Integrated into your Personalized System™ for optimal results.</p></div></div>
    </div>

    <div style={{textAlign: 'center', marginTop: '60px'}}>
      <span className="eyebrow" style={{display: 'block'}}>Best For</span>
    </div>
    <div className="best-for-grid">
      <div className="best-for-item"><div className="ring">✦</div><span>Core Strength</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Glutes</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Abdomen</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Muscle Tone</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Postpartum Recovery</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Body Sculpting</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Fitness Support</span></div>
    </div>

    <div className="tech-info-split">
      <div>
        <h4>What It Feels Like</h4>
        <p>Clients typically feel rhythmic muscle contractions similar to an intense workout. Intensity is fully customized and adjusted throughout the session.</p>
      </div>
      <div>
        <h4>Downtime</h4>
        <p>None. Clients return immediately to normal daily activities. Hydration is recommended after treatment.</p>
      </div>
    </div>

    <div className="tech-faq-wrap">
      <h4>Frequently Asked Questions</h4>
      <div className="tb-faq" style={{marginTop: '0'}}>
        <details><summary>Does EMS® replace exercise?</summary><p>No. EMS® complements an active lifestyle but does not replace regular physical activity.</p></details>
        <details><summary>Does EMS® hurt?</summary><p>Most clients describe the sensation as strong muscle contractions rather than pain. Intensity is fully customized.</p></details>
        <details><summary>How many sessions are recommended?</summary><p>Every recommendation is based on your Body Blueprint™ and Personalized System™.</p></details>
        <details><summary>Can EMS® be combined with other technologies?</summary><p>Yes. EMS® is often combined with Exilis®, Endospheres® and Lymphatic Protocols™ depending on your goals.</p></details>
        <details><summary>Who should avoid EMS®?</summary><p>Certain medical conditions or implanted electronic devices may not be suitable for EMS®. Every client is evaluated before treatment to confirm it's the right fit.</p></details>
      </div>
    </div>

    <div className="tech-final-cta">
      <h3>Not sure if EMS® is right for you?</h3>
      <p>Every body has different goals. Let's create a Personalized System™ designed specifically for you.</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
    </div>
  </div>
  </div>

  <div id="sub-lymphatic" className={`tech-subpanel${subTab === "lymphatic" ? " active" : ""}`}>
  <div className="tech-deep reveal" style={{background: 'var(--beige)'}}>
    <div className="tech-deep-head">
      <span className="eyebrow">Technology</span>
      <h2>Lymphatic Protocols™</h2>
    </div>

    <div className="tech-hero-media">
      <div className="ph-block" style={{backgroundImage: 'url(\'/images/tech-session.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
      <div className="ph-block dark"><span>(Insert Educational Video)</span></div>
    </div>

    <div className="tech-copy">
      <h4>What Are Lymphatic Protocols™?</h4>
      <p>Our Lymphatic Protocols™ combine manual techniques, maderotherapy and specialized body contouring technologies depending on each client's Body Blueprint™.</p>
      <p>Their purpose is to support healthy lymphatic flow, reduce temporary fluid retention, improve circulation and enhance overall recovery.</p>
      <p>Every protocol is customized — no two clients receive exactly the same combination.</p>
    </div>

    <div className="step-flow">
      <div className="step"><div className="num">01</div><div className="step-text"><p>Stimulate lymphatic movement.</p></div></div>
      <div className="step"><div className="num">02</div><div className="step-text"><p>Support natural fluid drainage.</p></div></div>
      <div className="step"><div className="num">03</div><div className="step-text"><p>Improve circulation.</p></div></div>
      <div className="step"><div className="num">04</div><div className="step-text"><p>Complement your Personalized System™ and recovery.</p></div></div>
    </div>

    <div style={{textAlign: 'center', marginTop: '60px'}}>
      <span className="eyebrow" style={{display: 'block'}}>Best For</span>
    </div>
    <div className="best-for-grid">
      <div className="best-for-item"><div className="ring">✦</div><span>Fluid Retention</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Postpartum Recovery</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Travel Swelling</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Recovery Support</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Body Contouring Programs</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Circulation Support</span></div>
      <div className="best-for-item"><div className="ring">✦</div><span>Wellness Maintenance</span></div>
    </div>

    <div className="tech-info-split">
      <div>
        <h4>What It Feels Like</h4>
        <p>Gentle. Relaxing. Many clients describe feeling lighter immediately after their session. Pressure and techniques are adjusted according to your individual needs.</p>
      </div>
      <div>
        <h4>Downtime</h4>
        <p>None. Clients may return immediately to their daily routine. Hydration is recommended after every session.</p>
      </div>
    </div>

    <div className="tech-faq-wrap">
      <h4>Frequently Asked Questions</h4>
      <div className="tb-faq" style={{marginTop: '0'}}>
        <details><summary>What is the lymphatic system?</summary><p>It's part of the body's natural fluid management and immune support system, responsible for moving fluid and supporting circulation throughout the body.</p></details>
        <details><summary>Will lymphatic drainage help me lose weight?</summary><p>No — it is not a weight-loss treatment. It helps reduce temporary fluid retention and complements body contouring programs.</p></details>
        <details><summary>How often should I receive lymphatic treatments?</summary><p>Recommendations depend on each client's Body Blueprint™ and Personalized System™.</p></details>
        <details><summary>Can lymphatic treatments be combined with Exilis® or EMS®?</summary><p>Yes. Combination protocols are frequently recommended depending on treatment goals.</p></details>
        <details><summary>Is it relaxing?</summary><p>Most clients describe it as one of the most relaxing parts of their Personalized System™.</p></details>
      </div>
    </div>

    <div style={{textAlign: 'center', marginTop: '60px'}}>
      <span className="eyebrow" style={{display: 'block'}}>Before &amp; After</span>
    </div>
    <div className="ba-gallery">
      <div className="ba-pair"><div className="ph-block"><span>(Insert Before)</span></div><div className="ph-block rose"><span>(Insert After)</span></div></div>
      <div className="ba-pair"><div className="ph-block dark"><span>(Insert Before)</span></div><div className="ph-block"><span>(Insert After)</span></div></div>
      <div className="ba-pair"><div className="ph-block rose"><span>(Insert Before)</span></div><div className="ph-block dark"><span>(Insert After)</span></div></div>
    </div>

    <div className="tech-final-cta">
      <h3>Every body has different recovery needs.</h3>
      <p>Start with your Body Blueprint™ and we'll recommend the right Personalized System™ for your goals.</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
    </div>
  </div>
  </div>

</div>

{/* PANEL: BODY EDUCATION */}

<div id="panel-education" className={`tt-panel${mainTab === "education" ? " active" : ""}`}>
  <section className="section" style={{paddingTop: '80px'}}>
    <span className="eyebrow reveal" style={{display: 'block', textAlign: 'center'}}>Body Education™</span>
    <h2 className="reveal" style={{fontFamily: 'var(--serif)', fontWeight: '400', fontSize: 'clamp(28px,3.6vw,42px)', textAlign: 'center', margin: '16px 0 0'}}>Understand Your Body. Transform With Confidence.</h2>
    <p className="reveal" style={{textAlign: 'center', maxWidth: '560px', margin: '14px auto 0', color: '#4a443d', fontSize: '15.5px'}}>This isn't a blog — it's a curated educational library, connected to the technologies and systems we use.</p>

    <div className="faq-search reveal" style={{marginTop: '44px'}}>
      <input type="text" placeholder="Search a topic…" value={eduQuery} onChange={(e) => setEduQuery(e.target.value)} />
    </div>

    <div className="filter-bar reveal" style={{marginTop: '30px'}}>
      {EDU_CATEGORIES.map((c) => (
        <button
          key={c.value}
          className={`filter-pill edu-filter-pill${eduCategory === c.value ? " active" : ""}`}
          onClick={() => setEduCategory(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>

    <div className="edu-grid reveal">
      {filteredEduArticles.map((a) => (
        <div className="edu-card" key={a.href}>
          <span className="tag">{a.tag}</span>
          <h4>{a.title}</h4>
          <p>{a.desc}</p>
          <a href={a.href} onClick={() => setMainTab("education")}>Read More</a>
        </div>
      ))}
    </div>
    {filteredEduArticles.length === 0 && (
      <p className="faq-empty" style={{ display: "block" }}>No topics match your search.</p>
    )}
  </section>

  {/* ARTICLE 01 */}
  <article id="article-cellulite" className="edu-article">
    <span className="eyebrow">Skin &amp; Firmness</span>
    <h3>Understanding Cellulite</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-endospheres-roller.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Cellulite is simply the way fat, connective tissue and skin interact beneath the surface. It's not a flaw — it's a normal structural characteristic that affects most women, regardless of body type or fitness level.</p>
    <p>Its appearance is influenced by hormones, genetics, connective tissue structure and lifestyle factors like circulation and hydration. Because these factors vary so much from person to person, cellulite can look and respond differently for every client.</p>
    <p>Technologies like Endospheres® stimulate circulation and lymphatic movement, which can visibly improve texture over a course of sessions — always as part of a Personalized System™, never as an isolated fix.</p>
    <div className="edu-related">
      <div>Related Technology<strong>Endospheres®</strong></div>
      <div>Suggested Reading<strong>Lymphatic Drainage</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 02 */}
  <article id="article-skin-tightening" className="edu-article">
    <span className="eyebrow">Skin &amp; Firmness</span>
    <h3>Skin Tightening</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-exilis.webp\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Collagen is the protein responsible for your skin's structure, firmness and elasticity. Naturally, collagen production slows with age — and can decline further after pregnancy or significant weight loss.</p>
    <p>As collagen decreases, skin can begin to feel looser or less resilient. This is a natural process, not a failure of skincare or effort.</p>
    <p>Controlled radiofrequency, like Exilis®, heats the deeper layers of skin to stimulate fibroblasts — the cells responsible for producing new collagen and elastin — encouraging skin to gradually remodel firmer and smoother over time.</p>
    <div className="edu-related">
      <div>Related Technology<strong>Exilis®</strong></div>
      <div>Suggested Reading<strong>Postpartum Recovery</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 03 */}
  <article id="article-body-contouring" className="edu-article">
    <span className="eyebrow">Body &amp; Muscle</span>
    <h3>Body Contouring</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/edu-body-contouring.jpg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Weight loss, fat reduction, body contouring, muscle definition and body composition are often used interchangeably — but they describe very different processes.</p>
    <p>Weight loss reflects the number on a scale. Fat reduction targets specific fat cells. Body contouring shapes and refines the silhouette. Muscle definition builds visible tone. Body composition describes the overall ratio of fat, muscle and water in your body.</p>
    <p>Because each of these addresses something different, contouring is never approached as a single treatment — it's a personalized combination of technologies, chosen specifically for your goals and your Body Blueprint™.</p>
    <div className="edu-related">
      <div>Related Technologies<strong>Exilis® + EMS®</strong></div>
      <div>Suggested Reading<strong>Body Composition</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 04 */}
  <article id="article-muscle-tone" className="edu-article">
    <span className="eyebrow">Body &amp; Muscle</span>
    <h3>Muscle Tone</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-device-1.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Muscle size and muscle tone are not the same. Size refers to how large a muscle is, while tone refers to how firm and defined it feels and appears — even without significant growth.</p>
    <p>EMS® supports muscle activation by triggering deep, involuntary contractions that engage fibers not always reached through everyday movement alone, helping build and maintain tone.</p>
    <p>Movement still matters. EMS® is designed to complement an active lifestyle, not replace it — the two work best together as part of a Personalized System™.</p>
    <div className="edu-related">
      <div>Related Technology<strong>EMS®</strong></div>
      <div>Suggested Reading<strong>Body Composition</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 05 */}
  <article id="article-fluid-retention" className="edu-article">
    <span className="eyebrow">Fluid &amp; Lymphatic</span>
    <h3>Fluid Retention</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-session.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Fluid retention is common, and its causes are often layered — hormones, travel, sedentary work, nutrition and general lifestyle patterns can all contribute to that "puffy" or heavy feeling.</p>
    <p>Because the causes vary so widely, so does the right response. For many clients, lymphatic support can help the body move fluid more efficiently, reducing that temporary heaviness.</p>
    <p>Lymphatic Protocols™ are frequently incorporated into a Personalized System™ specifically to address this — always alongside an understanding of your individual causes and goals.</p>
    <div className="edu-related">
      <div>Related Technology<strong>Lymphatic Protocols™</strong></div>
      <div>Suggested Reading<strong>Lymphatic Drainage</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 06 */}
  <article id="article-lymphatic-drainage" className="edu-article">
    <span className="eyebrow">Fluid &amp; Lymphatic</span>
    <h3>Lymphatic Drainage</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-session.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Your lymphatic system is part of the body's natural fluid management and immune support network — quietly working to move fluid and support circulation throughout the body.</p>
    <p>Lymphatic drainage is often confused with massage, but the two are different. Where massage focuses on general relaxation, drainage is a targeted technique focused specifically on supporting lymphatic flow.</p>
    <p>Clients dealing with fluid retention, recovering from other treatments, or simply looking to feel lighter often benefit most from this protocol.</p>
    <div className="edu-related">
      <div>Related Technology<strong>Lymphatic Protocols™</strong></div>
      <div>Suggested Reading<strong>Fluid Retention</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 07 */}
  <article id="article-postpartum" className="edu-article">
    <span className="eyebrow">Recovery</span>
    <h3>Postpartum Recovery</h3>
    <div className="ph-block art-media dark"><div className="art-graphic"><span className="ring-lg">✦</span><span className="label" style={{color: 'var(--ivory)'}}>Mom Reset™</span></div></div>
    <p>Pregnancy changes the body in ways that are entirely individual — skin elasticity, core strength, fluid balance and recovery timelines all vary from client to client.</p>
    <p>Some clients experience skin laxity, others notice core separation or fluid retention, and recovery pace differs for everyone. This is why postpartum care should never follow a generic template.</p>
    <p>A personalized approach — built on your specific Body Blueprint™ — accounts for where you are in your recovery, not just where you were before.</p>
    <div className="edu-related">
      <div>Related System<strong>Mom Reset™</strong></div>
      <div>Suggested Reading<strong>Skin Tightening</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 08 */}
  <article id="article-compression" className="edu-article">
    <span className="eyebrow">Recovery</span>
    <h3>Compression Garments</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/edu-compression.jpg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Compression garments support circulation and help manage swelling following certain treatments, making them a helpful part of recovery for many Personalized Systems™.</p>
    <p>Worn correctly, compression can support smoother, more comfortable healing between sessions — though the right garment and duration depend on your specific protocol.</p>
    <p>Choosing one isn't one-size-fits-all either — fit, compression level and garment type all matter, which is why we guide clients individually.</p>
    <p style={{fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--taupe)', marginTop: '24px'}}>ORVÉ — Coming Soon</p>
    <div className="edu-related">
      <div>Related Reading<strong>Recovery</strong></div>
      <div>Suggested Reading<strong>Hydration</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 09 */}
  <article id="article-hydration" className="edu-article">
    <span className="eyebrow">Nutrition &amp; Hydration</span>
    <h3>Hydration</h3>
    <div className="ph-block art-media rose"><div className="art-graphic"><span className="ring-lg">◯</span><span className="label">Hydration</span></div></div>
    <p>Hydration plays a quiet but essential role in nearly every part of your results — recovery, skin quality, muscle function and how your body responds to treatment.</p>
    <p>Well-hydrated tissue responds more predictably to technologies like Exilis® and Endospheres®, and proper hydration supports the body's natural processes as it recovers between sessions.</p>
    <p>We recommend hydration as a simple, consistent habit that supports your Personalized System™ from the inside out.</p>
    <div className="edu-related">
      <div>Related Reading<strong>Recovery</strong></div>
      <div>Suggested Reading<strong>Nutrition Basics</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 10 */}
  <article id="article-recovery" className="edu-article">
    <span className="eyebrow">Recovery</span>
    <h3>Recovery</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/tech-session.jpeg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Recovery is an active part of body optimization, not an afterthought. Sleep, movement, nutrition, hydration and consistency all shape how your body responds between sessions.</p>
    <p>Rushing recovery — or ignoring it altogether — can slow progress regardless of which technologies are used. A well-supported body simply responds better.</p>
    <p>Your Personalized System™ always considers recovery alongside treatment, not separately from it.</p>
    <div className="edu-related">
      <div>Related Reading<strong>Hydration</strong></div>
      <div>Suggested Reading<strong>Treatment Frequency</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 11 */}
  <article id="article-nutrition" className="edu-article">
    <span className="eyebrow">Nutrition &amp; Hydration</span>
    <h3>Nutrition Basics</h3>
    <div className="ph-block art-media"><div className="art-graphic"><span className="ring-lg">✦</span><span className="label">Nutrition</span></div></div>
    <p>Good nutrition doesn't need to be complicated or restrictive. Protein supports muscle and tissue repair, fiber supports digestion, and consistent hydration supports nearly everything else.</p>
    <p>We encourage balanced, sustainable habits over strict rules — nutrition should support your results, not add stress to your routine.</p>
    <p>Body Shaper System™ does not replace nutritional counseling. For personalized dietary guidance, we always recommend working alongside a qualified nutrition professional.</p>
    <div className="edu-related">
      <div>Related Reading<strong>Hydration</strong></div>
      <div>Suggested Reading<strong>Body Composition</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 12 */}
  <article id="article-body-composition" className="edu-article">
    <span className="eyebrow">Body &amp; Muscle</span>
    <h3>Body Composition</h3>
    <div className="ph-block art-media" style={{backgroundImage: 'url(\'/images/blueprint-hero.jpg\')', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent'}}></div>
    <p>Weight, fat, muscle and water are four different things — yet the scale only measures one number that reflects all of them combined.</p>
    <p>Two people can weigh exactly the same and look completely different, because their ratio of fat to muscle to water is different. This is why the scale rarely tells the full story of your progress.</p>
    <p>We look at body composition — not just weight — when evaluating your Body Blueprint™ and tracking progress throughout your Personalized System™.</p>
    <div className="edu-related">
      <div>Related Reading<strong>Body Contouring</strong></div>
      <div>Suggested Reading<strong>Muscle Tone</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 13 */}
  <article id="article-frequency" className="edu-article">
    <span className="eyebrow">Frequency</span>
    <h3>Treatment Frequency</h3>
    <div className="ph-block art-media dark"><div className="art-graphic"><span className="ring-lg">◐</span><span className="label" style={{color: 'var(--ivory)'}}>Consistency</span></div></div>
    <p>Consistency matters more than intensity. Spacing sessions appropriately gives your body time to respond and remodel between treatments — rushing frequency doesn't accelerate results.</p>
    <p>Treatment frequency also varies significantly from client to client, based on goals, body composition and the specific technologies involved.</p>
    <p>This is exactly why every Personalized System™ includes its own recommended schedule — never a generic, one-size-fits-all calendar.</p>
    <div className="edu-related">
      <div>Related Reading<strong>Recovery</strong></div>
      <div>Suggested Reading<strong>Myths vs Facts</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

  {/* ARTICLE 14 — MYTHS VS FACTS */}
  <article id="article-myths" className="edu-article">
    <span className="eyebrow">Education</span>
    <h3>Myths vs Facts</h3>
    <div className="myth-grid">
      <div className="myth-card myth"><div className="lbl">Myth</div><p>Body contouring replaces exercise.</p></div>
      <div className="myth-card fact"><div className="lbl">Fact</div><p>Body contouring complements a healthy lifestyle — it doesn't replace it.</p></div>
      <div className="myth-card myth"><div className="lbl">Myth</div><p>More treatments always mean better results.</p></div>
      <div className="myth-card fact"><div className="lbl">Fact</div><p>The right combination matters more than the number of sessions.</p></div>
      <div className="myth-card myth"><div className="lbl">Myth</div><p>Cellulite only happens if you're overweight.</p></div>
      <div className="myth-card fact"><div className="lbl">Fact</div><p>Cellulite affects people of many body types.</p></div>
      <div className="myth-card myth"><div className="lbl">Myth</div><p>Every client should receive the same protocol.</p></div>
      <div className="myth-card fact"><div className="lbl">Fact</div><p>Every Body Blueprint™ is unique.</p></div>
    </div>
    <div className="edu-related">
      <div>Suggested Reading<strong>Treatment Frequency</strong></div>
      <div>Suggested Reading<strong>Body Contouring</strong></div>
    </div>
    <div className="edu-cta">
      <p style={{fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mocha)', fontSize: '18px'}}>Ready to create a Personalized System™ designed specifically for your body?</p>
      <a href="/body-blueprint" className="btn btn-primary">Build My Body Blueprint™</a>
      <a href="#panel-education" className="back-to-library" onClick={() => { setMainTab("education"); setEduCategory("all"); }}>Back to Body Education™</a>
    </div>
  </article>

</div>


{/* FINAL CTA */}
<section className="final-cta" id="build">
  <h2 className="reveal">Every technology, chosen for a reason.</h2>
  <div className="actions reveal">
    <a href="/body-blueprint" className="btn btn-primary">Build My Blueprint™</a>
  </div>
</section>

    </>
  );
}
