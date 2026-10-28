import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import HolidayCheckout from "@/components/HolidayCheckout";

export const metadata: Metadata = buildMetadata({
  title: "333 Holiday Sculpt Ritual | Body Shaper System Miami",
  description: "The 333 Holiday Sculpt Ritual: 3 Exilis Ultra, 3 Endospheres and 3 EMS treatments for $1,290. Mobile in Miami.",
  path: "/holiday-333",
});

export default function Holiday333Page() {
  return (
    <main style={{ background: "#380b1a", color: "#f9eadb", minHeight: "100vh" }}>
      <img
        src="/images/BF771669-2C53-4FDD-ABB0-523F45EA0279.png"
        alt="The 333 Holiday Sculpt Ritual — three technologies, nine treatments, four-week program, $1,290 holiday special"
        width={1600}
        height={2400}
        style={{ display: "block", width: "100%", height: "auto" }}
        loading="eager"
      />
      <section id="reserve" style={{ maxWidth: 740, margin: "0 auto", padding: "36px 20px 70px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(28px,5vw,44px)" }}>Reserve Your 333 Holiday Sculpt Ritual</h1>
        <p style={{ margin: "14px auto 25px", lineHeight: 1.7 }}>Pay $1,290 in full or $645 today and $645 during Week 2 of your treatment program.</p>
        <HolidayCheckout />
        <p style={{ fontSize: 13, lineHeight: 1.8, marginTop: 24 }}>At least 3 of the 9 treatments must be completed before January 27, 2027. Remaining sessions may be completed afterward according to your personalized schedule. Subject to appointment availability and treatment suitability. Results vary.</p>
      </section>
    </main>
  );
}
