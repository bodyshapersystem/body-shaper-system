import { getCurrentPortalClient } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone, getTimeBasedGreeting } from "@/lib/format-datetime";
import { getClientPhotoSignedUrl } from "../photos/actions";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import BookSessionButton from "./BookSessionButton";
import { computePackageTracker, parsePackageTechnologies } from "@/lib/tech-count";

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
  // Same real rule as the Owner Hub Blueprint report: an appointment
  // counts once its time has passed, without needing a manual status
  // flip first. NO_SHOW/CANCELLED are still never counted.
  const completedCount = appointments.filter((a) => a.status === "COMPLETED" || (a.status === "SCHEDULED" && a.startsAt < new Date())).length;
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
      ? await Promise.all([getClientPhotoSignedUrl(photos[0].id), getClientPhotoSignedUrl(photos[photos.length - 1].id)])
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

  // Package — per-technology progress when the owner set it up, otherwise sessions done / total.
  const pkg = parsePackageTechnologies(assessment?.packageTechnologies);
  const packageRows = pkg ? computePackageTracker(pkg, appointments) : [];
  const packageLeft = packageRows.reduce((sum, r) => sum + (r.total - r.done), 0);

  // Preparation for the next visit — general comfort/logistics + her own home-care plan.
  const prep: string[] = [
    "Stay well hydrated the day before and the day of your session.",
    "Avoid a heavy meal in the 2 hours before.",
    "Wear comfortable, loose clothing.",
  ];
  if (nextAppointmentDetail?.locationType === "HOME") prep.push("Have a clean, private space ready — we bring everything else.");
  if (assessment?.compressionGarmentRecommended) {
    prep.push(
      `Compression garment${assessment.compressionGarmentHoursPerDay ? `: ${assessment.compressionGarmentHoursPerDay} hours a day` : ""}${assessment.compressionGarmentNote ? ` — ${assessment.compressionGarmentNote.trim()}` : ""}.`
    );
  }

  return (
    <div className="cat-body portal-page">
      {/* ---------- Hero ---------- */}
      <div className="pv2-hero pv2-hero-with-photo">
        <div className="pv2-hero-text">
          <p className="pv2-hero-eyebrow">{getTimeBasedGreeting(timezone)},</p>
          <h1 className="pv2-hero-title">{client.firstName}.</h1>
          <p className="pv2-hero-sub">Everything you need for your transformation, in one place.</p>
          {assessment?.recommendedSystem && <p className="pv2-hero-week">✨ Week {weekNumber} of your {assessment.recommendedSystem}</p>}
        </div>
        <img src="/images/dashboard/hero-photography.png" alt="" className="pv2-hero-photo" />
      </div>

      {/* ---------- Next appointment + preparation (burgundy marble) ---------- */}
      <div className="apd-panel apd-panel-marble pdash-appt-cta pdash-next">
        <div className="pdash-appt-cta-text">
          <p className="pdash-appt-cta-eyebrow">{nextAppointmentDetail ? "your next session" : "appointments"}</p>
          {nextAppointmentDetail ? (
            <>
              <h2 className="pdash-appt-cta-title">{nextAppointmentDetail.dateLabel}</h2>
              <p className="pdash-appt-cta-sub">
                arrive {nextAppointmentDetail.arrivalWindowLabel} · {nextAppointmentDetail.locationType === "HOME" ? "at your home" : "studio"}
              </p>
            </>
          ) : (
            <>
              <h2 className="pdash-appt-cta-title">Ready for your next session?</h2>
              <p className="pdash-appt-cta-sub">Send a request and we&apos;ll confirm the best time for you.</p>
            </>
          )}
          <div className="pdash-appt-cta-actions" style={{ marginTop: 16 }}>
            <BookSessionButton />
            <Link href="/portal/appointments" className="apd-btn-secondary pdash-appt-cta-link">My sessions →</Link>
            {nextAppointmentDetail && (
              <a href={nextAppointmentDetail.calendarUrl} target="_blank" rel="noopener noreferrer" className="apd-btn-secondary pdash-appt-cta-link">
                + Google Calendar
              </a>
            )}
          </div>
        </div>
        {nextAppointmentDetail && (
          <div className="pdash-prep">
            <p className="pdash-appt-cta-eyebrow">before you come</p>
            <ul>
              {prep.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link href="/portal/appointments/preparation" className="pdash-prep-link">full preparation guide →</Link>
          </div>
        )}
      </div>

      {/* ---------- Your package ---------- */}
      {(packageRows.length > 0 || totalSessions !== null) && (
        <div className="pd-card pdash-package">
          <div className="pdash-package-head">
            <h3>your system{assessment?.recommendedSystem ? ` · ${assessment.recommendedSystem}` : ""}</h3>
            <span>
              {packageRows.length > 0
                ? packageLeft === 0
                  ? "complete ✓"
                  : `${packageLeft} treatment${packageLeft === 1 ? "" : "s"} left`
                : `${remaining ?? 0} session${remaining === 1 ? "" : "s"} left`}
            </span>
          </div>
          {packageRows.length > 0 ? (
            <ul className="pdash-package-list">
              {packageRows.map((r) => (
                <li key={r.name} className={r.complete ? "done" : ""}>
                  <span className="pdash-check">{r.complete ? "✓" : ""}</span>
                  <span className="pdash-tech">{r.name}</span>
                  <span className="pdash-count">{r.done} of {r.total}</span>
                  <span className="pdash-bar">
                    <span style={{ width: `${(r.done / r.total) * 100}%` }} />
                  </span>
                  <span className="pdash-meta">{r.complete ? "complete" : r.scheduled > 0 ? `${r.scheduled} booked` : `${r.total - r.done} left`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="pdash-bar pdash-bar-lg">
                <span style={{ width: `${Math.min(progressPercent ?? 0, 100)}%` }} />
              </div>
              <p className="pay-history-meta">{completedCount} of {totalSessions} sessions completed</p>
            </>
          )}
        </div>
      )}

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

      {/* ---------- Quick Actions ---------- */}
      <div className="doc-card-grid" style={{ marginBottom: 20 }}>
        <Link href="/portal/blueprint" className="doc-client-card doc-client-card-burgundy">📘 Blueprint™</Link>
        <Link href="/portal/photos" className="doc-client-card doc-client-card-burgundy">📷 Progress Photos</Link>
        <Link href="/portal/documents" className="doc-client-card doc-client-card-burgundy">📄 Documents</Link>
        <Link href="/portal/invite" className="doc-client-card doc-client-card-burgundy">✨ Invite &amp; Earn</Link>
      </div>
    </div>
  );
}
