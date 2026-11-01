import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { money, normalizePrograms } from "@/lib/proposals/types";
import "./hub-proposals.css";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  started: "checkout started",
  paid_in_full: "paid in full",
  first_installment_paid: "1 of 2 paid",
  completed: "fully paid",
};

export default async function ProposalsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");

  const proposals = await prisma.clientProposal.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>client proposals.</h1>
        <p className="dash-subtitle">Private, personalized body blueprint proposals — one master design, only the data changes.</p>
      </div>
      <div className="pt-btns" style={{ marginBottom: 24 }}>
        <Link href="/hub/proposals/new" className="pt-btn solid">+ new proposal</Link>
        <Link href="/hub/proposals/settings" className="pt-btn">founder bio & seasonal offer</Link>
      </div>
      {proposals.length === 0 ? (
        <p className="dash-empty">No proposals yet.</p>
      ) : (
        <table className="pt-table">
          <thead>
            <tr>
              <th>client</th>
              <th>status</th>
              <th className="pt-hide-m">views</th>
              <th className="pt-hide-m">selected</th>
              <th>payment</th>
              <th className="pt-hide-m">updated</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => {
              const sel = normalizePrograms(p.programs).find((x) => x.key === p.selectedProgramKey);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/hub/proposals/${p.id}`}>{p.clientName}</Link>
                    {p.locationLabel ? <span style={{ color: "#8a7f74" }}> · {p.locationLabel}</span> : null}
                  </td>
                  <td><span className={`pt-pill ${p.status.toLowerCase()}`}>{p.status.toLowerCase()}</span></td>
                  <td className="pt-hide-m">{p.viewCount}</td>
                  <td className="pt-hide-m">{sel ? `${sel.name}${p.selectedPaymentMode ? ` · ${p.selectedPaymentMode === "split" ? "pay in 2" : "pay in full"}` : ""}` : "—"}</td>
                  <td>
                    {p.checkoutStatus ? <span className={`pt-pill${p.amountPaidCents > 0 ? " paid" : ""}`}>{STATUS_LABEL[p.checkoutStatus] ?? p.checkoutStatus}</span> : "—"}
                    {p.amountPaidCents > 0 ? ` ${money(p.amountPaidCents)}` : ""}
                  </td>
                  <td className="pt-hide-m">{p.updatedAt.toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
