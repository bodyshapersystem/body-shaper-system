import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import TransformationsClient from "./TransformationsClient";

export const metadata: Metadata = buildMetadata({
  title: "Transformations",
  description:
    "Real transformations, designed around you. Every Body Blueprint™ is different, because every body is different.",
  path: "/transformations",
});

export default function TransformationsPage() {
  return <TransformationsClient />;
}
