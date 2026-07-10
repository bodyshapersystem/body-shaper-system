"use client";

export default function PortalDashboardPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Welcome back, Adriana</p>
        <h1>your journey hub.</h1>
      </div>

      <div className="pd-stats">
        <div className="pd-stat">
          <span className="pd-stat-label">Next Appointment</span>
          <strong>May 24, 2025</strong>
          <span className="pd-stat-sub">10:00 AM · Doral Studio</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Sessions Completed</span>
          <strong>4 / 12</strong>
          <span className="pd-stat-sub">This Phase</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Progress Score</span>
          <strong>78%</strong>
          <span className="pd-stat-sub">On Track</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Rewards Points</span>
          <strong>650</strong>
          <span className="pd-stat-sub">Gold Tier</span>
        </div>
      </div>

      <div className="pd-cols">
        <div className="pd-card">
          <h3>My Body Blueprint™ Summary</h3>
          <ul className="pd-summary-list">
            <li><span>Current Goal</span><strong>Tone, Sculpt &amp; Tighten</strong></li>
            <li><span>Treatment Plan</span><strong>Exilis + EMS + Endospheres</strong></li>
            <li><span>Program</span><strong>Sculpt Signature™</strong></li>
            <li><span>Phase</span><strong>Phase 1 of 3</strong></li>
            <li><span>Frequency</span><strong>2 Sessions per Week</strong></li>
          </ul>
          <a href="/portal/blueprint" className="pd-link">View Full Blueprint™ →</a>
        </div>

        <div className="pd-card">
          <h3>Recent Activity</h3>
          <ul className="pd-activity-list">
            <li><strong>Progress photo uploaded</strong><span>May 15, 2025 — 9:41 AM</span></li>
            <li><strong>Appointment confirmed</strong><span>May 10, 2025 — 2:15 PM</span></li>
            <li><strong>You earned 150 points</strong><span>May 8, 2025 — 11:06 AM</span></li>
            <li><strong>After care email opened</strong><span>May 7, 2025 — 8:32 AM</span></li>
          </ul>
          <a href="/portal/documents" className="pd-link">View All Activity →</a>
        </div>

        <div className="pd-card pd-card-dark">
          <h3>Body Rewards™</h3>
          <div className="pd-tier">
            <span>Gold Tier</span>
            <strong>650 / 1,000 points to Platinum</strong>
          </div>
          <div className="pd-bar-track">
            <div className="pd-bar-fill" style={{ width: "65%" }} />
          </div>
          <a href="/portal/rewards" className="pd-link light">Explore Rewards →</a>
        </div>
      </div>

      <div className="pd-quick">
        <h3>Quick Access</h3>
        <div className="pd-quick-grid">
          <a href="/portal/blueprint">My Body Blueprint™</a>
          <a href="/portal/appointments">Appointments</a>
          <a href="/portal/photos">Upload Progress</a>
          <a href="/portal/documents">Documents</a>
          <a href="/portal/messages">Messages</a>
        </div>
      </div>
    </div>
  );
}
