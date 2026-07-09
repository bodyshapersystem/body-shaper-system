import type { Metadata } from "next";

const SITE_URL = "https://www.bodyshapersystem.com";
const DEFAULT_OG_IMAGE = "/images/og-image.jpg";

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | Body Shaper System™`,
      description,
      url,
      siteName: "Body Shaper System™",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "Body Shaper System™ — Personalized Body Systems. Delivered to You.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Body Shaper System™`,
      description,
      images: [image],
    },
  };
}
