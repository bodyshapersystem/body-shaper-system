"use client";

export default function ProfilePage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Your Account</p>
        <h1>profile.</h1>
        <p className="portal-page-sub">Manage your information and preferences.</p>
      </div>

      <div className="simple-card">
        <h3>Account</h3>
        <ul className="simple-list">
          <li>Name — Adriana M.</li>
          <li>Email — demo@bodyshapersystem.com</li>
          <li>Member Since — May 12, 2024</li>
          <li>Tier — Gold</li>
        </ul>
      </div>
      <div className="simple-card">
        <h3>Preferences</h3>
        <ul className="simple-list">
          <li>Email notifications — On</li>
          <li>WhatsApp reminders — On</li>
          <li>Language — English</li>
        </ul>
      </div>
    </div>
  );
}
