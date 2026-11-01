/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
  // Private client proposals: never indexed, never cached by shared caches,
  // and the token never leaks through the Referer header.
  async headers() {
    return [
      {
        source: "/p/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      { source: "/api/proposals/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which real phone-camera photos (Progress
      // Photos, Documents) easily exceed. 15MB covers a typical
      // high-res phone photo with headroom.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
