import "../desktop-heroes.css";
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import RevealObserver from "@/components/RevealObserver";
import VisitorPulse from "@/components/VisitorPulse";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RevealObserver />
      <VisitorPulse />
      <Header />
      <Link href="/holiday-333" className="holiday-ribbon-image" aria-label="Explore the 333 Holiday Sculpt Ritual"><span className="holiday-ribbon-marquee" aria-hidden="true"><span className="holiday-ribbon-tile" /><span className="holiday-ribbon-tile" /><span className="holiday-ribbon-tile" /><span className="holiday-ribbon-tile" /></span></Link>
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
