import type { Metadata } from "next";

// Only exists to give every /hub/* page (including /hub/login, before
// anyone's authenticated) its own manifest — separate from the Client
// Portal's. Next.js merges this into the root layout's metadata, so
// this one field is the only thing that needs to differ here.
export const metadata: Metadata = {
  manifest: "/hub-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BSS Hub",
  },
  icons: {
    icon: [{ url: "/icon-hub-192.png", sizes: "192x192" }, { url: "/icon-hub-512.png", sizes: "512x512" }],
    apple: [{ url: "/apple-touch-icon-hub.png", sizes: "180x180" }],
  },
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
