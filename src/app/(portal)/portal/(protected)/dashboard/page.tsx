import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { getPhotoSignedUrl } from "@/app/(hub)/hub/(protected)/clients/[id]/blueprint-actions";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import BookSessionButton from "./BookSessionButton";

export const dynamic = "force-dynamic";

const FOCUS_ROTATION = [
  "Reducing inflammation and improving skin firmness.",
  "Increasing hydration and lymphatic flow.",
  "Reducing bloating and improving body contour.",
  "Building consistency and supporting circulation.",
];

const JOURNEY_PHASES = ["Foundation", "Activation", "Transformation", "Optimization", "Maintenance"] as const;

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function PortalDashboardPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const [appointments, payments, photos, bodyMeasurements, todayTracker, timezone, business] = await Promise.all([
    prisma.appointment.findMany({ where: { clientId: client.id, status: { not: "CANCELLED" } }, orderBy: { startsAt: "asc" } }),
    prisma.payment.findMany({ where: { clientId: client.id } }),
    prisma.photo.findMany({ where: { clientId: client.id, visibility: "CLIENT_VISIBLE" }, orderBy: { uploadedAt: "asc" } }),
    prisma.bodyMeasurement.findMany({ where: { clientId: client.id }, orderBy: { measuredAt: "asc" } }),
    prisma.dailyTracker.findFirst({ where: { clientId: client.id, date: (() => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; })() } }),
    getBusinessTimezone(),
    prisma.businessSettings.findUnique({ where: { id: "default" } }),
  ]);

  const assessment = client.blueprintAssessments[0];
  const totalSessions = assessment?.validatedSessionCount ?? null;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const remaining = totalSessions !== null ? Math.max(totalSessions - completedCount, 0) : null;
  const progressPercent = totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null;

  // Real, derived week number — weeks since the Blueprint was validated (or since becoming a client, if not yet validated).
  const journeyStart = assessment?.validatedAt ?? client.createdAt;
  const weekNumber = Math.max(1, Math.ceil((Date.now() - journeyStart.getTime()) / (7 * 86400000)));

  // Real, derived journey phase — a bucketing of actual session progress, not a stored/fabricated field.
  const phaseIndex = progressPercent === null ? 0 : Math.min(JOURNEY_PHASES.length - 1, Math.floor(progressPercent / 20));
  const journeyPhase = JOURNEY_PHASES[phaseIndex];

  // Real "next milestone" — sessions until the next multiple of 4.
  const milestoneInterval = 4;
  const sessionsUntilMilestone = completedCount > 0 ? milestoneInterval - (completedCount % milestoneInterval) : milestoneInterval;
  const milestonePercent = Math.round(((milestoneInterval - sessionsUntilMilestone) / milestoneInterval) * 100);

  // Real payments overview
  const collectedCents = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amountCents, 0);
  const pendingCents = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amountCents, 0);
  const planTotalCents = assessment?.planTotalCents ?? null;
  const outstandingCents = planTotalCents !== null ? Math.max(planTotalCents - collectedCents, 0) : null;

  // Real next appointment
  const now = new Date();
  const nextAppointment = appointments.find((a) => a.status === "SCHEDULED" && a.startsAt >= now) ?? null;
  let nextAppointmentDetail: null | {
    dateLabel: string; timeLabel: string; title: string; locationType: string; zone: string | null;
    studioAddress: string | null; arrivalWindowLabel: string; sessionNumber: number; totalSessions: number | null;
    paymentStatus: string; calendarUrl: string; id: string;
  } = null;
  if (nextAppointment) {
    const start = nextAppointment.startsAt;
    const end = nextAppointment.endsAt ?? new Date(start.getTime() + (nextAppointment.estimatedMinutes ?? 60) * 60000);
    const arrivalStart = new Date(start.getTime() - 15 * 60000);
    const arrivalEnd = new Date(start.getTime() + 15 * 60000);
    const planFullyPaid = planTotalCents !== null && collectedCents >= planTotalCents;
    const locationText = nextAppointment.locationType === "HOME" ? `${client.city ?? "Your location"} (At Your Home)` : business?.address ?? "Studio Location";

    nextAppointmentDetail = {
      id: nextAppointment.id,
      dateLabel: formatDateInTimezone(start, timezone, { weekday: "long", month: "long", day: "numeric" }),
      timeLabel: formatTimeInTimezone(start, timezone),
      title: nextAppointment.title,
      locationType: nextAppointment.locationType,
      zone: client.city,
      studioAddress: business?.address ?? null,
      arrivalWindowLabel: `${formatTimeInTimezone(arrivalStart, timezone)}–${formatTimeInTimezone(arrivalEnd, timezone)}`,
      sessionNumber: completedCount + 1,
      totalSessions,
      paymentStatus: planFullyPaid ? "Package Session" : pendingCents > 0 ? "Pending" : "Paid",
      calendarUrl: buildGoogleCalendarUrl({
        title: `${nextAppointment.title} — Body Shaper System™`,
        startsAt: start,
        endsAt: end,
        locationText,
        detailsText: `${nextAppointment.title} with Body Shaper System™. Preparation: https://www.bodyshapersystem.com/portal/appointments/preparation`,
      }),
    };
  }

  // Real transformation preview — first vs. most recent measurement + matching photos, per-client (not "biggest loss across all clients").
  let transformation: {
    beforeUrl: string | null; afterUrl: string | null; weightDeltaLbs: number | null;
    waistDeltaIn: number | null; hipsDeltaIn: number | null; bodyFatDeltaPercent: number | null;
    weightNowLbs: number | null; waistNowIn: number | null; hipsNowIn: number | null; bodyFatNowPercent: number | null;
  } | null = null;

  const measurements = await prisma.measurement.findMany({ where: { clientId: client.id }, orderBy: { scanDate: "asc" } });
  if (photos.length >= 2 || measurements.length >= 2 || bodyMeasurements.length >= 2) {
    const firstM = measurements[0];
    const lastM = measurements[measurements.length - 1];
    const firstB = bodyMeasurements[0];
    const lastB = bodyMeasurements[bodyMeasurements.length - 1];
    const [beforeUrl, afterUrl] = photos.length >= 2
      ? await Promise.all([getPhotoSignedUrl(photos[0].storagePath), getPhotoSignedUrl(photos[photos.length - 1].storagePath)])
      : [null, null];

    transformation = {
      beforeUrl,
      afterUrl,
      weightDeltaLbs: firstM?.weightKg != null && lastM?.weightKg != null ? Math.round((firstM.weightKg - lastM.weightKg) * 2.20462 * 10) / 10 : null,
      waistDeltaIn: firstB?.waistCm != null && lastB?.waistCm != null ? Math.round((firstB.waistCm - lastB.waistCm) / 2.54 * 10) / 10 : null,
      hipsDeltaIn: firstB?.hipsCm != null && lastB?.hipsCm != null ? Math.round((firstB.hipsCm - lastB.hipsCm) / 2.54 * 10) / 10 : null,
      bodyFatDeltaPercent: firstM?.bodyFatPercent != null && lastM?.bodyFatPercent != null ? Math.round((firstM.bodyFatPercent - lastM.bodyFatPercent) * 10) / 10 : null,
      weightNowLbs: lastM?.weightKg != null ? Math.round(lastM.weightKg * 2.20462 * 10) / 10 : null,
      waistNowIn: lastB?.waistCm != null ? Math.round(lastB.waistCm / 2.54 * 10) / 10 : null,
      hipsNowIn: lastB?.hipsCm != null ? Math.round(lastB.hipsCm / 2.54 * 10) / 10 : null,
      bodyFatNowPercent: lastM?.bodyFatPercent ?? null,
    };
  }

  const focusText = FOCUS_ROTATION[weekNumber % FOCUS_ROTATION.length];

  return (
    <div className="cat-body portal-page">
      {/* ---------- Hero ---------- */}
      <div className="pv2-hero">
        <div>
          <p className="pv2-hero-eyebrow">good morning,</p>
          <h1 className="pv2-hero-title">{client.firstName}.</h1>
          <p className="pv2-hero-sub">Everything you need for your transformation, in one place.</p>
          {assessment?.recommendedSystem && (
            <p className="pv2-hero-week">✨ Week {weekNumber} of your {assessment.recommendedSystem}</p>
          )}
        </div>
      </div>

      {/* ---------- Hero Metrics ---------- */}
      <div className="trk-summary-bar" style={{ marginBottom: 24 }}>
        <div>
          <p className="trk-summary-label">Sessions Completed</p>
          <p className="trk-summary-value">{completedCount}</p>
        </div>
        <div>
          <p className="trk-summary-label">Sessions Remaining</p>
          <p className="trk-summary-value">{remaining ?? "—"}</p>
        </div>
        <div>
          <p className="trk-summary-label">Current System</p>
          <p className="trk-summary-value" style={{ fontSize: 14 }}>{assessment?.recommendedSystem ?? "Not set"}</p>
        </div>
        <div>
          <p className="trk-summary-label">Journey Progress</p>
          <p className="trk-summary-value">{progressPercent !== null ? `${progressPercent}%` : "—"}</p>
        </div>
      </div>

      <div className="cap-layout" style={{ marginBottom: 24 }}>
        <div className="cap-main">
          <div className="doc-card-grid" style={{ marginBottom: 20 }}>
            {/* Card 1 — Today's Focus */}
            <div className="trk-card">
              <h3 className="trk-card-title">Today's Focus</h3>
              <p className="pay-history-meta" style={{ marginBottom: 14 }}>{focusText}</p>
              <div className="trk-water-circles">
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} className={`trk-water-dot ${i < (todayTracker?.waterGlasses ?? 0) ? "trk-water-dot-filled" : ""}`} />
                ))}
              </div>
              <p className="pay-history-meta">{todayTracker?.waterGlasses ?? 0} / 8 glasses today</p>
            </div>

            {/* Card 2 — Next Milestone */}
            <div className="trk-card" style={{ textAlign: "center" }}>
              <h3 className="trk-card-title">Next Milestone</h3>
              <div className="trk-progress-circle" style={{ margin: "0 auto 10px", background: `conic-gradient(#6B4E3D ${milestonePercent}%, rgba(0,0,0,0.06) 0)` }}>
                <div className="trk-progress-circle-inner"><strong>{milestonePercent}%</strong></div>
              </div>
              <p className="pay-history-meta">{sessionsUntilMilestone} session{sessionsUntilMilestone === 1 ? "" : "s"} until next milestone</p>
            </div>

            {/* Card 3 — Your Journey */}
            <div className="trk-card">
              <h3 className="trk-card-title">Your Journey</h3>
              <p style={{ fontFamily: "var(--serif)", fontSize: 15, color: "#6B4E3D", marginBottom: 4 }}>● {journeyPhase}</p>
              {totalSessions !== null && <p className="pay-history-meta" style={{ marginBottom: 10 }}>Week {weekNumber} of {Math.ceil(totalSessions / 1.5)}</p>}
              <div className="trk-week-dots">
                {JOURNEY_PHASES.map((phase, i) => (
                  <div key={phase} className="trk-week-day">
                    <span className={`trk-week-circle ${i <= phaseIndex ? "trk-week-circle-filled" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transformation Preview */}
          {transformation && (
            <div className="pd-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 14 }}>Transformation Preview</h3>
              {transformation.beforeUrl && transformation.afterUrl && (
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <img src={transformation.beforeUrl} alt="Before" style={{ flex: 1, borderRadius: 12, objectFit: "cover", maxHeight: 240 }} />
                  <img src={transformation.afterUrl} alt="After" style={{ flex: 1, borderRadius: 12, objectFit: "cover", maxHeight: 240 }} />
                </div>
              )}
              <div className="trk-summary-bar" style={{ marginBottom: 0 }}>
                <div><p className="trk-summary-label">Weight</p><p className="trk-summary-value" style={{ fontSize: 15 }}>{transformation.weightDeltaLbs !== null ? `${transformation.weightDeltaLbs > 0 ? "-" : "+"}${Math.abs(transformation.weightDeltaLbs)} lbs` : "—"}</p></div>
                <div><p className="trk-summary-label">Waist</p><p className="trk-summary-value" style={{ fontSize: 15 }}>{transformation.waistDeltaIn !== null ? `${transformation.waistDeltaIn > 0 ? "-" : "+"}${Math.abs(transformation.waistDeltaIn)} in` : "—"}</p></div>
                <div><p className="trk-summary-label">Body Fat</p><p className="trk-summary-value" style={{ fontSize: 15 }}>{transformation.bodyFatDeltaPercent !== null ? `${transformation.bodyFatDeltaPercent > 0 ? "-" : "+"}${Math.abs(transformation.bodyFatDeltaPercent)}%` : "—"}</p></div>
                <div><p className="trk-summary-label">Hips</p><p className="trk-summary-value" style={{ fontSize: 15 }}>{transformation.hipsDeltaIn !== null ? `${transformation.hipsDeltaIn > 0 ? "-" : "+"}${Math.abs(transformation.hipsDeltaIn)} in` : "—"}</p></div>
              </div>
            </div>
          )}

          {/* Payments Overview */}
          <div className="pd-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 14 }}>Payments Overview</h3>
            <div className="cl-summary-list" style={{ marginBottom: 12 }}>
              <div className="cl-summary-row"><span>Collected</span><strong>{money(collectedCents)}</strong></div>
              <div className="cl-summary-row"><span>Pending</span><strong>{money(pendingCents)}</strong></div>
              <div className="cl-summary-row"><span>Outstanding Balance</span><strong>{outstandingCents !== null ? money(outstandingCents) : "—"}</strong></div>
            </div>
            <Link href="/portal/payments" className="cap-secondary-btn">View Payments</Link>
          </div>

          {/* Quick Actions */}
          <h3 className="dash-section-title">Quick Actions</h3>
          <div className="doc-card-grid" style={{ marginBottom: 20 }}>
            <Link href="/portal/blueprint" className="doc-client-card">📘 Blueprint™</Link>
            <Link href="/portal/daily-trackers" className="doc-client-card">💧 Daily Trackers</Link>
            <Link href="/portal/documents" className="doc-client-card">📄 Documents</Link>
            <Link href="/portal/rewards" className="doc-client-card">⭐ Rewards</Link>
            <Link href="/portal/payments" className="doc-client-card">💳 Payments</Link>
          </div>
        </div>

        <div className="cap-side">
          {/* Appointment Card */}
          {nextAppointmentDetail ? (
            <div className="apd-panel" style={{ position: "static", width: "100%", borderRadius: 18 }}>
              <div className="apd-time-row">
                <span className="apd-status-pill" style={{ background: "rgba(246,243,238,0.2)" }}>Confirmed</span>
              </div>
              <div className="apd-detail-list">
                <div className="apd-detail-row"><span>date</span><strong>{nextAppointmentDetail.dateLabel}</strong></div>
                <div className="apd-detail-row"><span>arrival window</span><strong>{nextAppointmentDetail.arrivalWindowLabel}</strong></div>
                <div className="apd-detail-row"><span>treatment</span><strong>{nextAppointmentDetail.title}</strong></div>
                <div className="apd-detail-row"><span>location</span><strong>{nextAppointmentDetail.locationType === "HOME" ? "🏡 At Your Home" : "🏢 Studio"}</strong></div>
                {nextAppointmentDetail.totalSessions !== null && (
                  <div className="apd-detail-row"><span>session</span><strong>{nextAppointmentDetail.sessionNumber} of {nextAppointmentDetail.totalSessions}</strong></div>
                )}
                <div className="apd-detail-row"><span>payment status</span><strong>{nextAppointmentDetail.paymentStatus}</strong></div>
                {nextAppointmentDetail.zone && <div className="apd-detail-row"><span>service zone</span><strong>{nextAppointmentDetail.zone}</strong></div>}
              </div>
              <Link href="/portal/appointments" className="apd-btn-primary" style={{ display: "block", marginBottom: 8 }}>View Appointment Details</Link>
              <a href={nextAppointmentDetail.calendarUrl} target="_blank" rel="noopener noreferrer" className="apd-btn-secondary" style={{ display: "block" }}>➕ Add to Google Calendar</a>
            </div>
          ) : (
            <div className="cap-next-card">
              <p className="cap-next-eyebrow">next appointment</p>
              <div className="module-empty">No upcoming appointment scheduled yet.</div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Weekly Focus Banner ---------- */}
      <div className="trk-cta-bar" style={{ marginBottom: 24 }}>
        <div>
          <h3>This week's focus</h3>
          <p>{focusText} Hydrate, wear your compression garment, and complete your Daily Trackers.</p>
        </div>
        <Link href="/portal/daily-trackers" className="apt-new-btn">View Daily Trackers →</Link>
      </div>

      {/* ---------- Bottom CTA ---------- */}
      <div className="trk-cta-bar">
        <div>
          <h3>Ready to book your next session?</h3>
          <p>Our team will review your request and contact you with the best available options.</p>
        </div>
        <BookSessionButton />
      </div>
    </div>
  );
}
