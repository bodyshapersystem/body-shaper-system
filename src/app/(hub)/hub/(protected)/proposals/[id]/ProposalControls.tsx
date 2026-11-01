"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSecondInstallmentLink, regenerateProposalLink, setProposalStatus } from "../actions";

export default function ProposalControls(props: {
  id: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  link: string;
  clientName: string;
  phone: string | null;
  canSecondInstallment: boolean;
  hasStartDate: boolean;
  paymentsNote: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);

  const copy = (text: string, label: string) =>
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    });
  const waText = encodeURIComponent(`hola ${props.clientName} ✨ aquí está tu body blueprint personalizado, preparado solo para ti:\n${props.link}`);
  const waNumber = (props.phone ?? "").replace(/\D/g, "");
  const run = (fn: () => Promise<{ error?: string } | unknown>) =>
    start(async () => {
      setMsg(null);
      const r = (await fn()) as { error?: string };
      if (r?.error) setMsg(r.error);
      router.refresh();
    });

  return (
    <div className="pt-card">
      <h3>private link</h3>
      <span className={`pt-pill ${props.status.toLowerCase()}`}>{props.status.toLowerCase()}</span>
      {props.status !== "ACTIVE" && <p className="pb-err">this link is OFF — press «activate» so the client can open it.</p>}
      <div className="pt-link">{props.link}</div>
      <div className="pt-btns">
        <button type="button" className="pt-btn" onClick={() => copy(props.link, "link")}>{copied === "link" ? "copied ✓" : "copy link"}</button>
        <button type="button" className="pt-btn" onClick={() => copy(decodeURIComponent(waText), "msg")}>{copied === "msg" ? "copied ✓" : "copy whatsapp message"}</button>
        <a className="pt-btn wa" href={`https://wa.me/${waNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer">open whatsapp</a>
        <a className="pt-btn" href={`/hub/proposals/${props.id}/preview`} target="_blank" rel="noopener noreferrer">preview</a>
      </div>
      <div className="pt-btns">
        {props.status !== "ACTIVE" ? (
          <button type="button" className="pt-btn solid" disabled={pending} onClick={() => run(() => setProposalStatus(props.id, "ACTIVE"))}>activate</button>
        ) : (
          <button type="button" className="pt-btn" disabled={pending} onClick={() => run(() => setProposalStatus(props.id, "INACTIVE"))}>deactivate</button>
        )}
        <button
          type="button"
          className="pt-btn"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Create a new private link? The current link will stop working.")) run(() => regenerateProposalLink(props.id));
          }}
        >
          new link
        </button>
      </div>
      {props.canSecondInstallment && (
        <div style={{ display: "grid", gap: 8 }}>
          <p className="pb-hint">2nd installment — charged automatically on the day she chose. if the automatic charge fails, send her this link instead.</p>
          <button
            type="button"
            className="pt-btn solid"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await createSecondInstallmentLink(props.id);
                if (r.error) setMsg(r.error);
                else if (r.url) setSecond(r.url);
              })
            }
          >
            generate 2nd installment link (fallback)
          </button>
          {second && (
            <>
              <div className="pt-link">{second}</div>
              <button type="button" className="pt-btn" onClick={() => copy(second, "second")}>{copied === "second" ? "copied ✓" : "copy payment link"}</button>
            </>
          )}
        </div>
      )}
      <p className="pb-hint">{props.paymentsNote}</p>
      {msg && <p className="pb-err" role="alert">{msg}</p>}
    </div>
  );
}
