/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
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
