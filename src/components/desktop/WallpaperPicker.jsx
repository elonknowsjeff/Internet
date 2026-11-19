import React from "react";
import { Check, Image as ImageIcon, Sparkles, X } from "lucide-react";

export const WALLPAPER_IMAGES = [
  { id: "mountains", label: "Alpine dusk", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80" },
  { id: "lake", label: "Quiet lake", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" },
  { id: "nightsky", label: "Night sky", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80" },
  { id: "forest", label: "Forest mist", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80" },
  { id: "beach", label: "Shoreline", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80" },
  { id: "nebula", label: "Nebula", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600&q=80" },
];

export default function WallpaperPicker({ current, onPick, auto, onAuto, onClose }) {
  return (
    <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-3xl gloss-strong p-4 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-4 h-4" style={{ color: "var(--brand)" }} />
          <h2 className="text-[15px] font-bold flex-1">Desktop wallpaper</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2">Photo wallpapers</p>
        <div className="grid grid-cols-3 gap-2">
          {WALLPAPER_IMAGES.map((w) => (
            <button
              key={w.id}
              onClick={() => onPick(w.id)}
              className={`relative group rounded-xl overflow-hidden aspect-video border transition ${current === w.id ? "border-white" : "border-white/15 hover:border-white/50"}`}
            >
              <img src={w.url} alt={w.label} className="w-full h-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] font-semibold bg-gradient-to-t from-black/80 to-transparent text-left">
                {w.label}
              </span>
              {current === w.id && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-black grid place-items-center">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--brand)" }} />
          <div className="flex-1">
            <p className="text-[12.5px] font-semibold">Auto-change wallpaper</p>
            <p className="text-[11px] text-white/45">Rotates through your wallpapers every 30 seconds.</p>
          </div>
          <button
            onClick={onAuto}
            className={`w-11 h-6 rounded-full transition-colors relative ${auto ? "bg-[color:var(--brand)]" : "bg-white/20"}`}
            aria-label="Toggle auto wallpaper"
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${auto ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}