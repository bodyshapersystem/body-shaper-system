import type { Metadata } from "next";
import "./globals.css";

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: "Body Shaper System™",
  alternateName: "Body Shaper System",
  description:
    "Body Shaper System™ creates Personalized Systems™ — not one-size-fits-all treatments. Luxury, mobile body contouring in Miami, built around your Body Blueprint™ using Exilis®, Endospheres®, EMS® and Lymphatic Protocols™.",
  url: "https://www.bodyshapersystem.com",
  logo: "https://www.bodyshapersystem.com/images/bss-wordmark.png",
  image: "https://www.bodyshapersystem.com/images/og-image.jpg",
  priceRange: "$$$",
  areaServed: [
    { "@type": "AdministrativeArea", name: "Miami-Dade County" },
    { "@type": "AdministrativeArea", name: "Broward County" },
    { "@type": "AdministrativeArea", name: "Palm Beach County" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Miami",
    addressRegion: "FL",
    addressCountry: "US",
  },
  sameAs: ["https://instagram.com/bodyshapersystem_mia"],
  founder: {
    "@type": "Person",
    name: "Emmy Branger",
  },
  foundingDate: "2017",
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sculpt Start™" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sculpt Signature™" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mom Reset™" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "GLP-1 Reshape™" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Total Body Optimization™" } },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bodyshapersystem.com"),
  title: {
    default: "Body Shaper System™ | Personalized Body Optimization, Miami",
    template: "%s | Body Shaper System™",
  },
  description:
    "Body Shaper System™ creates Personalized Systems™ — not one-size-fits-all treatments. Luxury, mobile body contouring in Miami, built around your Body Blueprint™.",
  alternates: {
    canonical: "https://www.bodyshapersystem.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "Body Shaper System™",
    description:
      "Personalized Body Systems. Delivered to You. Luxury mobile body contouring in Miami.",
    url: "https://www.bodyshapersystem.com",
    siteName: "Body Shaper System™",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Body Shaper System™ — Personalized Body Systems. Delivered to You.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Shaper System™",
    description:
      "Personalized Body Systems. Delivered to You. Luxury mobile body contouring in Miami.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5EEE4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </head>
      <body>
        {/* Body Shaper System™ Brand Overlay — shared pattern defs, injected
            once here. Reused by the global overlay below and by the mobile
            menu (Header.tsx) via <use href="#bss-brand-overlay-pattern" />. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <pattern id="bss-brand-overlay-pattern" x="0" y="0" width="480" height="480" patternUnits="userSpaceOnUse">
              <path d="M0 240 H480 M240 0 V480" stroke="currentColor" strokeWidth="0.5" />
              <g transform="translate(90,90)">
                <line x1="-18" y1="0" x2="18" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="-18" x2="0" y2="18" stroke="currentColor" strokeWidth="1" />
                <circle r="26" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </g>
              <g transform="translate(370,370)">
                <circle r="34" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle r="20" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle r="3" fill="currentColor" />
                <line x1="-40" y1="0" x2="-44" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="0" x2="44" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="-40" x2="0" y2="-44" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="40" x2="0" y2="44" stroke="currentColor" strokeWidth="1" />
              </g>
              <g transform="translate(330,70)">
                <circle cx="0" cy="0" r="2.5" fill="currentColor" />
                <circle cx="46" cy="18" r="2.5" fill="currentColor" />
                <circle cx="20" cy="46" r="2.5" fill="currentColor" />
                <line x1="0" y1="0" x2="46" y2="18" stroke="currentColor" strokeWidth="0.6" />
                <line x1="46" y1="18" x2="20" y2="46" stroke="currentColor" strokeWidth="0.6" />
                <line x1="0" y1="0" x2="20" y2="46" stroke="currentColor" strokeWidth="0.6" />
              </g>
              <path d="M50,430 C 90,390 70,350 110,340 C 150,330 140,390 190,380" fill="none" stroke="currentColor" strokeWidth="0.85" />
              <g fill="currentColor">
                <circle cx="220" cy="180" r="1.4" /><circle cx="240" cy="180" r="1.4" /><circle cx="260" cy="180" r="1.4" />
                <circle cx="220" cy="200" r="1.4" /><circle cx="240" cy="200" r="1.4" /><circle cx="260" cy="200" r="1.4" />
                <circle cx="220" cy="220" r="1.4" /><circle cx="240" cy="220" r="1.4" /><circle cx="260" cy="220" r="1.4" />
              </g>
              <g transform="translate(430,200)">
                <line x1="0" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="28" stroke="currentColor" strokeWidth="0.6" />
              </g>
            </pattern>
          </defs>
        </svg>
        <svg className="brand-overlay" aria-hidden="true" focusable="false">
          <rect width="100%" height="100%" fill="url(#bss-brand-overlay-pattern)" />
        </svg>
        {children}
      </body>
    </html>
  );
}
