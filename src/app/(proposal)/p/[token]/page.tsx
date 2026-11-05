import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { buildProposalView, findActiveProposal, sampleProposal } from "@/lib/proposals/server";
import ProposalExperience from "@/components/proposals/ProposalExperience";
import "@/components/proposals/proposal.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Private page: never indexed, never followed, no referrer leaks of the token.
export const metadata: Metadata = {
  title: "your body blueprint · body shaper system™",
  description: "a private proposal prepared for you by body shaper system™.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: "no-referrer",
  openGraph: { title: "your personalized body blueprint", description: "body shaper system™ · private proposal", images: [] },
};
export const viewport: Viewport = { themeColor: "#3a181b" };

/** Master sample at /p/sample (en) and /p/sample-es — placeholder name, checkout disabled, noindex. */
function sampleLang(token: string): "en" | "es" | null {
  if (token === "sample") return "en";
  if (token === "sample-es") return "es";
  return null;
}

export default async function ProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { token } = await params;
  const { checkout } = await searchParams;

  const sample = sampleLang(token);
  if (sample) {
    const view = await buildProposalView(sampleProposal(sample), { sample: true });
    return <ProposalExperience view={view} />;
  }

  const proposal = await findActiveProposal(token);
  if (!proposal) notFound();
  const view = await buildProposalView(proposal);
  const isGabiOnly = proposal.id === "cprop_6e14280813e543fd88fd73e213fcb640";
  const experience = <ProposalExperience view={view} checkoutState={checkout === "success" || checkout === "assessment" || checkout === "cancelled" ? checkout : null} />;
  if (isGabiOnly) {
    return (
      <div className="pp-only-packages">
        <style>{`
          .pp-only-packages .pp-top,
          .pp-only-packages #welcome,
          .pp-only-packages #technology,
          .pp-only-packages #results,
          .pp-only-packages #faq,
          .pp-only-packages #assessment,
          .pp-only-packages #seasonal,
          .pp-only-packages #plan > .pp-bgwrap,
          .pp-only-packages #plan > .pp-inner > .pp-small,
          .pp-only-packages #plan > .pp-inner > .pp-lead,
          .pp-only-packages #plan > .pp-inner > .pp-eyebrow { display: none !important; }
          .pp-only-packages #plan { min-height: 100vh; padding-top: 64px; }
          .pp-only-packages #plan > .pp-inner { padding-top: 0; }
          .pp-only-packages #plan .pp-h2 { text-align: center; margin-bottom: 28px; }
          .pp-only-packages .pp-card .pp-expand,
          .pp-only-packages .pp-card .pp-link { display: none !important; }
        `}</style>
        {experience}
      </div>
    );
  }
  return experience;
}
