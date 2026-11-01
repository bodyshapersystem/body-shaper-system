/**
 * Client Proposals™ — all fixed copy for the master template, EN + ES.
 * Mostly lowercase by design. No guaranteed results anywhere.
 */
import type { GoalKey, TechnologyKey, ZoneKey } from "./types";

export type Lang = "en" | "es";

type TechCopy = {
  name: string;
  short: string;
  freq: string;
  time: string;
  what: string;
  use: string;
  integrate: string;
  feel: string;
  eligibility: string;
};

type Copy = {
  preparedFor: string;
  title: [string, string];
  explore: string;
  nav: { blueprint: string; technology: string; results: string; plan: string; faq: string };
  payNow: string;
  next: { eyebrow: string; title: (n: string) => string; confirming: string; text: string; button: string; wa: (p: string) => string };
  sec: { technology: string; results: string; plan: string; planTitle: string; planIntro: string; faq: string; select: string; selected: string; promoOr: string };
  pillars: [string, string, string];
  goalsEyebrow: string;
  goalsTitle: string;
  goalsIntro: string;
  zonesLabel: string;
  goalsLabel: string;
  zones: Record<ZoneKey, string>;
  goals: Record<GoalKey, string>;
  welcomeText: (goals: string[], zones: string[]) => string;
  systemsEyebrow: string;
  systemsTitle: string;
  systemsIntro: string;
  recommended: string;
  option: (n: number) => string;
  technologySessions: (n: number) => string;
  from: string;
  viewDetails: string;
  hideDetails: string;
  objectives: string;
  included: string;
  tech: Record<TechnologyKey, TechCopy>;
  paymentEyebrow: string;
  paymentTitle: string;
  chooseProgram: string;
  choosePayment: string;
  payFull: string;
  payFullNote: (saving: string) => string;
  pay2: string;
  pay2Note: (first: string, second: string) => string;
  each: string;
  regular: string;
  dueToday: string;
  consent: (first: string, second: string) => string;
  bookPay: string;
  redirecting: string;
  previewOnly: string;
  scheduleNote: string;
  paidFull: string;
  paidFirst: (second: string) => string;
  techEyebrow: string;
  techTitle: string;
  techIntro: string;
  learnMore: string;
  close: string;
  modalHeads: { what: string; use: string; integrate: string; feel: string; eligibility: string; rhythm: string };
  photoPending: string;
  processEyebrow: string;
  processTitle: string;
  processIntro: string;
  steps: { title: string; text: string }[];
  founderEyebrow: string;
  founderDefaultBio: string;
  resultsEyebrow: string;
  resultsTitle: string;
  resultsIntro: string;
  before: string;
  after: string;
  resultsNote: string;
  faqEyebrow: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  promoTreatments: string;
  promoBook: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  footerTagline: string;
  disclaimer: string;
};

const listJoin = (items: string[], and: string) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;

