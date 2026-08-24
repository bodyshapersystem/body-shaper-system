import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/portal/") ? next : "";

  // Already signed in? Skip straight to the intended destination
  // instead of showing the login form again — this is what lets an
  // email CTA like Peptide Journey's invite link safely point through
  // /portal/login for clients who aren't authenticated yet, without
  // annoying already-logged-in clients who click the same link.
  const client = await getCurrentPortalClient();
  if (client) {
    redirect(safeNext || "/portal/dashboard");
  }

  return <LoginForm next={safeNext} />;
}
