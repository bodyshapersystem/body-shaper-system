"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const AccordionContext = createContext<{ openId: string | null; setOpenId: (id: string | null) => void } | null>(null);

export function AccordionGroup({ children, defaultOpenId }: { children: ReactNode; defaultOpenId?: string }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  return <AccordionContext.Provider value={{ openId, setOpenId }}>{children}</AccordionContext.Provider>;
}

export function AccordionItem({
  id,
  title,
  subtitle,
  icon,
  summary,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used inside an AccordionGroup");
  const isOpen = ctx.openId === id;

  return (
    <div className="bp-accordion-item">
      <button type="button" className="bp-accordion-head" onClick={() => ctx.setOpenId(isOpen ? null : id)}>
        <span className="bp-accordion-head-left">
          {icon && <span className="bp-accordion-icon">{icon}</span>}
          <span className="bp-accordion-title">{title}</span>
        </span>
        <span className={`bp-accordion-chevron ${isOpen ? "open" : ""}`}>⌄</span>
      </button>
      {subtitle && !isOpen && <p className="pay-history-meta" style={{ margin: "-4px 0 0" }}>{subtitle}</p>}
      {!isOpen && summary && <div className="bp-accordion-summary">{summary}</div>}
      {isOpen && <div className="bp-accordion-body">{children}</div>}
    </div>
  );
}
