import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { RESULT_CASES, WELCOME_VIDEO_SRC } from "@/lib/proposals/server";
import { proposalPaymentsStatus } from "@/lib/proposals/checkout";
import { money, normalizePrograms } from "@/lib/proposals/types";
import ProposalBuilder from "../ProposalBuilder";
import ProposalControls from "./ProposalControls";
import "../hub-proposals.css";

export const dynamic = "force-dynamic";

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const when = (d: Date | null) => (d ? d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) : "—");

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");
  const { id } = await params;
  const p = await prisma.clientProposal.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: "desc" }, take: 40 }, checkouts: { orderBy: { createdAt: "desc" } }, client: { select: { firstName: true, lastName: true, phone: true } } },
  });
  if (!p) notFound();
  const clients = await prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, city: true } });

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.bodyshapersystem.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const link = `${proto}://${host}/p/${p.token}`;
  const programs = normalizePrograms(p.programs);
  const selected = programs.find((x) => x.key === p.selectedProgramKey);
  const gate = proposalPaymentsStatus();

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow"><Link href="/hub/proposals">client proposals</Link></p>
        <h1>{p.clientName}.</h1>
        <p className="dash-subtitle">{p.locationLabel ?? ""} {p.client ? `· linked to ${p.client.firstName} ${p.client.lastName}` : "· no client record yet"}</p>
      </div>
      <div className="pt-layout">
        <ProposalBuilder
          initial={{
            id: p.id,
            clientId: p.clientId,
            clientName: p.clientName,
            locationLabel: p.locationLabel ?? "",
            language: p.language,
            zones: p.zones,
            goals: p.goals,
            personalMessage: p.personalMessage ?? "",
            internalNotes: p.internalNotes ?? "",
            programs,
            recommendedKey: p.recommendedKey,
            promoEnabled: p.promoEnabled,
            showWelcomeVideo: p.showWelcomeVideo,
            resultCaseIds: p.resultCaseIds,
            expiresAt: iso(p.expiresAt),
            programStartDate: iso(p.programStartDate),
          }}
          clients={clients.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, firstName: c.firstName, city: c.city }))}
          resultCases={RESULT_CASES.map((c) => ({ id: c.id, system: c.system, sessions: c.sessions }))}
          videoAvailable={!!WELCOME_VIDEO_SRC}
        />
        <aside className="pt-side">
          <ProposalControls
            id={p.id}
            status={p.status}
            link={link}
            clientName={p.clientName}
            phone={p.client?.phone ?? null}
            canSecondInstallment={p.checkoutStatus === "first_installment_paid"}
            hasStartDate={!!p.programStartDate}
            paymentsNote={gate.ok ? (gate.testMode ? "stripe: test mode" : "stripe: live") : "online payment not enabled yet — " + gate.reason}
          />
          <div className="pt-card">
            <h3>activity</h3>
            <div className="pt-row"><span>views</span><span>{p.viewCount}</span></div>
            <div className="pt-row"><span>first viewed</span><span>{when(p.firstViewedAt)}</span></div>
            <div className="pt-row"><span>last viewed</span><span>{when(p.lastViewedAt)}</span></div>
            <div className="pt-row"><span>selected program</span><span>{selected?.name ?? "—"}</span></div>
            <div className="pt-row"><span>payment mode</span><span>{p.selectedPaymentMode === "split" ? "pay in 2" : p.selectedPaymentMode === "full" ? "pay in full" : "—"}</span></div>
            <div className="pt-row"><span>checkout</span><span>{p.checkoutStatus ?? "—"}</span></div>
            <div className="pt-row"><span>paid</span><span>{money(p.amountPaidCents, { cents: true })}</span></div>
            <div className="pt-row"><span>balance due</span><span>{money(p.balanceDueCents, { cents: true })}</span></div>
            {p.splitConsentAt && <div className="pt-row"><span>2-payment consent</span><span>{when(p.splitConsentAt)}</span></div>}
          </div>
          {p.checkouts.length > 0 && (
            <div className="pt-card">
              <h3>checkouts</h3>
              {p.checkouts.map((c) => (
                <div key={c.id} className="pt-row">
                  <span>{c.programName} · {c.paymentMode === "split" ? `${c.installmentNumber}/2` : "full"}</span>
                  <span>{money(c.amountCents, { cents: true })} · {c.status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-card">
            <h3>timeline</h3>
            <ul className="pt-events">
              {p.events.map((e) => (
                <li key={e.id}>
                  <span>{e.type.replace(/_/g, " ")}{e.data && typeof e.data === "object" && "programKey" in (e.data as object) ? ` · ${(e.data as { programKey?: string }).programKey}` : ""}</span>
                  <time>{when(e.createdAt)}</time>
                </li>
              ))}
              {p.events.length === 0 && <li>no activity yet</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
