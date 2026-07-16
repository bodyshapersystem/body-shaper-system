/**
 * Builds a real "Add to Google Calendar" link — Google's own URL
 * scheme, no backend/API needed. Opens pre-filled with everything
 * from the real appointment (nothing for the client to type in).
 */
export function buildGoogleCalendarUrl(params: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  locationText: string;
  detailsText: string;
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${fmt(params.startsAt)}/${fmt(params.endsAt)}`,
    details: params.detailsText,
    location: params.locationText,
  });
  return `https://calendar.google.com/calendar/render?${search.toString()}`;
}
