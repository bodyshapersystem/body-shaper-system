import Link from "next/link";
import { LoginForm } from "../SocietyForms";

export default function SocietyLoginPage() {
  return (
    <main className="soc-page soc-page-narrow">
      <div className="soc-card">
        <p className="soc-eyebrow">shaper society™</p>
        <h1 className="soc-title">sign in</h1>
        <LoginForm />
        <p className="soc-note">Not a member yet? <Link href="/society">Apply here</Link>.</p>
      </div>
    </main>
  );
}
