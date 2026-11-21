import React from "react";
import { X, Palette } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { THEMES } from "@/lib/themes";

const BACKGROUNDS = [
  { key: "trails", label: "Aurora" },
  { key: "planets", label: "Planets" },
  { key: "orbit", label: "Orbit" },
  { key: "space", label: "Starfield" },
  { key: "waves", label: "Waves" },
  { key: "black", label: "Solid" },
];

export default function ThemeSheet({ open, onClose }) {
  const { settings, update } = useSettings();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[560px] rounded-t-[28px] sm:rounded-[28px] border border-white/10 bg-[#121218]/95 p-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" style={{ color: "var(--brand)" }} />
          <h2 className="text-[17px] font-extrabold tracking-tight">Themes</h2>
          <button onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">Color theme</p>
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => update({ theme: t.id })} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-14 w-full rounded-2xl ring-2 transition ${settings.theme === t.id ? "ring-[var(--brand)]" : "ring-transparent"}`}
                style={{ background: `linear-gradient(135deg, ${t.aurora[0]}, ${t.aurora[1]} 50%, ${t.aurora[2]})` }}
              />
              <span className={`text-[10.5px] font-semibold ${settings.theme === t.id ? "text-[var(--brand)]" : "text-white/55"}`}>{t.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">Background</p>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.key}
              onClick={() => update({ background: b.key })}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                settings.background === b.key
                  ? "border-transparent text-black"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:text-white"
              }`}
              style={settings.background === b.key ? { background: "var(--brand)" } : undefined}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}