import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import FaqClient from "./FaqClient";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about the Body Blueprint™, our technologies, results, the In-Home Experience™, scheduling and payments.",
  path: "/faq",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Body Blueprint™?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's the personalized evaluation process we use to understand your goals, body composition, lifestyle and priorities before recommending a Personalized System™ — never before.",
      },
    },
    {
      "@type": "Question",
      name: "How do I know which system is right for me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every recommendation begins with your Body Blueprint™. It's how we determine the system, technologies and timeline that make sense for your body.",
      },
    },
    {
      "@type": "Question",
      name: "How much does body contouring cost in Miami?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing depends entirely on your Personalized System™ — the technologies, number of sessions and timeline your Body Blueprint™ recommends. Start with a consultation and we'll give you exact pricing for your plan.",
      },
    },
    {
      "@type": "Question",
      name: "Do you serve my area?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — we bring the In-Home Experience™ directly to you throughout Miami-Dade, Broward and Palm Beach counties, including Miami, Miami Beach, Coconut Grove, Coral Gables, Brickell and Kendall.",
      },
    },
    {
      "@type": "Question",
      name: "How many sessions do I need to see results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "This varies by system and body type — your Body Blueprint™ determines the exact number of sessions for your goals, so there's no one-size-fits-all answer.",
      },
    },
    {
      "@type": "Question",
      name: "Why don't you recommend the same treatment for everyone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because no two bodies are identical. Two clients with the same goal can require completely different strategies — that's the entire philosophy behind Body Shaper System™.",
      },
    },
    {
      "@type": "Question",
      name: "Does Exilis® hurt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Most clients describe it as a warm, relaxing sensation, similar to a hot stone massage.",
      },
    },
    {
      "@type": "Question",
      name: "Does EMS® replace exercise?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. EMS® complements movement and an active lifestyle — it doesn't replace regular physical activity.",
      },
    },
    {
      "@type": "Question",
      name: "Can I combine multiple technologies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — most clients receive a Personalized System™ that combines two or more technologies based on their Body Blueprint™.",
      },
    },
    {
      "@type": "Question",
      name: "How does the in-home experience work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Professional-grade equipment is brought directly to your home. The experience is designed to be comfortable, private and convenient.",
      },
    },
    {
      "@type": "Question",
      name: "Is my deposit applied?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — your reservation deposit is applied directly toward your first session.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient />
    </>
  );
}
