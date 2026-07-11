import BlueprintWaves from "@/components/BlueprintWaves";
import { prisma } from "@/lib/prisma";
import { activatePortalAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function ActivatePortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const invite = token
    ? await prisma.portalInvitation.findUnique({ where: { token }, include: { client: true } })
    : null;

  const invalid = !token || !invite;
  const alreadyUsed = invite?.acceptedAt != null;
  const expired = invite && !alreadyUsed && invite.expiresAt < new Date();

  return (
    <div className="auth-screen">
      <div className="auth-side">
        <BlueprintWaves className="auth-side-waves" />
        <div className="auth-side-inner">
          <span className="auth-wordmark">
            body
            <br />
            shaper
            <br />
            system™
          </span>
          <p className="auth-tagline">
            welcome to
            <br />
            the portal.
          </p>
          <span className="auth-spark" aria-hidden="true">
            ✦
          </span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          {invalid || alreadyUsed || expired ? (
            <>
              <h1>activation link issue.</h1>
              <p className="auth-form-sub">
                {invalid && "This activation link is invalid."}
                {alreadyUsed && "This activation link has already been used — please sign in instead."}
                {expired && "This activation link has expired. Contact hello@bodyshapersystem.com for a new one."}
              </p>
            </>
          ) : (
            <>
              <h1>hi {invite!.client.firstName}, let&apos;s set your password.</h1>
              <p className="auth-form-sub">Create a password to activate your Client Portal account.</p>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await activatePortalAccount(token!, formData);
                }}
              >
                <label htmlFor="password">New Password</label>
                <input id="password" name="password" type="password" placeholder="••••••••" required minLength={8} />

                <label htmlFor="confirm">Confirm Password</label>
                <input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={8} />

                <button type="submit" className="auth-submit">
                  Activate Account
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
