import "../desktop-heroes.css";
import Header from "@/components/Header";
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
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
