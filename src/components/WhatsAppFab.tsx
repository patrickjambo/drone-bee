'use client';

// Floating WhatsApp button for storefront pages.
const WHATSAPP = '250783314404';
const MESSAGE = "Hello Drone Bee! 🍯 I'd like to know more about your honey.";

export default function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white pl-3 pr-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform group"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.044z" />
      </svg>
      <span className="font-bold text-sm hidden sm:block max-w-0 overflow-hidden group-hover:max-w-[140px] transition-all duration-300 whitespace-nowrap">Chat with us</span>
    </a>
  );
}
