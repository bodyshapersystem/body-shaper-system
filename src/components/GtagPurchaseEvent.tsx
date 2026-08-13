"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a real GA4 'purchase' conversion event once, client-side,
 * when a success page mounts. Without this, GA4 only ever sees
 * pageviews — no way to tell which channel (Instagram, Google,
 * direct) actually produced revenue, only which produced traffic.
 * transactionId should be the Stripe Checkout Session ID so a given
 * purchase can never double-fire even if the success page is
 * revisited/refreshed (GA4 dedupes on transaction_id for 'purchase').
 */
export default function GtagPurchaseEvent({
  transactionId,
  valueUsd,
  itemName,
}: {
  transactionId: string;
  valueUsd: number;
  itemName: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: transactionId,
        value: valueUsd,
        currency: "USD",
        items: [{ item_name: itemName, price: valueUsd, quantity: 1 }],
      });
    }
  }, [transactionId, valueUsd, itemName]);

  return null;
}
