"use client";

const DOCS = [
  "Welcome Guide",
  "Waiver & Release",
  "Body Blueprint™ Summary",
  "Payment Receipt — May 2025",
  "Preparation Instructions",
];

export default function DocumentsPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Your Guides &amp; Forms</p>
        <h1>documents.</h1>
        <p className="portal-page-sub">Access your guides, forms and important resources.</p>
      </div>

      <div className="simple-card">
        <ul className="simple-list">
          {DOCS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