const en: Copy = {
  preparedFor: "prepared exclusively for",
  title: ["your personalized", "body blueprint"],
  explore: "explore your blueprint",
  nav: { blueprint: "your blueprint", technology: "technology", results: "results", plan: "your plan", faq: "faq" },
  payNow: "continue to secure payment",
  next: { eyebrow: "next step", title: (n) => `thank you, ${n}`, confirming: "your payment is being confirmed.", text: "now let's schedule your appointments — message us and we'll organize your calendar with you.", button: "schedule my appointments on whatsapp", wa: (p) => `hi! i just reserved my ${p} program and i'd like to schedule my appointments.` },
  sec: { technology: "how each technology works", results: "the vision & real results", plan: "your plan & investment", planTitle: "choose your program", planIntro: "only the programs selected for you. your session distribution is confirmed after your evaluation.", faq: "questions", select: "choose this program", selected: "selected", promoOr: "or begin with our seasonal ritual" },
  pillars: ["personalized protocol", "advanced technology", "guided transformation"],
  goalsEyebrow: "understanding your goals",
  goalsTitle: "what your body is asking for",
  goalsIntro: "from your body blueprint™ evaluation, these are the areas and priorities your strategy is built around.",
  zonesLabel: "priority zones",
  goalsLabel: "your goals",
  zones: { legs: "legs", abdomen: "abdomen", arms: "arms", glutes: "glutes", waist: "waist" },
  goals: {
    firmness: "firmness",
    laxity: "appearance of laxity",
    texture: "skin texture",
    contour: "contour",
    "muscle-tone": "muscle tone",
  },
  welcomeText: (goals, zones) =>
    goals.length || zones.length
      ? `a strategy designed around you${zones.length ? ` — focused on your ${listJoin(zones, "and")}` : ""}${
          goals.length ? `, to support ${listJoin(goals, "and")}` : ""
        }.`
      : "a tailored strategy designed around your body, your goals and your rhythm.",
  systemsEyebrow: "your recommended systems",
  systemsTitle: "choose your transformation",
  systemsIntro: "only the programs selected for you. tap a program to see what it includes.",
  recommended: "recommended",
  option: (n) => `option ${String(n).padStart(2, "0")}`,
  technologySessions: (n) => `${n} technology sessions`,
  from: "from",
  viewDetails: "view details",
  hideDetails: "hide details",
  objectives: "protocol objectives",
  included: "technologies included",
  tech: {
    exilis: {
      name: "exilis ultra",
      short: "skin firmness & contour",
      freq: "usually once a week (every 7–15 days)",
      time: "about 30 minutes, depending on your case",
      what: "exilis ultra combines radiofrequency and ultrasound energy delivered through a handpiece that glides over the skin.",
      use: "it is used to support the look of firmer, smoother skin and a more defined contour in areas such as the abdomen, legs and arms.",
      integrate:
        "in your blueprint it is the base technology for skin quality — sessions are spaced and combined with endospheres and ems according to your evaluation.",
      feel: "most clients describe a gradual warmth, similar to a hot-stone massage. you can return to your day right after the session.",
      eligibility:
        "not suitable during pregnancy, with implanted electronic devices or metal in the treated area, and some medical conditions. your eligibility is confirmed in your evaluation.",
    },
    endospheres: {
      name: "endospheres",
      short: "texture & circulation",
      freq: "1 to 3 times a week, depending on your case",
      time: "15–45 minutes, depending on your case",
      what: "endospheres therapy uses a cylinder of 55 rotating spheres that applies compressive micro-vibration to the tissue.",
      use: "it is used to support circulation, lymphatic flow and the look of smoother skin texture.",
      integrate:
        "in your blueprint it prepares and supports the tissue between exilis ultra and ems sessions, as part of one coordinated protocol.",
      feel: "a rhythmic, deep massage sensation. pressure and speed are adjusted to your comfort.",
      eligibility:
        "not suitable over open skin, recent surgery or certain vascular conditions. your specialist reviews your health history before the first session.",
    },
    ems: {
      name: "ems",
      short: "muscle tone & definition",
      freq: "1 to 3 times a week, depending on your case",
      time: "30 minutes",
      what: "ems (electromagnetic muscle stimulation) produces strong, controlled muscle contractions in the treated area.",
      use: "it is used to support muscle tone, strength and a more defined look in areas such as the glutes, abdomen and legs.",
      integrate: "in your blueprint it adds the muscle component of the strategy, alongside the skin-focused technologies.",
      feel: "intense, rhythmic contractions — similar to a deep workout — with no downtime.",
      eligibility:
        "not suitable during pregnancy, with pacemakers or implanted metal/electronic devices near the area, and some medical conditions. confirmed in your evaluation.",
    },
  },
  paymentEyebrow: "program details & payment",
  paymentTitle: "reserve your program",
  chooseProgram: "your program",
  choosePayment: "choose your payment option",
  payFull: "pay in full",
  payFullNote: (s) => `save ${s}`,
  pay2: "pay in 2",
  pay2Note: (a, b) => `${a} at booking + ${b} in week 2`,
  each: "each",
  regular: "regular",
  dueToday: "due today",
  consent: (a, b) =>
    `i agree to pay in two installments: ${a} today at booking and ${b} during week 2 of my treatment program, counted from my confirmed start date. i will receive a secure payment link for the second installment — no card is stored and no recurring charges are created.`,
  bookPay: "book & pay",
  redirecting: "opening secure checkout…",
  previewOnly: "preview only — checkout is disabled in this sample",
  scheduleNote:
    "your program begins on the date confirmed after your evaluation. session distribution is personalized and may be completed after week 2 based on your schedule, eligibility and availability.",
  paidFull: "your program is reserved and paid in full. thank you.",
  paidFirst: (b) => `your program is reserved. your second installment of ${b} is due during week 2 of your program.`,
  techEyebrow: "our technology",
  techTitle: "three technologies, one strategy",
  techIntro: "advanced technologies combined in synergy, adjusted to your body at every stage.",
  learnMore: "learn more",
  close: "close",
  modalHeads: {
    what: "what it is",
    use: "what it is used for",
    integrate: "how it fits your system",
    feel: "what you may experience",
    eligibility: "eligibility",
    rhythm: "frequency & duration",
  },
  photoPending: "original equipment photo pending",
  processEyebrow: "how your blueprint works",
  processTitle: "a strategy, not a single treatment",
  processIntro:
    "every body receives an individual strategy. the distribution of your sessions is confirmed after your evaluation — there is no identical calendar for every client.",
  steps: [
    { title: "discover", text: "we listen to your goals, history and lifestyle." },
    { title: "assess", text: "your body blueprint™ evaluation measures where to focus." },
    { title: "design", text: "we select technologies, sessions and timing for your body." },
    { title: "optimize", text: "each session is adjusted to how your body responds." },
    { title: "transform", text: "we follow up, measure and guide your next stage." },
  ],
  founderEyebrow: "about the founder",
  founderDefaultBio:
    "body shaper system™ was created to bring advanced body-contouring technology into a personalized strategy — designed around each woman's body, goals and life — with close guidance through every stage of her transformation.",
  resultsEyebrow: "real results",
  resultsTitle: "real clients, real protocols",
  resultsIntro: "authentic, authorized photos of body shaper system™ clients.",
  before: "before",
  after: "after",
  resultsNote: "individual results vary.",
  faqEyebrow: "frequently asked questions",
  faqTitle: "questions, answered",
  faqs: [
    { q: "how many sessions will i need?", a: "your program shows the sessions recommended for your goals. the exact distribution is confirmed after your evaluation and adjusted as your body responds." },
    { q: "which technology is best for me?", a: "it depends on your body and priorities. your blueprint combines exilis ultra, endospheres and ems in the proportions selected for you." },
    { q: "how long and how often are sessions?", a: "exilis ultra: about 30 minutes, usually once a week (every 7–15 days). endospheres: 15–45 minutes, 1 to 3 times a week. ems: 30 minutes, 1 to 3 times a week. everything depends on your case and is confirmed in your evaluation." },
    { q: "when will i see results?", a: "many clients notice changes progressively over the program. results vary from person to person and are not guaranteed." },
    { q: "are there contraindications?", a: "yes — such as pregnancy, implanted electronic devices or metal in the area, and some medical conditions. your eligibility is reviewed before you start." },
    { q: "how do payments work?", a: "pay in full and save, or pay in 2: the first installment at booking and the second during week 2 of your actual program. no cards are stored and there are no recurring charges." },
  ],
  promoTreatments: "3 technologies · 9 treatments",
  promoBook: "reserve my 333 ritual",
  ctaTitle: "questions before you begin?",
  ctaText: "message us and we will walk you through your blueprint.",
  ctaButton: "message us on whatsapp",
  footerTagline: "science · strategy · transformation",
  disclaimer: "results vary. treatments are subject to suitability, evaluation and availability. this proposal is private and prepared for you.",
};

