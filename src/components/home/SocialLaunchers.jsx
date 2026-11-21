import React from "react";
import { useNavigate } from "react-router-dom";
import { Twitter, Instagram, MessageCircle } from "lucide-react";

const APPS = [
  { name: "X", url: "https://x.com", Icon: Twitter, color: "#1d1d1f" },
  { name: "Instagram", url: "https://www.instagram.com", Icon: Instagram, color: "#E1306C" },
  { name: "WhatsApp", url: "https://web.whatsapp.com", Icon: MessageCircle, color: "#25D366" },
];

export default function SocialLaunchers() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-[600px] px-3 pt-4 sm:px-4">
      <div className="flex gap-2.5">
        {APPS.map((a) => (
          <button
            key={a.name}
            onClick={() => navigate(`/browser?url=${encodeURIComponent(a.url)}`)}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl ig-panel py-3 transition-transform active:scale-95"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: a.color }}>
              <a.Icon className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-semibold ig-text">{a.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}