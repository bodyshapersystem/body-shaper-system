"use client";

export default function ProgressPhotosPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Visual Proof of Progress</p>
        <h1>progress photos.</h1>
        <p className="portal-page-sub">Track your transformation with before &amp; after comparisons.</p>
      </div>

      <div className="simple-card">
        <h3>Latest Comparison</h3>
        <div className="pp-compare">
          <div className="pp-photo">before · May 1, 2025</div>
          <div className="pp-photo">after · May 15, 2025</div>
        </div>
        <button type="button" className="dt-btn dt-btn-primary" style={{ marginTop: "20px" }}>
          add new photo
        </button>
      </div>
    </div>
  );
}
