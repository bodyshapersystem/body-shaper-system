import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bodyshapersystem.com"),
  title: {
    default: "Body Shaper System™ | Personalized Body Optimization, Miami",
    template: "%s | Body Shaper System™",
  },
  description:
    "Body Shaper System™ creates Personalized Systems™ — not one-size-fits-all treatments. Luxury, mobile body contouring in Miami, built around your Body Blueprint™.",
  openGraph: {
    title: "Body Shaper System™",
    description:
      "Personalized Body Systems. Delivered to You. Luxury mobile body contouring in Miami.",
    url: "https://www.bodyshapersystem.com",
    siteName: "Body Shaper System™",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
