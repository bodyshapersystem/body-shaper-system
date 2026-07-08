import type { Metadata } from "next";
import TransformationsClient from "./TransformationsClient";

export const metadata: Metadata = {
  title: "Transformations",
  description:
    "Real results, designed around you. Every transformation begins with understanding your body — explore personalized strategies, not procedures.",
};

export default function TransformationsPage() {
  return <TransformationsClient />;
}
