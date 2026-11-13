import { ActivateForm } from "../SocietyForms";

export default async function SocietyActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="soc-page soc-page-narrow">
      <div className="soc-card">
        <p className="soc-eyebrow">shaper society™</p>
        <h1 className="soc-title">welcome — create your login</h1>
        {token ? <ActivateForm token={token} /> : <p className="soc-body">This link is missing its code. Please use the link from your approval email.</p>}
      </div>
    </main>
  );
}
