import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => (
  <a
    href="https://wa.me/8801533413290?text=Assalamu%20Alaikum%20Delilar%2C%20I%20have%20a%20question."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(34,197,94,0.55)] hover:scale-110 hover:bg-green-500 transition-all duration-300"
  >
    <MessageCircle size={26} />
    <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping" />
  </a>
);

export default WhatsAppButton;
