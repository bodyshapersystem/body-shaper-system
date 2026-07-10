"use client";

export default function MyBlueprintPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Your Personalized Plan</p>
        <h1>my body blueprint™.</h1>
        <p className="portal-page-sub">The complete strategy behind your transformation — created just for you.</p>
      </div>

      <div className="simple-card">
        <h3>Overall Goal</h3>
        <p>Body recomposition &amp; skin tightening</p>
      </div>

      <div className="simple-grid">
        <div className="simple-card">
          <h3>Recommended System</h3>
          <p><strong>Sculpt Signature™</strong></p>
        </div>
        <div className="simple-card">
          <h3>Frequency</h3>
          <p>2 – 3 sessions per week</p>
        </div>
        <div className="simple-card">
          <h3>Estimated Duration</h3>
          <p>8 – 12 weeks</p>
        </div>
      </div>

      <div className="simple-card">
        <h3>Treatments</h3>
        <ul className="simple-list">
          <li>Exilis</li>
          <li>EMS</li>
          <li>Lymphatic Drainage</li>
          <li>Endospheres</li>
        </ul>
      </div>

      <div className="simple-card">
        <h3>Priority Areas</h3>
        <ul className="simple-list">
          <li>Lower abdomen</li>
          <li>Flanks / love handles</li>
          <li>Thighs (inner &amp; outer)</li>
          <li>Back</li>
        </ul>
      </div>
    </div>
  );
}
