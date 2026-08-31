/**
 * Real, curated EN/ES translations for the shareable progress cards
 * (Share My Progress / Congratulations). Only ever translates the
 * fixed, known set of labels/phrases this app actually generates —
 * never a generic machine translation, since real measurement labels
 * and closing phrases come from a small finite set defined in
 * progress-celebration.ts.
 */

const LABEL_ES: Record<string, string> = {
  Weight: "Peso",
  "Body Fat": "Grasa Corporal",
  "Visceral Fat": "Grasa Visceral",
  "Muscle Mass": "Masa Muscular",
  "Skeletal Muscle": "Músculo Esquelético",
  "Body Water": "Agua Corporal",
  Waist: "Cintura",
  Abdomen: "Abdomen",
  Hips: "Cadera",
  "Right Thigh": "Muslo Derecho",
  "Left Thigh": "Muslo Izquierdo",
  "Right Arm": "Brazo Derecho",
  "Left Arm": "Brazo Izquierdo",
  Bust: "Busto",
  Chest: "Busto",
  Neck: "Cuello",
  Shoulder: "Hombro",
};

const CLOSING_PHRASE_ES: Record<string, string> = {
  "Less weight. Better hydration. Stronger composition.": "Menos peso. Mejor hidratación. Composición más fuerte.",
  "Less weight. Better hydration.\nBeautiful progress.": "Menos peso. Mejor hidratación.\nUn progreso hermoso.",
  "Stronger composition.\nBeautiful progress.": "Composición más fuerte.\nUn progreso hermoso.",
  "Your composition is moving in the right direction.\nBeautiful progress.": "Tu composición va en la dirección correcta.\nUn progreso hermoso.",
  "Your progress is showing.": "Tu progreso se está notando.",
  "Less volume. More definition.\nBeautiful progress.": "Menos volumen. Más definición.\nUn progreso hermoso.",
  "The commitment, care, and teamwork behind your journey are showing.\nYour consistency and the strategy we've built together are reflected in your progress.":
    "El compromiso, el cuidado y el trabajo en equipo detrás de tu proceso están dando resultados.\nTu constancia y la estrategia que hemos construido juntas se reflejan en tu progreso.",
  "Halfway isn't just a milestone. It's where your progress starts becoming strategy.":
    "La mitad no es solo un logro. Es donde tu progreso empieza a convertirse en estrategia.",
};

export function translateLabel(label: string, language: "en" | "es"): string {
  if (language === "en") return label;
  return LABEL_ES[label] ?? label;
}

export function translateClosingPhrase(phrase: string, language: "en" | "es"): string {
  if (language === "en") return phrase;
  return CLOSING_PHRASE_ES[phrase] ?? phrase;
}

export function translateCompareLabel(label: string, language: "en" | "es"): string {
  if (language === "en") return label;
  return label
    .replace(/^between /i, "entre ")
    .replace(/ and /g, " y ")
    .replace(/since your last scan/i, "desde tu último escaneo")
    .replace(/since your last check-in/i, "desde tu última revisión");
}

export function translateDirection(direction: "up" | "down", language: "en" | "es"): string {
  if (language === "en") return direction === "up" ? "increased" : "decreased";
  return direction === "up" ? "aumentó" : "disminuyó";
}

export const CARD_STRINGS = {
  en: {
    congratulations: "Congratulations!",
    keyMarker: (n: number) => `${n} key marker${n === 1 ? "" : "s"} improved`,
  },
  es: {
    congratulations: "¡Felicidades!",
    keyMarker: (n: number) => `${n} indicador${n === 1 ? "" : "es"} clave mejor${n === 1 ? "ó" : "aron"}`,
  },
};
