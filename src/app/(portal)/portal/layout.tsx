import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BSS Society",
  },
  icons: {
    icon: [{ url: "/icon-society-192.png", sizes: "192x192" }, { url: "/icon-society-512.png", sizes: "512x512" }],
    apple: [{ url: "/apple-touch-icon-society.png", sizes: "180x180" }],
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

