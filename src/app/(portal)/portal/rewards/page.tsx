"use client";

export default function BodyRewardsPage() {
  return (
    <div className="cat-results portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Welcome back, Adriana</p>
        <h1>body rewards.™</h1>
        <p className="portal-page-sub">Exclusive experiences. Not points. Earn Body Credits™, unlock privileges and receive exclusive experiences created just for our clients.</p>
      </div>

      <div className="br-stats">
        <div className="br-stat">
          <span>Your Balance</span>
          <strong>485 <small>Body Credits™</small></strong>
        </div>
        <div className="br-stat">
          <span>To Next Tier</span>
          <strong>515 <small>credits to Platinum</small></strong>
        </div>
        <div className="br-stat">
          <span>Tier Status</span>
          <strong>Gold</strong>
        </div>
        <div className="br-stat">
          <span>Secret Challenge</span>
          <strong>1 <small>waiting for you…</small></strong>
        </div>
      </div>

      <div className="br-section">
        <h3>01 · Ways to Earn Body Credits™</h3>
        <div className="br-earn-grid">
          {[
            ["Google Review", "+25"],
            ["Refer a Friend", "+250"],
            ["Purchase New System", "+250"],
            ["Share a Story", "+25"],
            ["Testimonial Video", "+50"],
            ["Birthday Bonus", "+25"],
            ["Authorize Before & After", "+50"],
            ["Referral Purchase", "+250"],
          ].map(([label, credits]) => (
            <div className="br-earn-item" key={label}>
              <strong>{label}</strong>
              <span>{credits} credits</span>
            </div>
          ))}
        </div>
      </div>

      <div className="br-section">
        <h3>02 · Secret Challenges™</h3>
        <div className="br-challenge-row">
          <div className="br-challenge active">
            <span className="br-tag">Active</span>
            <strong>Secret Challenge #018</strong>
            <p>Something special is waiting for you…</p>
            <span className="br-credits">+25 Body Credits™</span>
          </div>
          <div className="br-challenge">
            <span className="br-tag locked">Locked</span>
            <strong>Secret Challenge #019</strong>
            <p>Keep the mystery alive…</p>
          </div>
          <div className="br-challenge">
            <span className="br-tag done">Completed</span>
            <strong>Secret Challenge #017</strong>
            <p>Challenge completed</p>
            <span className="br-credits">+25 Body Credits™</span>
          </div>
        </div>
      </div>

      <div className="br-section">
        <h3>03 · Privilege Collection™</h3>
        <div className="br-privilege-grid">
          {[
            ["EMS Session", "60 min", "500 credits"],
            ["Hydraglow Facial", "60 min", "450 credits"],
            ["Lymphatic Massage", "60 min", "500 credits"],
            ["Float Therapy", "60 min", "600 credits"],
            ["Matcha Workshop", "pottery + matcha", "300 credits"],
            ["VIP Event Access", "private events", "1,000+ credits"],
          ].map(([title, sub, credits]) => (
            <div className="br-priv-item" key={title}>
              <strong>{title}</strong>
              <span>{sub}</span>
              <span className="br-credits">{credits}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="br-section">
        <h3>04 · Your Activity</h3>
        <div className="br-activity-grid">
          <div className="br-card">
            <h4>Recent Unlocks</h4>
            <ul>
              <li><span>Lymphatic Massage</span><strong>-500</strong></li>
              <li><span>Matcha Workshop</span><strong>-300</strong></li>
              <li><span>Birthday Bonus</span><strong>+25</strong></li>
            </ul>
          </div>
          <div className="br-card">
            <h4>Credits History</h4>
            <ul>
              <li><span>Referral Purchase</span><strong>+250</strong></li>
              <li><span>Google Review</span><strong>+25</strong></li>
              <li><span>EMS Session</span><strong>-500</strong></li>
            </ul>
          </div>
          <div className="br-card br-card-dark">
            <h4>Summary</h4>
            <div className="br-summary-grid">
              <div><strong>2,350</strong><span>total credits</span></div>
              <div><strong>1,865</strong><span>total redeemed</span></div>
              <div><strong>7</strong><span>challenges completed</span></div>
              <div><strong>219</strong><span>days as a member</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
