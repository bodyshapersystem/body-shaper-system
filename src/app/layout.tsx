import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import BrandOverlay, { type BrandOverlayMotif } from "@/components/BrandOverlay";
import AnalyticsEventTracker from "@/components/AnalyticsEventTracker";

const ALL_MOTIFS: BrandOverlayMotif[] = ["target", "dotgrid"];

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
  sameAs: [
    "https://instagram.com/bodyshapersystem_mia",
    "https://www.google.com/maps?cid=13270517675364589804",
  ],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
        {/* Google Analytics (GA4) — real measurement ID, site-wide */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-YNMZ6N20X2" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YNMZ6N20X2');
          `}
        </Script>
      </head>
      <body>
        <AnalyticsEventTracker />
        {/* Body Shaper System™ Brand Overlay — now a single reusable
            component (src/components/BrandOverlay.tsx). Increased to a
            warm gold/champagne foil at ~10% opacity so the brand
            graphics read as intentional design, not a faint watermark. */}
        <BrandOverlay motifs={ALL_MOTIFS} opacity={0.1} tone="gold" position="fixed" />
        {children}
      </body>
    </html>
  );
}
