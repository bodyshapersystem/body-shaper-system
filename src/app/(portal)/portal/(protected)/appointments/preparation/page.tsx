import Link from "next/link";

// DRAFT CONTENT — general, non-clinical comfort/logistics guidance
// only. Emmy should review and replace with her own exact wording
// before this is considered final; nothing clinical or treatment-
// specific is asserted here.
export default function PreparationInstructionsPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">before your session</p>
        <h1>preparation.</h1>
        <p className="portal-page-sub">A few simple things to help your session go smoothly.</p>
      </div>

      <div className="simple-card">
        <ul className="prep-list">
          <li>Wear comfortable, loose-fitting clothing you don't mind adjusting during your session.</li>
          <li>Stay hydrated in the hours before your appointment.</li>
          <li>Avoid a heavy meal right before your session.</li>
          <li>If your session is at your home, please have a clean, private space ready (a bedroom or living room area works well).</li>
          <li>Have a charged phone or way to reach your specialist if your address or arrival window needs to change.</li>
        </ul>
        <p className="pay-history-meta" style={{ marginTop: 16 }}>
          Have a specific question about preparing for your treatment? Your specialist is always happy to help.
        </p>
        <Link href="/portal/messages" className="dash-view-btn" style={{ marginTop: 12, display: "inline-block" }}>
          Message Your Specialist
        </Link>
      </div>
    </div>
  );
}
