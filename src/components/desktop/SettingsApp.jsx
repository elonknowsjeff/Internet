import React from "react";
import { Link } from "react-router-dom";
import { Check, Palette, Image as ImageIcon, PanelLeft, Sparkles, ArrowUpRight } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { ACCENTS } from "@/lib/themeColors";

const BACKGROUNDS = [
  { key: "space", label: "Live space" },
  { key: "aurora", label: "Aurora" },
  { key: "waves", label: "Neon waves" },
  { key: "mesh", label: "Mesh glow" },
  { key: "gradient", label: "Deep space" },
  { key: "black", label: "Pure black" },
];

const LAYOUTS = [
  { key: "dock", label: "Dock only" },
  { key: "full", label: "Sidebar + Dock" },
  { key: "sidebar", label: "Sidebar only" },
];

function Row({ title, icon: Icon, children }) {
  return (
    <div className="px-3 py-3 border-b border-white/10">
      <p className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> {title}
      </p>
      {children}
    </div>
  );
}

export default function SettingsApp() {
  const { settings, update } = useSettings();

  return (
    <div className="h-full flex flex-col bg-[#0b0d13] text-white text-xs overflow-y-auto">
      <Row title="Accent colour" icon={Palette}>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ accent: c.id })}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/10 hover:border-white/30"
            >
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: c.hex }} />
              <span className="text-neutral-300">{c.label}</span>
              {(settings.accent || "purple") === c.id && <Check className="w-3 h-3" style={{ color: c.hex }} />}
            </button>
          ))}
        </div>
      </Row>

      <Row title="Background" icon={ImageIcon}>
        <div className="grid grid-cols-2 gap-1.5">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.key}
              onClick={() => update({ background: b.key })}
              className={`px-2 py-1.5 rounded-md border text-left ${settings.background === b.key ? "border-white/50 bg-white/10" : "border-white/10 hover:border-white/30"}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </Row>

      <Row title="Navigation" icon={PanelLeft}>
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUTS.map((l) => (
            <button
              key={l.key}
              onClick={() => update({ navStyle: l.key })}
              className={`px-1.5 py-1.5 rounded-md border text-center leading-tight ${settings.navStyle === l.key ? "border-white/50 bg-white/10" : "border-white/10 hover:border-white/30"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Row>

      <Row title="Assistant" icon={Sparkles}>
        <button
          onClick={() => update({ hideFloatingAssistant: !settings.hideFloatingAssistant })}
          className={`w-full py-1.5 rounded-md font-semibold ${settings.hideFloatingAssistant ? "border border-white/15 text-neutral-300" : "brand-grad text-black"}`}
        >
          {settings.hideFloatingAssistant ? "Assistant hidden — tap to show" : "Assistant shown — tap to hide"}
        </button>
      </Row>

      <Link to="/settings" className="px-3 py-3 flex items-center gap-1.5 text-neutral-300 hover:text-white">
        Open full settings <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}