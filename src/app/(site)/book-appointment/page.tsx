import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";

export const metadata: Metadata = buildMetadata({
  title: "Book Your Body Blueprint™ Consultation",
  description: "Reserve your Body Blueprint™ consultation online with a $350 deposit — pick a date and time that works for you.",
  path: "/book-appointment",
});

export const dynamic = "force-dynamic";

// Body Blueprint™ deposit bookings: Mondays only, 11:00 AM – 4:30 PM.
const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const DAYS_AHEAD = 35; // wide enough window to reliably catch several upcoming Mondays

// Deterministic pseudo-random pick, seeded by the date string, so the
// same day always shows the same "already booked" slots on reload —
// not a different random set every request, which would look buggy.
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function pickPaddingSlots(dateKey: string, available: string[], count: number): Set<string> {
  const picked = new Set<string>();
  const pool = [...available];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(seededRandom(`${dateKey}-${i}`) * pool.length);
    picked.add(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

export default async function BookAppointmentPage() {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + DAYS_AHEAD + 1);

  const taken = await prisma.appointment.findMany({
    where: { status: "SCHEDULED", startsAt: { gte: now, lt: windowEnd } },
    select: { startsAt: true },
  });
  const takenKeys = new Set(taken.map((a) => a.startsAt.toISOString()));

  const days: { dateKey: string; label: string; slots: string[] }[] = [];
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    if (d.getDay() !== 1) continue; // Mondays only

    const dateKey = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const reallyOpen = TIME_SLOTS.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      const slotDate = new Date(d);
      slotDate.setHours(h, m, 0, 0);
      return !takenKeys.has(slotDate.toISOString());
    });

    // Show 3 of the genuinely-open slots as "already booked" so the
    // day doesn't read as wide open — same 3 every time for a given
    // Monday, real availability underneath is unaffected.
    const padded = pickPaddingSlots(dateKey, reallyOpen, 3);
    const slots = reallyOpen.filter((t) => !padded.has(t));

    if (slots.length > 0) days.push({ dateKey, label, slots });
  }

  return (
    <div className="section" style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
      <span className="eyebrow">Reserve Your Spot</span>
      <h1 style={{ marginBottom: 10 }}>Book Your Body Blueprint™ Consultation</h1>
      <p style={{ marginBottom: 32, opacity: 0.75 }}>
        A $350 deposit reserves your appointment and goes toward your Personalized System™. Body Blueprint™ consultations are offered Mondays, 11:00 AM – 4:30 PM — pick a date and time below.
      </p>
      <BookingForm days={days} />
    </div>
  );
}
