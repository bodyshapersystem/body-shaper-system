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
      <Link href="/holiday-333" className="holiday-ribbon holiday-ribbon-fixed" aria-label="Shop the 333 Holiday Sculpt Ritual"><span className="holiday-ribbon-track">✦ THE 333 HOLIDAY SCULPT RITUAL ✦ 3 TECHNOLOGIES · 9 TREATMENTS · 4 WEEKS ✦ HOLIDAY EXCLUSIVE $1,290 ✦ THE 333 HOLIDAY SCULPT RITUAL ✦ 3 TECHNOLOGIES · 9 TREATMENTS · 4 WEEKS ✦ HOLIDAY EXCLUSIVE $1,290 ✦ </span></Link>
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
