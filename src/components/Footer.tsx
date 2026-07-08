import Link from "next/link";
import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/nav";

export default function Footer() {
  return (
    <footer id="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" className="logo">
            Body Shaper System™
          </Link>
          <p>Personalized Body Systems. Delivered to You.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link href="/">Home</Link>
            <Link href="/body-blueprint">Blueprint</Link>
            <Link href="/systems">Systems</Link>
            <Link href="/transformations">Transformations</Link>
            <Link href="/about">About</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/tech-talks">Tech Talks™</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href={INSTAGRAM_URL}>Instagram — @bodyshapersystem</a>
            <a href={WHATSAPP_URL}>WhatsApp — Chat with a Specialist</a>
            <a href="https://bodyshapersystem.com">bodyshapersystem.com</a>
          </div>
          <div className="footer-col">
            <h4>Begin</h4>
            <Link href="#build" className="cta">
              Build My Blueprint™
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Body Shaper System™. All rights reserved.</span>
        <span>Miami, Florida</span>
      </div>
    </footer>
  );
}
