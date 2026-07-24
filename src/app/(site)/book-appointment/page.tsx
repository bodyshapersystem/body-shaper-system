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

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const DAYS_AHEAD = 14;

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
    const dateKey = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const slots = TIME_SLOTS.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      const slotDate = new Date(d);
      slotDate.setHours(h, m, 0, 0);
      return !takenKeys.has(slotDate.toISOString());
    });

    if (slots.length > 0) days.push({ dateKey, label, slots });
  }

  return (
    <div className="section" style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
      <span className="eyebrow">Reserve Your Spot</span>
      <h1 style={{ marginBottom: 10 }}>Book Your Body Blueprint™ Consultation</h1>
      <p style={{ marginBottom: 32, opacity: 0.75 }}>
        A $350 deposit reserves your appointment and goes toward your Personalized System™. Pick a date and time below.
      </p>
      <BookingForm days={days} />
    </div>
  );
}
