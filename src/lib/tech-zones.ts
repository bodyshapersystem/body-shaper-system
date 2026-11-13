/**
 * Treatment zones per technology — stored as `zone` on each
 * Appointment.technologies entry, so every session can be counted by area.
 */
import { techKey } from "@/lib/tech-count";

export const TECH_ZONES: Record<string, { key: string; label: string }[]> = {
  exilis: [
    { key: "legs-front", label: "legs · front (anterior)" },
    { key: "legs-back", label: "legs · back (posterior)" },
    { key: "abdomen", label: "abdomen" },
    { key: "arms", label: "arms" },
  ],
  ems: [
    { key: "abdomen", label: "abdomen" },
    { key: "glutes", label: "glutes" },
    { key: "legs", label: "legs" },
  ],
};

export function zonesFor(techName: string) {
  return TECH_ZONES[techKey(techName)] ?? [];
}

export function zoneLabel(techName: string, zone: string | null | undefined) {
  if (!zone) return null;
  return zonesFor(techName).find((z) => z.key === zone)?.label ?? zone;
}

/** Short label for chips: "front", "back", "abdomen"… */
export function zoneShort(techName: string, zone: string | null | undefined) {
  const l = zoneLabel(techName, zone);
  if (!l) return null;
  return l.replace(/^legs · /, "legs ").replace(/ \((anterior|posterior)\)$/, "");
}
