"use client";

import { useRouter } from "next/navigation";
import { WHATSAPP_URL } from "@/lib/nav";

export default function ClientAccessPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/client-welcome");
  }

  return (
    <div className="login-wrap">
      <div className="login-media">
        <span className="tag">
          Client Access
          <em>
            Your transformation,
            <br />
            continued.
          </em>
        </span>
      </div>
      <div className="login-panel">
        <div className="login-card reveal in">
          <span className="logo">Body Shaper System™</span>
          <h1>Welcome Back.</h1>
          <p className="sub">Continue your transformation journey.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="you@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
            <div className="login-actions">
              <button type="submit" className="btn btn-primary btn-block">
                Sign In
              </button>
              <a href="#" className="forgot">
                Forgot Password
              </a>
            </div>
          </form>

          <div className="login-footer">
            Need help? <a href={WHATSAPP_URL}>Contact us</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
