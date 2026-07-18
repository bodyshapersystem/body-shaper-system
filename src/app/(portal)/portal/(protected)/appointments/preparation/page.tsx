import Link from "next/link";

// DRAFT CONTENT — general, non-clinical comfort/logistics guidance
// only. Emmy should review and replace with her own exact wording
// before this is considered final; nothing clinical or treatment-
// specific is asserted here. Same content as before, reorganized into
// elegant editorial cards per direction — no hero image (none was
// uploaded for this page; didn't substitute a mockup screenshot).
export default function PreparationInstructionsPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">before your session</p>
        <h1>preparation.</h1>
        <p className="portal-page-sub">A few simple things to help your session go smoothly.</p>
      </div>

      <div className="doc-card-grid">
        <div className="trk-card">
          <span style={{ fontSize: 22 }}>✨</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>Before Your Session</h3>
          <p className="pay-history-meta">A little preparation goes a long way — these small steps help you get the most out of every session.</p>
        </div>

        <div className="trk-card">
          <span style={{ fontSize: 22 }}>🏡</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>At-Home Appointment Checklist</h3>
          <p className="pay-history-meta">Have a clean, private space ready — a bedroom or living room area works well. We bring everything else needed for your session.</p>
        </div>

        <div className="trk-card">
          <span style={{ fontSize: 22 }}>👕</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>What to Wear</h3>
          <p className="pay-history-meta">Wear comfortable, loose-fitting clothing you don't mind adjusting during your session.</p>
        </div>

        <div className="trk-card">
          <span style={{ fontSize: 22 }}>💧</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>Hydration</h3>
          <p className="pay-history-meta">Stay hydrated in the hours before your appointment.</p>
        </div>

        <div className="trk-card">
          <span style={{ fontSize: 22 }}>🍽️</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>Meals</h3>
          <p className="pay-history-meta">Avoid a heavy meal right before your session.</p>
        </div>

        <div className="trk-card">
          <span style={{ fontSize: 22 }}>🕐</span>
          <h3 className="trk-card-title" style={{ marginTop: 8 }}>Arrival Window</h3>
          <p className="pay-history-meta">
            Your exact arrival window is shown on your <Link href="/portal/appointments" style={{ color: "#6B4E3D", textDecoration: "underline" }}>Appointments</Link> page for each upcoming session. Have a charged phone nearby in case your specialist needs to reach you.
          </p>
        </div>
      </div>

      <div className="trk-card" style={{ marginTop: 20 }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <h3 className="trk-card-title" style={{ marginTop: 8 }}>Need Help?</h3>
        <p className="pay-history-meta" style={{ marginBottom: 12 }}>
          Have a specific question about preparing for your treatment? Your specialist is always happy to help.
        </p>
        <Link href="/portal/messages" className="cap-primary-btn" style={{ display: "inline-block", width: "auto", padding: "10px 20px" }}>
          Message Your Specialist
        </Link>
      </div>
    </div>
  );
}
