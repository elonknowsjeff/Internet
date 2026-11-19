import React from "react";
import { PenLine } from "lucide-react";

export default function QuickComposeBar({ avatar, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[min(90vw,470px)] flex items-center gap-2.5 rounded-full border border-white/15 bg-[#120d26]/95 backdrop-blur-2xl pl-1.5 pr-2 py-1.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.95)] hover:border-white/30 transition-colors"
    >
      <span className="w-8 h-8 rounded-full overflow-hidden bg-white/10 grid place-items-center shrink-0">
        {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <PenLine className="w-4 h-4 text-white/60" />}
      </span>
      <span className="text-[13.5px] text-white/50">What's happening?</span>
      <span className="ml-auto px-3.5 py-1.5 rounded-full brand-grad text-black text-[12px] font-bold">Post</span>
    </button>
  );
}