"use client";

import Link from "next/link";

type RequiredDoc = {
  category: string;
  title: string;
  icon: string;
  completed: boolean;
  completedAt: string | null;
  url: string | null;
  formUrl: string | null;
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

  // Smart Complete Now — the first still-incomplete required document
  // that actually has a real form to complete. Categories without a
  // real client-facing form (the Owner-uploaded Blueprint PDF, or the
  // not-yet-built Content Release Agreement) are skipped rather than
  // linking anywhere broken; the client never has to search for which
  // one is next.
  const nextActionable = requiredDocs.find((d) => !d.completed && d.formUrl);
  const allComplete = progressPercent === 100;

  return (
    <div className="cap-layout">
      <div className="cap-main">
        <div className="doc-required-stone">
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
                  {!doc.completed && !doc.formUrl && (
                    <p className="pay-history-meta">Your specialist will upload this for you.</p>
                  )}
                </div>
                <div className="doc-card-actions">
                  {doc.completed && doc.url && (
                    <>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-card-link">View</a>
                      <a href={doc.url} download className="doc-card-link">Download</a>
                    </>
                  )}
                  {!doc.completed && doc.formUrl && (
                    <a href={doc.formUrl} target="_blank" rel="noopener noreferrer" className="doc-card-link">
                      {doc === nextActionable ? "Complete Now →" : "Continue Form →"}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
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
        <div className="cap-next-card cap-next-card-fern">
          <p className="cap-next-eyebrow">your documents</p>
          <div className="cap-next-row"><span>Documents Completed</span><strong>{completedCount} of {totalRequired}</strong></div>
          <div className="cap-next-row"><span>Storage</span><strong>Secure</strong></div>

          <div className="cap-next-divider" />
          <p className="doc-progress-label">Documentation Progress</p>
          <div className="onb-progress-track" style={{ marginBottom: 8 }}>
            <div className="onb-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          {allComplete ? (
            <>
              <p className="pay-history-meta" style={{ marginBottom: 10 }}>✓ All required documents completed</p>
              <p className="pay-history-meta">Everything is complete. Your specialist already has everything needed for your journey.</p>
            </>
          ) : (
            <>
              <p className="pay-history-meta">{progressPercent}% complete</p>
              {nextActionable ? (
                <a href={nextActionable.formUrl!} target="_blank" rel="noopener noreferrer" className="cap-primary-btn">
                  Complete Now
                </a>
              ) : (
                <p className="pay-history-meta" style={{ marginTop: 10 }}>Your specialist is finishing the rest — nothing more needed from you right now.</p>
              )}
            </>
          )}
        </div>

        <div className="cap-consistency-card cap-consistency-card-stone">
          <p className="cap-consistency-title">Frequently Used</p>
          <button type="button" className="cap-secondary-btn" onClick={handleDownloadAll}>Download All Documents</button>
          <button type="button" className="cap-secondary-btn" onClick={() => window.print()}>Print Documents</button>
          <Link href="/portal/messages" className="cap-secondary-btn">Contact Your Specialist</Link>
        </div>
      </div>
    </div>
  );
}
