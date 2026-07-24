"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { createBookingCheckoutSession } from "./actions";

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function BookingForm({ days }: { days: { dateKey: string; label: string; slots: string[] }[] }) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dateKey ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeDay = days.find((d) => d.dateKey === selectedDay);

  function handleSubmit(formData: FormData) {
    setError("");
    if (!selectedDay || !selectedTime) {
      setError("Please pick a date and time.");
      return;
    }
    const [h, m] = selectedTime.split(":").map(Number);
    const startsAt = new Date(`${selectedDay}T00:00:00`);
    startsAt.setHours(h, m, 0, 0);
    formData.set("startsAt", startsAt.toISOString());

    startTransition(async () => {
      const result = await createBookingCheckoutSession(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  if (days.length === 0) {
    return <p style={{ opacity: 0.7 }}>No availability in the next two weeks — please text or call us to book directly.</p>;
  }

  return (
    <form action={handleSubmit}>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10, opacity: 0.65 }}>
          Choose a Date
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {days.map((d) => (
            <button
              key={d.dateKey}
              type="button"
              onClick={() => {
                setSelectedDay(d.dateKey);
                setSelectedTime("");
              }}
              style={{
                padding: "9px 14px",
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.15)",
                background: d.dateKey === selectedDay ? "#5C1A1F" : "#fff",
                color: d.dateKey === selectedDay ? "#fff" : "#2B2622",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {activeDay && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10, opacity: 0.65 }}>
            Choose a Time
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {activeDay.slots.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(t)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: t === selectedTime ? "#5C1A1F" : "#fff",
                  color: t === selectedTime ? "#fff" : "#2B2622",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {fmtTime(t)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <input name="firstName" placeholder="First Name" required style={inputStyle} />
        <input name="lastName" placeholder="Last Name" required style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <input name="email" type="email" placeholder="Email" required style={{ ...inputStyle, width: "100%" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        <input name="phone" type="tel" placeholder="Phone" style={inputStyle} />
        <input name="city" placeholder="City" style={inputStyle} />
      </div>

      {error && <p style={{ color: "#8B3A3F", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: "100%", border: "none", cursor: "pointer" }}>
        {isPending ? "Redirecting to secure checkout…" : "Reserve My Spot — $350 Deposit"}
      </button>
      <p style={{ fontSize: 11.5, opacity: 0.55, marginTop: 12, textAlign: "center" }}>
        Secure payment via Stripe. Your deposit goes toward your Personalized System™.
      </p>
    </form>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.15)",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
