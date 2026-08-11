import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import TransformationsClient from "./TransformationsClient";

export const metadata: Metadata = buildMetadata({
  title: "Real Body Contouring Before & After Results | Miami",
  description:
    "Real before-and-after transformations — fat reduction, skin tightening and cellulite reduction results from real Body Shaper System™ clients in Miami.",
  path: "/transformations",
});

export default function TransformationsPage() {
  return <TransformationsClient />;
}
