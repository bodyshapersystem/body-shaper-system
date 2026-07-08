import type { Metadata } from "next";
import TechTalksClient from "./TechTalksClient";

export const metadata: Metadata = {
  title: "Tech Talks™",
  description:
    "Learn the science behind every transformation — Exilis®, Endospheres®, EMS® and Lymphatic Protocols™ explained, plus the Body Education™ library.",
};

export default function TechTalksPage() {
  return <TechTalksClient />;
}
