"use client";
import { useState } from "react";

/** Sends only the package key; the server decides the amount. */
export default function BlackFridayCheckout({ pack, label }: { pack: "4" | "6" | "12"; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/black-friday/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pack }) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Checkout unavailable");
      window.location.assign(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setLoading(false);
    }
  }
  return (
    <>
      <button type="button" className="bf-btn" disabled={loading} onClick={go}>
        {loading ? "Opening secure checkout…" : label}
      </button>
      {error && <p role="alert" className="bf-error">{error}</p>}
    </>
  );
}
