import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about the Body Blueprint™, our technologies, results, the In-Home Experience™, scheduling and payments.",
};

export default function FaqPage() {
  return <FaqClient />;
}
