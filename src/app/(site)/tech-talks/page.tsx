import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import TechTalksClient from "./TechTalksClient";

export const metadata: Metadata = buildMetadata({
  title: "Body Contouring Technology Explained | Exilis, EMS & More",
  description:
    "How non-surgical body contouring actually works — fat reduction, skin tightening, cellulite reduction and muscle toning technology explained, plus real client videos.",
  path: "/tech-talks",
});

export default function TechTalksPage() {
  return <TechTalksClient />;
}
