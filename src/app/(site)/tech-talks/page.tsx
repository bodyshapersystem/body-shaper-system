import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import TechTalksClient from "./TechTalksClient";

export const metadata: Metadata = buildMetadata({
  title: "Tech Talks™",
  description:
    "Learn the science behind every transformation — Exilis®, Endospheres®, EMS® and Lymphatic Protocols™ explained, plus the Body Education™ library.",
  path: "/tech-talks",
});

export default function TechTalksPage() {
  return <TechTalksClient />;
}
