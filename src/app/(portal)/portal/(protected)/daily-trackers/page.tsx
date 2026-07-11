"use client";

export default function DailyTrackersPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Your Transformation. Every Day.</p>
        <h1>daily trackers.</h1>
        <p className="portal-page-sub">Track your habits, monitor your progress and stay consistent with your transformation journey.</p>
      </div>

      <div className="dt-grid">
        <div className="dt-card">
          <div className="dt-card-head"><span>💧</span> Water Tracker</div>
          <div className="dt-glasses">
            {[1, 2, 3, 4, 5, 6, 7].map((g) => (
              <span key={g} className={g <= 7 ? "glass full" : "glass"} />
            ))}
          </div>
          <strong>7 / 8 glasses</strong>
          <div className="dt-bar-track"><div className="dt-bar-fill" style={{ width: "88%" }} /></div>
          <button type="button" className="dt-btn">log water</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>🦶</span> Steps Tracker</div>
          <strong className="dt-big">8,342 <small>steps</small></strong>
          <span className="dt-goal">goal: 10,000 steps</span>
          <div className="dt-bar-track"><div className="dt-bar-fill" style={{ width: "83%" }} /></div>
          <button type="button" className="dt-btn">connect device</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>🌙</span> Sleep Tracker</div>
          <strong className="dt-big">7h 25m</strong>
          <span className="dt-goal">goal: 8h</span>
          <div className="dt-bar-track"><div className="dt-bar-fill" style={{ width: "93%" }} /></div>
          <button type="button" className="dt-btn">log sleep</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>🏃</span> Movement Tracker</div>
          <strong className="dt-big">30 <small>min</small></strong>
          <span className="dt-goal">goal: 30 min</span>
          <div className="dt-bar-track"><div className="dt-bar-fill" style={{ width: "100%" }} /></div>
          <button type="button" className="dt-btn">log movement</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>🙂</span> Mood Tracker</div>
          <div className="dt-mood-row">
            <span>☹</span><span>🙁</span><span>😐</span><span>🙂</span><span className="active">😄</span>
          </div>
          <span className="dt-goal">feeling good</span>
          <button type="button" className="dt-btn">add note</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>⚡</span> Energy Tracker</div>
          <div className="dt-energy-bars">
            <span style={{ height: "20%" }} /><span style={{ height: "35%" }} /><span style={{ height: "55%" }} />
            <span style={{ height: "75%" }} /><span style={{ height: "95%" }} />
          </div>
          <span className="dt-goal">low → high</span>
          <button type="button" className="dt-btn">set energy level</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>🔥</span> Consistency Streak</div>
          <strong className="dt-big">21 <small>days</small></strong>
          <div className="dt-week-dots">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className={i < 6 ? "dot done" : "dot"}>{d}</span>
            ))}
          </div>
          <button type="button" className="dt-btn">view calendar</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>📅</span> Next Appointment</div>
          <strong style={{ fontSize: "15px" }}>Exilis + EMS</strong>
          <span className="dt-goal">Mon, May 26, 2025 · 4:00 PM · Doral Studio</span>
          <button type="button" className="dt-btn dt-btn-primary">view full schedule</button>
        </div>

        <div className="dt-card">
          <div className="dt-card-head"><span>📝</span> Notes for Today</div>
          <p className="dt-note-placeholder">Journal your thoughts, wins, gratitude or anything that matters to you.</p>
          <button type="button" className="dt-btn">save note</button>
        </div>
      </div>

      <div className="dt-weekly">
        <h3>Weekly Overview</h3>
        <div className="dt-weekly-grid">
          <div><span>💧</span><strong>85%</strong><small>water</small></div>
          <div><span>🦶</span><strong>78%</strong><small>steps</small></div>
          <div><span>🏃</span><strong>90%</strong><small>movement</small></div>
          <div><span>🌙</span><strong>88%</strong><small>sleep</small></div>
          <div><span>🙂</span><strong>good</strong><small>mood</small></div>
          <div><span>⚡</span><strong>high</strong><small>energy</small></div>
        </div>
      </div>
    </div>
  );
}
