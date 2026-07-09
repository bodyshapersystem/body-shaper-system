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
      <body>{children}</body>
    </html>
  );
}
