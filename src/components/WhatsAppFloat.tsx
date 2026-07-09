import { WHATSAPP_URL } from "@/lib/nav";

export default function WhatsAppFloat() {
  return (
    <a href={WHATSAPP_URL} className="wa-float">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.33A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z"
          stroke="var(--ivory)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 9.5c0 3.5 2.5 6 6 6 .5 0 1-.5 1-1v-1l-2-1-1 1c-1 -.5 -2 -1.5 -2.5 -2.5l1 -1 -1 -2h-1c-.5 0-1 .5-1 1.5Z"
          fill="var(--ivory)"
        />
      </svg>
      <span>Chat with a Specialist</span>
    </a>
  );
}
