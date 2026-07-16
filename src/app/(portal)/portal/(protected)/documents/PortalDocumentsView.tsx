"use client";

import Link from "next/link";

type RequiredDoc = {
  category: string;
  title: string;
  icon: string;
  completed: boolean;
  completedAt: string | null;
  url: string | null;
};

type SharedFile = {
  id: string;
  title: string;
  category: string;
  uploadedAt: string;
  url: string | null;
};

export default function PortalDocumentsView({
  requiredDocs,
  sharedFiles,
  progressPercent,
  completedCount,
  totalRequired,
}: {
  requiredDocs: RequiredDoc[];
  sharedFiles: SharedFile[];
  progressPercent: number;
  completedCount: number;
  totalRequired: number;
}) {
  function handleDownloadAll() {
    const allUrls = [...requiredDocs.map((d) => d.url), ...sharedFiles.map((f) => f.url)].filter(Boolean) as string[];
    allUrls.forEach((url, i) => {
      setTimeout(() => window.open(url, "_blank"), i * 300);
    });
  }

  return (
    <div className="cap-layout">
      <div className="cap-main">
        <h3 className="dash-section-title">Required Documents</h3>
        <div className="doc-card-grid">
          {requiredDocs.map((doc) => (
            <div key={doc.category} className="doc-card">
              <div className="doc-card-icon">{doc.icon}</div>
              <div className="doc-card-body">
                <p className="doc-card-title">{doc.title}</p>
                <p className={`doc-card-status ${doc.completed ? "doc-status-done" : "doc-status-pending"}`}>
                  {doc.completed ? "Completed" : "Pending"}
                </p>
                {doc.completedAt && (
                  <p className="pay-history-meta">
                    {new Date(doc.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              {doc.url && (
                <div className="doc-card-actions">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-card-link">View</a>
                  <a href={doc.url} download className="doc-card-link">Download</a>
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="dash-section-title" style={{ marginTop: 32 }}>Shared Files</h3>
        {sharedFiles.length === 0 ? (
          <div className="module-empty">Your specialist hasn't shared any additional files yet.</div>
        ) : (
          <div className="doc-card-grid">
            {sharedFiles.map((f) => (
              <div key={f.id} className="doc-card">
                <div className="doc-card-icon">📄</div>
                <div className="doc-card-body">
                  <p className="doc-card-title">{f.title}</p>
                  <p className="pay-history-meta">
                    {new Date(f.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                {f.url && (
                  <div className="doc-card-actions">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="doc-card-link">View</a>
                    <a href={f.url} download className="doc-card-link">Download</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cap-side">
        <div className="cap-next-card">
          <p className="cap-next-eyebrow">your documents</p>
          <div className="cap-next-row"><span>Documents Completed</span><strong>{completedCount} of {totalRequired}</strong></div>
          <div className="cap-next-row"><span>Storage</span><strong>Secure</strong></div>

          <div className="cap-next-divider" />
          <p className="doc-progress-label">Documentation Progress</p>
          <div className="onb-progress-track" style={{ marginBottom: 8 }}>
            <div className="onb-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          {progressPercent === 100 ? (
            <p className="pay-history-meta">All required documents have been completed.</p>
          ) : (
            <>
              <p className="pay-history-meta">{progressPercent}% complete</p>
              <Link href="/portal/appointments/preparation" className="cap-primary-btn">Complete Now</Link>
            </>
          )}
        </div>

        <div className="cap-consistency-card">
          <p className="cap-consistency-title">Frequently Used</p>
          <button type="button" className="cap-secondary-btn" onClick={handleDownloadAll}>Download All Documents</button>
          <button type="button" className="cap-secondary-btn" onClick={() => window.print()}>Print Documents</button>
          <Link href="/portal/messages" className="cap-secondary-btn">Contact Your Specialist</Link>
        </div>
      </div>
    </div>
  );
}
