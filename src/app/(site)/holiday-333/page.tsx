import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import HolidayCheckout from "@/components/HolidayCheckout";

export const metadata: Metadata = buildMetadata({
  title: "333 Holiday Sculpt Ritual | Body Shaper System Miami",
  description: "Three Exilis Ultra, three Endospheres, three EMS sessions. Nine treatments over four weeks for $1,290 in Miami.",
  path: "/holiday-333",
});

const weeks = [
  { week: "01", title: "Kickstart", sessions: "Exilis Ultra · Endospheres · EMS" },
  { week: "02", title: "Intensify", sessions: "Exilis Ultra · EMS" },
  { week: "03", title: "Sculpt & Define", sessions: "Exilis Ultra · Endospheres · EMS" },
  { week: "04", title: "Complete", sessions: "Endospheres" },
];

export default function Holiday333Page() {
  return (
    <main className="holiday-333-editorial">
      <div className="holiday-333-poster-crop" role="img" aria-label="The 333 Holiday Sculpt Ritual — burgundy holiday campaign artwork">
        <img src="/images/BF771669-2C53-4FDD-ABB0-523F45EA0279.png" alt="" loading="eager" />
      </div>
      <section className="holiday-333-copy" aria-label="Your 333 holiday ritual">
        <p className="holiday-333-eyebrow">THE HOLIDAY SCULPT RITUAL</p>
        <h1>Three technologies. Nine treatments. Four weeks dedicated to you.</h1>
        <p className="holiday-333-intro">A personalized approach to sculpting, skin firmness and body confidence, brought to your door in Miami. Your Body Blueprint™ is included.</p>
        <div className="holiday-333-week-grid">
          {weeks.map(({week,title,sessions}) => (
            <div className="holiday-333-week" key={week}>
              <span>WEEK {week}</span>
              <h2>{title}</h2>
              <p>{sessions}</p>
            </div>
          ))}
        </div>
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
