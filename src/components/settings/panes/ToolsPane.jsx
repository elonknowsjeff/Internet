import React from "react";
import { Link } from "react-router-dom";
import { Clapperboard, Heart, ImagePlus, Music2, PenSquare, TrendingUp, Users } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import SettingsRow, { Group, Toggle, Pill } from "@/components/settings/SettingsRow";

const TAB_LABELS = {
  feed: "Feed", news: "News", dating: "Dating", eats: "Eats", rides: "Rides", shop: "Shop",
  market: "Market", finance: "Stocks", music: "Music", movies: "Movies", video: "Video",
  radio: "Radio", gaming: "Games", cloud: "Cloud", email: "Mail",
  sheets: "Sheets", calculator: "Calculator", calendar: "Calendar", browser: "Browser", assistant: "Assistant",
};

const CREATOR = [
  { label: "Creator Studio", to: "/studio", icon: TrendingUp, desc: "Reach & earnings" },
  { label: "Articles", to: "/articles", icon: PenSquare, desc: "Write & read" },
  { label: "Music studio", to: "/music", icon: Music2, desc: "Upload & beats" },
  { label: "AI images", to: "/assistant", icon: ImagePlus, desc: "Generate visuals" },
  { label: "Dating profile", to: "/dating", icon: Heart, desc: "Meet people" },
  { label: "Community", to: "/", icon: Users, desc: "Your feed" },
];

const UTILITIES = [
  { label: "Messages", to: "/messages" },
  { label: "Calendar", to: "/calendar" },
  { label: "Notes", to: "/notes" },
  { label: "Cloud", to: "/cloud" },
  { label: "Calculator", to: "/calculator" },
  { label: "Desktop", to: "/desktop" },
  { label: "Finance", to: "/finance" },
];

export default function ToolsPane() {
  const { settings, update, toggleTab, tabKeys } = useSettings();

  return (
    <div>
      <Group title="Panels" desc="Show or hide sections in the navigation">
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {tabKeys.map((k) => {
            const hidden = settings.hiddenTabs[k];
            return (
              <Pill key={k} active={!hidden} onClick={() => toggleTab(k)}>
                {TAB_LABELS[k] || k}
              </Pill>
            );
          })}
        </div>
      </Group>

      <Group title="Assistant" desc="The floating assistant across every page">
        <SettingsRow title="Floating AI assistant" desc="Show the button on top of your content">
          <Toggle
            on={!settings.hideFloatingAssistant}
            onClick={() => update({ hideFloatingAssistant: !settings.hideFloatingAssistant })}
            label="Floating AI assistant"
          />
        </SettingsRow>
      </Group>

      <Group title="Creator tools" desc="Everything for making and growing your content">
        <div className="grid grid-cols-2 gap-1.5 px-4 pb-4 sm:grid-cols-3">
          {CREATOR.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="rounded-xl border border-white/10 p-2.5 transition-colors hover:border-white/30 hover:bg-white/[0.05]"
            >
              <c.icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
              <p className="mt-1.5 text-[12px] font-semibold leading-tight">{c.label}</p>
              <p className="text-[10.5px] text-white/40">{c.desc}</p>
            </Link>
          ))}
        </div>
      </Group>

      <Group title="Utilities" desc="Jump straight into your tools">
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {UTILITIES.map((u) => (
            <Link key={u.to} to={u.to} className="rounded-full border border-white/12 px-3 py-1.5 text-[11.5px] font-semibold text-white/65 hover:bg-white/[0.07] hover:text-white">
              {u.label}
            </Link>
          ))}
        </div>
      </Group>
    </div>
  );
}