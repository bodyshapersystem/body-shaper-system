import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import HolidayCheckout from "@/components/HolidayCheckout";

export const metadata: Metadata = buildMetadata({
  title: "333 Holiday Sculpt Ritual | Body Shaper System Miami",
  description: "Three Exilis Ultra, three Endospheres, three EMS sessions. Nine personalized treatments for $1,290 in Miami.",
  path: "/holiday-333",
});

export default function Holiday333Page() {
  return (
    <main className="holiday-333-editorial">
      <div className="holiday-333-poster-crop" role="img" aria-label="The 333 Holiday Sculpt Ritual — burgundy holiday campaign artwork">
        <img src="/images/BF771669-2C53-4FDD-ABB0-523F45EA0279.png" alt="" loading="eager" />
      </div>
      <section className="holiday-333-copy" aria-label="Your 333 holiday ritual">
        <p className="holiday-333-eyebrow">THE HOLIDAY SCULPT RITUAL</p>
        <h1>Three technologies. Nine treatments. One personalized strategy.</h1>
        <p className="holiday-333-intro">A personalized approach to sculpting, skin firmness and body confidence, brought to your door in Miami. Your Body Blueprint™ is included.</p>
        <p className="holiday-333-intro">Your nine sessions include 3 Exilis Ultra, 3 Endospheres and 3 EMS treatments. The order, spacing and combination of sessions are determined after your personalized Body Blueprint™ assessment. No two bodies follow exactly the same strategy.</p>
        <div className="holiday-333-pricing">
          <p className="holiday-333-eyebrow">CHRISTMAS SPECIAL</p>
          <p className="holiday-333-original">Regular price <s>$1,575</s></p>
          <p className="holiday-333-price">$1,290</p>
          <p>You save $285 · 18% off</p>
          <p className="holiday-333-payment">Pay $1,290 in full, or two installments of $645. The first is paid at checkout; the second is due during Week 2 of your actual treatment program.</p>
        </div>
        <div id="reserve" className="holiday-333-checkout">
          <h2>Claim Your Holiday Ritual</h2>
          <HolidayCheckout />
        </div>
        <p className="holiday-333-terms">At least 3 of the 9 treatments must be completed before January 27, 2027. Remaining sessions may be completed afterward on your personalized schedule. Subject to treatment suitability and appointment availability. Results vary.</p>
      </section>
    </main>
  );
}
