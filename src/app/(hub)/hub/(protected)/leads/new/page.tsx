import { createLead } from "../actions";

export default function NewLeadPage() {
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Leads</p>
        <h1>new lead.</h1>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createLead(formData);
        }}
        style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="firstName" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
              First Name *
            </label>
            <input id="firstName" name="firstName" type="text" required style={{ width: "100%", padding: 10 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="lastName" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
              Last Name *
            </label>
            <input id="lastName" name="lastName" type="text" required style={{ width: "100%", padding: 10 }} />
          </div>
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
            Email *
          </label>
          <input id="email" name="email" type="email" required style={{ width: "100%", padding: 10 }} />
        </div>
        <div>
          <label htmlFor="phone" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
            Phone
          </label>
          <input id="phone" name="phone" type="tel" style={{ width: "100%", padding: 10 }} />
        </div>
        <div>
          <label htmlFor="city" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
            City
          </label>
          <input id="city" name="city" type="text" style={{ width: "100%", padding: 10 }} />
        </div>
        <div>
          <label htmlFor="goals" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
            Goals
          </label>
          <textarea id="goals" name="goals" rows={3} style={{ width: "100%", padding: 10 }} />
        </div>
        <div>
          <label htmlFor="source" style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
            Source
          </label>
          <input id="source" name="source" type="text" placeholder="e.g. website, instagram, referral" style={{ width: "100%", padding: 10 }} />
        </div>
        <button type="submit" className="auth-submit" style={{ width: "auto", padding: "12px 24px" }}>
          Create Lead
        </button>
      </form>
    </div>
  );
}
