import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalClient } from "@/lib/permissions";
import { getClientPhotoSignedUrl } from "../photos/actions";
import { WHATSAPP_URL } from "@/lib/nav";

export const dynamic = "force-dynamic";

function bulletsToItems(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

export default async function SystemCompletePage() {
  const portalClient = await getCurrentPortalClient();
  if (!portalClient) redirect("/portal/login");

  const client = await prisma.client.findUnique({
    where: { id: portalClient.id },
    include: {
      blueprintAssessments: {
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });
  if (!client) redirect("/portal/login");

  const assessment = client.blueprintAssessments[0];

  if (!assessment) {
    return (
      <div className="cat-body portal-page sc-empty">
        <p>You haven't completed a system yet.</p>
        <p className="pay-history-meta">Once you finish your current program, your results will show up here.</p>
      </div>
    );
  }

  const highlightItems = bulletsToItems(assessment.completionHighlights);
  const proposalItems = bulletsToItems(assessment.nextSystemProposal);
  const photoIds = Array.isArray(assessment.completionPhotoUrls)
    ? (assessment.completionPhotoUrls as unknown[]).filter((v): v is string => typeof v === "string")
    : [];

  const photoUrls = (
    await Promise.all(photoIds.map((id) => getClientPhotoSignedUrl(id)))
  ).filter((url): url is string => Boolean(url));

  const systemName = assessment.recommendedSystem ?? "Personalized System™";
  const firstName = client.firstName?.trim() || "beautiful";

  return (
    <div className="cat-body portal-page sc-wrap">
      <div className="sc-hero">
        <span className="sc-eyebrow">congratulations, {firstName}</span>
        <h1 className="sc-headline">
          You completed your <em>{systemName}</em>
        </h1>
        <p className="sc-sub">Your results are worth celebrating.</p>
      </div>

      {highlightItems.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-section-title">What you achieved</h2>
          <ul className="sc-highlights">
            {highlightItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {photoUrls.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-section-title">Your Transformation</h2>
          <div className="sc-photo-stack">
            {photoUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="Before and after progress" className="sc-photo" />
            ))}
          </div>
        </section>
      )}

      {(assessment.nextSystemName || proposalItems.length > 0) && (
        <section className="sc-proposal">
          <span className="sc-eyebrow">what's next</span>
          <h2 className="sc-proposal-title">{assessment.nextSystemName ?? "Your Next System"}</h2>
          {proposalItems.length > 0 && (
            <ul className="sc-highlights sc-proposal-list">
              {proposalItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary sc-cta">
            Let's Talk About My Upgrade
          </a>
        </section>
      )}
    </div>
  );
}
