import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribe, dismissToast } from "@/lib/popupToast";
import { Bell, X, MessageSquare, Clock, BellRing } from "lucide-react";

const TONES = {
  default: { Icon: Bell, color: "var(--brand)" },
  message: { Icon: MessageSquare, color: "#EE8FB5" },
  reminder: { Icon: Clock, color: "#f5b54a" },
  system: { Icon: BellRing, color: "var(--brand)" },
};

// Toast/popup notifications shown in the corner for new messages, reminders and
// app alerts. Auto-dismisses after a few seconds; click to jump to the source.
export default function ToastPopups() {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => subscribe(setToasts), []);

  const open = (t) => {
    dismissToast(t.id);
    if (t.to) navigate(t.to);
  };

  return (
    <div className="pointer-events-none fixed left-1/2 top-0 z-[120] flex w-full max-w-[420px] -translate-x-1/2 flex-col gap-2 p-3 sm:left-auto sm:right-4 sm:top-auto sm:bottom-4 sm:translate-x-0">
      {toasts.map((t) => {
        const tone = TONES[t.tone] || TONES.default;
        const Icon = tone.Icon;
        return (
          <div
            key={t.id}
            onClick={() => open(t)}
            className="pointer-events-auto group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#12141c]/95 p-3.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-slide-up"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: tone.color }}>
              <Icon className="h-4 w-4 text-black" />
            </span>
            <div className="min-w-0 flex-1">
              {t.title && <p className="truncate text-[13px] font-bold text-white">{t.title}</p>}
              {t.body && <p className="line-clamp-2 text-[12px] leading-snug text-white/60">{t.body}</p>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}
              className="shrink-0 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <span
              className="absolute bottom-0 left-0 h-[2px] rounded-full"
              style={{ background: tone.color, animation: "popupToastShrink 5.2s linear forwards" }}
            />
            <style>{`@keyframes popupToastShrink{from{width:100%}to{width:0%}}`}</style>
          </div>
        );
      })}
    </div>
  );
}