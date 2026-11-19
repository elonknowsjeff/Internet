import React, { useState } from "react";
import { Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/components/SettingsContext";
import SettingsRow, { Group, Pill } from "@/components/settings/SettingsRow";
import { ACCENTS } from "@/lib/themeColors";

const BACKGROUNDS = [
  { key: "trails", label: "Walza trails" },
  { key: "planets", label: "Planet glow" },
  { key: "orbit", label: "Solar orbit" },
  { key: "space", label: "Starfield" },
  { key: "aurora", label: "Aurora" },
  { key: "waves", label: "Liquid waves" },
  { key: "mesh", label: "Mesh glow" },
  { key: "gradient", label: "Lilac dusk" },
  { key: "sunset", label: "Sunset" },
  { key: "ocean", label: "Ocean" },
  { key: "ember", label: "Ember" },
  { key: "forest", label: "Forest" },
  { key: "candy", label: "Candy" },
  { key: "black", label: "Midnight" },
];

export default function AppearancePane() {
  const { settings, update } = useSettings();
  const [desktopOs, setDesktopOs] = useState(() => localStorage.getItem("si_desktop_os") || "windows");

  const pickOs = (v) => {
    setDesktopOs(v);
    localStorage.setItem("si_desktop_os", v);
  };

  return (
    <div>
      <Group title="Theme colour" desc="The accent used for buttons, rings and highlights">
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {ACCENTS.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ accent: c.id })}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors ${
                settings.accent === c.id ? "border-white/45 bg-white/[0.1] text-white" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
              {c.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Background" desc="The moving layer behind every page">
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {BACKGROUNDS.map((b) => (
            <Pill key={b.key} active={settings.background === b.key} onClick={() => update({ background: b.key })}>
              {b.label}
            </Pill>
          ))}
        </div>
      </Group>

      <Group title="Feed density" desc="How much space each post takes">
        <SettingsRow title="Comfortable" desc="Roomy spacing, larger text">
          <Pill active={settings.density === "comfortable"} onClick={() => update({ density: "comfortable" })}>On</Pill>
        </SettingsRow>
        <SettingsRow title="Compact" desc="Fits more posts per screen">
          <Pill active={settings.density === "compact"} onClick={() => update({ density: "compact" })}>On</Pill>
        </SettingsRow>
      </Group>

      <Group title="Desktop system" desc="The look of the /desktop workspace">
        <SettingsRow title="Windows 11" desc="Centred acrylic taskbar, rounded windows">
          <Pill active={desktopOs === "windows"} onClick={() => pickOs("windows")}>Use</Pill>
        </SettingsRow>
        <SettingsRow title="macOS" desc="Glass menu bar, dock and traffic lights">
          <Pill active={desktopOs === "macos"} onClick={() => pickOs("macos")}>Use</Pill>
        </SettingsRow>
        <SettingsRow title="Open the desktop" desc="Try it with your chosen style">
          <Link to="/desktop" className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold hover:bg-white/10">
            <Monitor className="h-3.5 w-3.5" /> Open
          </Link>
        </SettingsRow>
      </Group>
    </div>
  );
}