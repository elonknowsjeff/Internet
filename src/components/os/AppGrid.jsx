import React from "react";
import { APPS } from "@/components/os/desktopApps";
import { X } from "lucide-react";

export default function AppGrid({ onOpen, onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center hover:bg-white/10 text-white/70"><X className="w-5 h-5" /></button>
      <h2 className="text-[14px] font-semibold text-white/60 mb-5 uppercase tracking-wide">All apps</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-3xl px-6" onClick={(e) => e.stopPropagation()}>
        {Object.entries(APPS).map(([key, app]) => {
          const Icon = app.icon;
          return (
            <button key={key} onClick={() => onOpen(key)} className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 transition-colors w-[96px]">
              <span className="grid h-14 w-14 place-items-center rounded-2xl brand-grad text-black shadow-[0_8px_20px_-10px_var(--brand)] transition-transform group-hover:scale-105">
                <Icon className="w-6 h-6" />
              </span>
              <span className="text-[12px] font-medium text-white/80">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}