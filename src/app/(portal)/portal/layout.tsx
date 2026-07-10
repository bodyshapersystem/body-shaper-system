"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ClientSidebar from "@/components/portal/ClientSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isAuthPage = pathname === "/portal/login" || pathname === "/portal/signup";

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }
    const authed = typeof window !== "undefined" && window.sessionStorage.getItem("bss_portal_demo_auth") === "1";
    if (!authed) {
      router.replace("/portal/login");
      return;
    }
    setReady(true);
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="portal-loading">Loading your portal…</div>;
  }

  return (
    <div className="portal-shell">
      <ClientSidebar />
      <main className="portal-main">{children}</main>
    </div>
  );
}
