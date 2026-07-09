"use client";

import { useEffect, useState } from "react";

type CaseStudy = {
  id: string;
  before: string;
  after: string;
  system: string;
  title: string;
  description: string;
  technologies: string[];
  sessions: string;
  timeframe: string;
  notes: string;
};

const CASES: CaseStudy[] = [
  {
    id: "case1",
    before: "/images/transformations/case1-before.jpg",
    after: "/images/transformations/case1-after.jpg",
    system: "Sculpt Start™",
    title: "A First Step, Designed Around Her Body.",
    description:
      "A focused Sculpt Start™ protocol targeting abdominal contouring and skin tightening.",
    technologies: ["Exilis®"],
    sessions: "4 Sessions",
    timeframe: "4 Weeks",
    notes:
      "Client began with a Body Blueprint™ evaluation identifying mild abdominal laxity as the primary focus. Exilis® was selected to support both contouring and skin tightening in a short, first-time protocol.",
  },
  {
    id: "case2",
    before: "/images/transformations/case2-before.jpg",
    after: "/images/transformations/case2-after.jpg",
    system: "Sculpt Signature™",
    title: "Visible Refinement, Built Over Six Sessions.",
    description:
      "Sculpt Signature™ combining Exilis® and Endospheres® for waist and abdomen refinement.",
    technologies: ["Exilis®", "Endospheres®"],
    sessions: "6 Sessions",
    timeframe: "6 Weeks",
    notes:
      "A Sculpt Signature™ system was recommended following the client's Body Blueprint™, combining Exilis® for skin tightening with Endospheres® to support circulation and texture over the treated area.",
  },
  {
    id: "case3",
    before: "/images/transformations/case3-before.jpg",
    after: "/images/transformations/case3-after.jpg",
    system: "Total Body Optimization™",
    title: "A Full Strategy, Not a Single Treatment.",
    description:
      "A Total Body Optimization™ journey combining Exilis® and EMS® for comprehensive midsection results.",
    technologies: ["Exilis®", "EMS®"],
    sessions: "6 Sessions",
    timeframe: "6 Weeks",
    notes:
      "This client's Body Blueprint™ called for a combined approach — Exilis® for contouring and skin quality, paired with EMS® to support muscle tone as part of a broader optimization strategy.",
  },
  {
    id: "case4",
    before: "/images/transformations/case4-before.jpg",
    after: "/images/transformations/case4-after.jpg",
    system: "GLP-1 Reshape™",
    title: "Supporting the Body Through Change.",
    description:
      "GLP-1 Reshape™ pairing Exilis® with Lymphatic Protocols™ to support skin quality and firmness.",
    technologies: ["Exilis®", "Lymphatic Protocols™"],
    sessions: "4 Sessions",
    timeframe: "4 Weeks",
    notes:
      "Designed for a client focused on skin firmness and contouring, this GLP-1 Reshape™ protocol paired Exilis® with Lymphatic Protocols™ to support circulation alongside visible contouring.",
  },
  {
    id: "case5",
    before: "/images/transformations/case5-before.jpg",
    after: "/images/transformations/case5-after.jpg",
    system: "Sculpt Start™",
    title: "Real Change, After Just One Session.",
    description:
      "A single Exilis® session, showing what a Personalized System™ can reveal from the very first appointment.",
    technologies: ["Exilis®"],
    sessions: "1 Session",
    timeframe: "Single Session",
    notes:
      "Some clients notice early changes after their very first session. This result reflects a single Exilis® treatment as part of a Sculpt Start™ system — consistency over subsequent sessions continues to build on results like this.",
  },
];

export default function TransformationsClient() {
  const [active, setActive] = useState<CaseStudy | null>(null);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      {/* HERO */}
      <section className="tf-hero reveal in">
        <h1>real transformations.</h1>
        <p>
          Every Body Blueprint™ is designed differently because every body
          is different.
        </p>
      </section>

      {/* CASES */}
      <div className="tf-grid reveal in">
        {CASES.map((c) => (
          <button key={c.id} className="tf-card" onClick={() => setActive(c)}>
            <div className="tf-card-photo">
              <img src={c.before} alt="Before" />
              <span className="tf-tag">Before</span>
            </div>
            <div className="tf-card-photo">
              <img src={c.after} alt="After" />
              <span className="tf-tag">After</span>
            </div>
            <div className="tf-card-body">
              <span className="sys">{c.system}</span>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <span className="view">
                View Transformation <span>→</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* COMING SOON */}
      <section className="tf-coming reveal in">
        <div className="kicker-line" />
        <h2>more transformations are coming.</h2>
        <p>
          Every week we continue documenting new Body Blueprint™ journeys.
          As our library grows, this page will continue expanding with real
          client transformations and personalized treatment stories.
          <br />
          Stay tuned.
        </p>
        <div className="tf-coming-mark">
          <span className="dot" />
          More Coming Soon
        </div>
      </section>

      {/* MODAL */}
      {active && (
        <div
          className="tf-modal-overlay"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="tf-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="tf-modal-close"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="tf-modal-photos">
              <div className="ph">
                <img src={active.before} alt="Before" />
                <span className="lbl">Before</span>
              </div>
              <div className="ph">
                <img src={active.after} alt="After" />
                <span className="lbl">After</span>
              </div>
            </div>
            <div className="tf-modal-body">
              <span className="sys">{active.system}</span>
              <h3>{active.title}</h3>

              <div className="tf-modal-facts">
                <div>
                  <div className="f-label">Body Blueprint™</div>
                  <div className="f-val">Completed</div>
                </div>
                <div>
                  <div className="f-label">Sessions</div>
                  <div className="f-val">{active.sessions}</div>
                </div>
                <div>
                  <div className="f-label">Timeframe</div>
                  <div className="f-val">{active.timeframe}</div>
                </div>
              </div>

              <div className="tech-tags">
                {active.technologies.map((t) => (
                  <span className="tech-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <p className="notes">{active.notes}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
