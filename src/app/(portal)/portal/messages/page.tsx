"use client";

export default function MessagesPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Secure Communication</p>
        <h1>messages.</h1>
        <p className="portal-page-sub">Connect with your care team.</p>
      </div>

      <div className="simple-card msg-thread">
        <div className="msg-bubble">Hi Adriana! How can I support you today?</div>
        <div className="msg-bubble me">I feel more bloated today. What can I do?</div>
        <div className="msg-bubble">
          Bloating can happen for many reasons. A few things that can help: drink extra water,
          walk for 20–30 minutes, avoid salty foods, and lymphatic drainage can also help.
        </div>
        <textarea className="msg-input" placeholder="Write a message…" rows={2} />
      </div>
    </div>
  );
}
