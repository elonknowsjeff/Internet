import React from "react";
import { useSettings } from "@/components/SettingsContext";
import { ACCENTS } from "@/lib/themeColors";

export default function AccentPicker() {
  const { settings, update } = useSettings();
  const active = settings.accent || "purple";

  return (
    <div className="ml-2 flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2 py-1" title="Theme colour">
      {ACCENTS.map((c) => (
        <button
          key={c.id}
          onClick={() => update({ accent: c.id })}
          aria-label={`${c.label} theme`}
          className={`w-4 h-4 rounded-full transition-transform ${active === c.id ? "scale-125 ring-2 ring-white/80" : "hover:scale-110 opacity-80"}`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}