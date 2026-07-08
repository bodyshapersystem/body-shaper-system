import { WHATSAPP_URL } from "@/lib/nav";

export default function WhatsAppFloat() {
  return (
    <a href={WHATSAPP_URL} className="wa-float">
      💬 <span>Chat with a Specialist</span>
    </a>
  );
}
