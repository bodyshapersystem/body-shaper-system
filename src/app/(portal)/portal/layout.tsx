"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ClientSidebar from "@/components/portal/ClientSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLogin = pathname === "/portal/login";

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    const authed = typeof window !== "undefined" && window.sessionStorage.getItem("bss_portal_demo_auth") === "1";
    if (!authed) {
      router.replace("/portal/login");
      return;
    }
    setReady(true);
  }, [isLogin, pathname, router]);

  if (isLogin) {
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