const es: Copy = {
  ...en,
  preparedFor: "preparado exclusivamente para",
  title: ["tu body blueprint", "personalizado"],
  explore: "explora tu blueprint",
  nav: { blueprint: "tu blueprint", technology: "tecnología", results: "resultados", plan: "tu plan", faq: "preguntas" },
  payNow: "continuar al pago seguro",
  next: { eyebrow: "siguiente paso", title: (n) => `gracias, ${n}`, confirming: "tu pago se está confirmando.", text: "ahora agendemos tus citas — escríbenos y organizamos tu calendario contigo.", button: "agendar mis citas por whatsapp", wa: (p) => `¡hola! acabo de reservar mi programa ${p} y quiero agendar mis citas.` },
  sec: { technology: "cómo funciona cada tecnología", results: "la visión y resultados reales", plan: "tu plan e inversión", planTitle: "elige tu programa", planIntro: "solo los programas seleccionados para ti. la distribución de tus sesiones se confirma tras tu evaluación.", faq: "preguntas", select: "elegir este programa", selected: "seleccionado", promoOr: "o empieza con nuestro ritual de temporada" },
  pillars: ["protocolo personalizado", "tecnología avanzada", "transformación guiada"],
  goalsEyebrow: "entendiendo tus objetivos",
  goalsTitle: "lo que tu cuerpo necesita",
  goalsIntro: "a partir de tu evaluación body blueprint™, estas son las zonas y prioridades sobre las que se construye tu estrategia.",
  zonesLabel: "zonas prioritarias",
  goalsLabel: "tus objetivos",
  zones: { legs: "piernas", abdomen: "abdomen", arms: "brazos", glutes: "glúteos", waist: "cintura" },
  goals: { firmness: "firmeza", laxity: "apariencia de flacidez", texture: "textura de la piel", contour: "contorno", "muscle-tone": "tono muscular" },
  welcomeText: (goals, zones) =>
    goals.length || zones.length
      ? `una estrategia a tu medida${zones.length ? ` — enfocada en ${listJoin(zones, "y")}` : ""}${
          goals.length ? `, para trabajar ${listJoin(goals, "y")}` : ""
        }.`
      : "una estrategia diseñada alrededor de tu cuerpo, tus objetivos y tu ritmo.",
  systemsEyebrow: "tus sistemas recomendados",
  systemsTitle: "elige tu transformación",
  systemsIntro: "solo los programas seleccionados para ti. toca un programa para ver lo que incluye.",
  recommended: "recomendado",
  option: (n) => `opción ${String(n).padStart(2, "0")}`,
  technologySessions: (n) => `${n} sesiones de tecnología`,
  from: "desde",
  viewDetails: "ver detalles",
  hideDetails: "ocultar detalles",
  objectives: "objetivos del protocolo",
  included: "tecnologías incluidas",
  tech: {
    exilis: {
      name: "exilis ultra",
      short: "firmeza y contorno",
      freq: "por lo general una vez por semana (cada 7 a 15 días)",
      time: "unos 30 minutos, según tu caso",
      what: "exilis ultra combina radiofrecuencia y ultrasonido aplicados con un cabezal que se desliza sobre la piel.",
      use: "se utiliza para favorecer una piel de aspecto más firme y uniforme y un contorno más definido en zonas como abdomen, piernas y brazos.",
      integrate: "en tu blueprint es la tecnología base para la calidad de la piel; las sesiones se combinan con endospheres y ems según tu evaluación.",
      feel: "la mayoría lo describe como un calor progresivo, parecido a un masaje con piedras calientes. puedes seguir tu día después de la sesión.",
      eligibility: "no indicado durante el embarazo, con dispositivos electrónicos implantados o metal en la zona, ni con algunas condiciones médicas. tu elegibilidad se confirma en la evaluación.",
    },
    endospheres: {
      name: "endospheres",
      short: "textura y circulación",
      freq: "de 1 a 3 veces por semana, según tu caso",
      time: "de 15 a 45 minutos, según tu caso",
      what: "la terapia endospheres utiliza un cilindro de 55 esferas rotatorias que aplica micro-vibración compresiva sobre el tejido.",
      use: "se utiliza para favorecer la circulación, el drenaje linfático y una textura de piel de aspecto más uniforme.",
      integrate: "en tu blueprint prepara y acompaña el tejido entre las sesiones de exilis ultra y ems, dentro de un mismo protocolo.",
      feel: "una sensación de masaje profundo y rítmico. la presión y la velocidad se ajustan a tu comodidad.",
      eligibility: "no indicado sobre piel abierta, cirugías recientes o ciertas condiciones vasculares. tu especialista revisa tu historial antes de la primera sesión.",
    },
    ems: {
      name: "ems",
      short: "tono y definición muscular",
      freq: "de 1 a 3 veces por semana, según tu caso",
      time: "30 minutos",
      what: "ems (estimulación muscular electromagnética) produce contracciones musculares intensas y controladas en la zona tratada.",
      use: "se utiliza para favorecer el tono, la fuerza y un aspecto más definido en zonas como glúteos, abdomen y piernas.",
      integrate: "en tu blueprint aporta el componente muscular de la estrategia, junto a las tecnologías enfocadas en la piel.",
      feel: "contracciones intensas y rítmicas, como un entrenamiento profundo, sin tiempo de recuperación.",
      eligibility: "no indicado durante el embarazo, con marcapasos o metal/dispositivos implantados cerca de la zona, ni con algunas condiciones médicas. se confirma en tu evaluación.",
    },
  },
  paymentEyebrow: "detalles del programa y pago",
  paymentTitle: "reserva tu programa",
  chooseProgram: "tu programa",
  choosePayment: "elige tu forma de pago",
  payFull: "pago completo",
  payFullNote: (s) => `ahorras ${s}`,
  pay2: "2 pagos",
  pay2Note: (a, b) => `${a} al reservar + ${b} en la semana 2`,
  each: "c/u",
  regular: "precio regular",
  dueToday: "a pagar hoy",
  consent: (a, b) =>
    `acepto pagar en dos cuotas: ${a} hoy al reservar y ${b} durante la semana 2 de mi programa, contada desde mi fecha de inicio confirmada. recibiré un enlace seguro para la segunda cuota — no se guarda ninguna tarjeta ni se crean cobros recurrentes.`,
  bookPay: "reservar y pagar",
  redirecting: "abriendo el pago seguro…",
  previewOnly: "solo vista previa — el pago está desactivado en esta muestra",
  scheduleNote:
    "tu programa comienza en la fecha confirmada tras tu evaluación. la distribución de sesiones es personalizada y puede completarse después de la semana 2 según tu agenda, elegibilidad y disponibilidad.",
  paidFull: "tu programa está reservado y pagado por completo. gracias.",
  paidFirst: (b) => `tu programa está reservado. tu segunda cuota de ${b} vence durante la semana 2 de tu programa.`,
  techEyebrow: "nuestra tecnología",
  techTitle: "tres tecnologías, una estrategia",
  techIntro: "tecnologías avanzadas que trabajan en sinergia, ajustadas a tu cuerpo en cada etapa.",
  learnMore: "ver más",
  close: "cerrar",
  modalHeads: { what: "qué es", use: "para qué se utiliza", integrate: "cómo se integra en tu sistema", feel: "qué puedes sentir", eligibility: "elegibilidad", rhythm: "frecuencia y duración" },
  photoPending: "foto original del equipo pendiente",
  processEyebrow: "cómo funciona tu blueprint",
  processTitle: "una estrategia, no un tratamiento aislado",
  processIntro:
    "cada cuerpo recibe una estrategia individual. la distribución de tus sesiones se confirma tras tu evaluación — no existe un calendario idéntico para todas.",
  steps: [
    { title: "discover", text: "escuchamos tus objetivos, historial y estilo de vida." },
    { title: "assess", text: "tu evaluación body blueprint™ mide dónde enfocarnos." },
    { title: "design", text: "seleccionamos tecnologías, sesiones y tiempos para tu cuerpo." },
    { title: "optimize", text: "cada sesión se ajusta a cómo responde tu cuerpo." },
    { title: "transform", text: "medimos, acompañamos y guiamos tu siguiente etapa." },
  ],
  founderEyebrow: "sobre la fundadora",
  founderDefaultBio:
    "body shaper system™ nació para integrar tecnología avanzada de contorno corporal en una estrategia personalizada — diseñada alrededor del cuerpo, los objetivos y la vida de cada mujer — con acompañamiento cercano en cada etapa de su transformación.",
  resultsEyebrow: "resultados reales",
  resultsTitle: "clientas reales, protocolos reales",
  resultsIntro: "fotografías auténticas y autorizadas de clientas de body shaper system™.",
  before: "antes",
  after: "después",
  resultsNote: "los resultados varían de persona a persona.",
  faqEyebrow: "preguntas frecuentes",
  faqTitle: "tus preguntas",
  faqs: [
    { q: "¿cuántas sesiones necesito?", a: "tu programa muestra las sesiones recomendadas para tus objetivos. la distribución exacta se confirma tras tu evaluación y se ajusta según responde tu cuerpo." },
    { q: "¿qué tecnología es la mejor para mí?", a: "depende de tu cuerpo y tus prioridades. tu blueprint combina exilis ultra, endospheres y ems en las proporciones elegidas para ti." },
    { q: "¿cuánto dura cada sesión y cada cuánto?", a: "exilis ultra: unos 30 minutos, por lo general una vez por semana (cada 7 a 15 días). endospheres: de 15 a 45 minutos, de 1 a 3 veces por semana. ems: 30 minutos, de 1 a 3 veces por semana. todo depende de tu caso y se confirma en tu evaluación." },
    { q: "¿cuándo veré resultados?", a: "muchas clientas notan cambios de forma progresiva durante el programa. los resultados varían y no están garantizados." },
    { q: "¿hay contraindicaciones?", a: "sí — como embarazo, dispositivos electrónicos implantados o metal en la zona, y algunas condiciones médicas. tu elegibilidad se revisa antes de empezar." },
    { q: "¿cómo funcionan los pagos?", a: "paga completo y ahorra, o en 2 pagos: el primero al reservar y el segundo durante la semana 2 de tu programa real. no guardamos tarjetas ni hay cobros recurrentes." },
  ],
  promoTreatments: "3 tecnologías · 9 tratamientos",
  promoBook: "reservar mi ritual 333",
  ctaTitle: "¿dudas antes de empezar?",
  ctaText: "escríbenos y te explicamos tu blueprint paso a paso.",
  ctaButton: "escríbenos por whatsapp",
  footerTagline: "ciencia · estrategia · transformación",
  disclaimer: "los resultados varían. los tratamientos están sujetos a idoneidad, evaluación y disponibilidad. esta propuesta es privada y preparada para ti.",
};

export const COPY: Record<Lang, Copy> = { en, es };
export const WHATSAPP_NUMBER = "17379755112";
