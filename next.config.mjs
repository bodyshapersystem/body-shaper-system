/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
  // The share-image routes (next/og ImageResponse) read font files
  // at runtime via fs.readFileSync(new URL(..., import.meta.url)).
  // Next.js's automatic file tracer doesn't detect this dynamic
  // pattern, so the .ttf files were never copied into the deployed
  // function bundle (real ENOENT in production) -- this explicitly
  // forces them to be included. Stable (not experimental) in
  // Next.js 15.
  outputFileTracingIncludes: {
    "/api/blueprint/share-composition/route": ["./src/app/api/_fonts/**"],
    "/api/blueprint/share-measurements/route": ["./src/app/api/_fonts/**"],
    "/api/photos/share-before-after/route": ["./src/app/api/_fonts/**"],
    "/api/photos/share-results/route": ["./src/app/api/_fonts/**"],
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
