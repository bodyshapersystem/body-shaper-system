"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Real GA4 conversion event tracking via a single global click listener
 * (event delegation) — avoids needing to add individual onClick
 * handlers to every WhatsApp/Blueprint-form link across 5+ public
 * pages, which would be much more error-prone to keep in sync.
 * Fires:
 *   - "contact_whatsapp_click" whenever a wa.me link is clicked
 *   - "contact_phone_click" for tel: links
 *   - "contact_email_click" for mailto: links
 *   - "blueprint_form_click" whenever a link to the real "Let's Build
 *     Your Blueprint™" Jotform is clicked (the moment they open the
 *     form — actual submission happens on Jotform's own domain, which
 *     we can't observe from here without their own webhook/redirect
 *     wiring a separate thank-you page specifically for GA purposes,
 *     which doesn't exist yet — this is a real, honest proxy for
 *     "started the lead form", not a guarantee they finished it).
 */
export default function AnalyticsEventTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href") || "";

      if (href.includes("wa.me")) {
        window.gtag?.("event", "contact_whatsapp_click", { event_category: "engagement" });
      } else if (href.startsWith("tel:")) {
        window.gtag?.("event", "contact_phone_click", { event_category: "engagement" });
      } else if (href.startsWith("mailto:")) {
        window.gtag?.("event", "contact_email_click", { event_category: "engagement" });
      } else if (href.includes("jotform.com/beautyboxmia/lets-build-your-blueprint")) {
        window.gtag?.("event", "blueprint_form_click", { event_category: "conversion" });
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
